"use strict";

const plugin = new NomiePlugin({
    name: "Stopwatch",
    emoji: "⏱",
    description: "Run a simple stopwatch based on your trackers",
    uses: [
        "createNote", // Create a new Note in Nomie
        "onLaunch", // Run on each launch of Nomie
        // "onNote", // Can listen for the note event - deactivate for now
        // "searchNotes", // May be used to search through notes - deactivate for now
        "getTrackable", // Get information about a specific tracker
        // "getTrackableUsage", // May be used to get the usage of a tracker - deactivate for now
        "selectTrackables", // Select a tracker or some set of trackers
        // "getLocation", // May be used if user allows location - deactivate for now
    ],
    version: "0.6.0", // Mostly follows SemVer
    addToCaptureMenu: true,
    addToMoreMenu: true,
    addToWidgets: true,
});

// Constant strings
const SAVED_STOPWATCHES = "save_stopwatches";
const SETTING_STOPWATCH_TRACKER_NAME = "stopwatch_tracker_name";
const SETTING_ALLOW_NAMES = "allow_names";
const SETTING_IMMEDIATELY_SAVE = "immediate_save";
const SETTING_AUTOSTART = "auto_start_stopwatch";
const SETTING_SHOW_ALERTS = "show_alerts";

// Helper functions
// Adapted from https://stackoverflow.com/questions/29816872/how-can-i-convert-milliseconds-to-hhmmss-format-using-javascript
function msToHMS(ms) {
    let seconds = ms / 1000;
    const hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;
    const minutes = parseInt(seconds / 60);
    seconds = seconds % 60;
    return [hours, minutes, parseInt(seconds)];
}

function saveStopwatches(stopwatch_arr) {
    plugin.storage.setItem(SAVED_STOPWATCHES, JSON.stringify(stopwatch_arr));
}

// Classes
class Stopwatch {
    constructor(name = "", after_stopwatch = null) {
        this.name = name;
        this.time_elapsed = PetiteVue.reactive({ value: 0 });
        this.is_running = false;
        this.currently_saved_millisec = 0;
        this.after_stop = Array.isArray(after_stopwatch) ? after_stopwatch : [];
    }

    toString() {
        return `Stopwatch (${this.is_running}): => ${this.last_unpause_time}, ${this.currently_saved_millisec}`;
    }

    get milliseconds() {
        const now = new Date();
        // Has a last unpaused time and difference is greater than 1 second
        const from_pause = this.last_unpause_time && (now - this.last_unpause_time) >= 1000 ? now - this.last_unpause_time : 0;
        return from_pause + this.currently_saved_millisec
    }

    get time() {
        return msToHMS(this.milliseconds);
    }

    get formattedTime() {
        let [hours, minutes, seconds] = this.time.map((x) => String(x).padStart(2, "0"));
        return `${hours}:${minutes}:${seconds}`
    }

    get running() {
        return this.is_running;
    }

    get running_text() {
        return "Pause"
    }

    get not_running_text() {
        return this.time_elapsed.value == 0 ? "Start" : "Resume"
    }

    get clear_text() {
        return "Clear";
    }

    get save_text() {
        return "Save";
    }

    get reactive_formattedTime() {
        let _ = this.time_elapsed.value;
        return this.formattedTime;
    }

    pause() {
        const now = new Date();
        clearInterval(this.timer);
        this.currently_saved_millisec += (now - this.last_unpause_time);
        this.last_unpause_time = now;
        this.is_running = false;
    }

    resume() {
        this.last_unpause_time = new Date();
        this.is_running = true;
        this.timer = setInterval(() => {
            this.time_elapsed.value += 500;
        }, 500);
    }
    toggle() {
        this.is_running ? this.pause() : this.resume();
    }
}

// Petite Vue Initialization
PetiteVue.createApp({
    // Fields
    current_stopwatches: [],
    debug: false,
    stopwatch_name: {
        storage_name: SETTING_STOPWATCH_TRACKER_NAME,
        value: "#stopwatch",
    },
    settings_open: false,
    settings: {
        will_use_name: {
            storage_name: SETTING_ALLOW_NAMES,
            value: false,
            activateTitle: "Allow Names",
            activateMessage: "You can now name you stopwatches",
            deactivateTitle: "Disallow Names",
            deactivateMessage: "You cannot name your stopwatches",
            get title() {
                return "Allow Naming Stopwatches";
            },
        },
        save_note_immediately: {
            storage_name: SETTING_IMMEDIATELY_SAVE,
            value: false,
            activateTitle: "Immediate Save",
            activateMessage: "Notes are now saved immediately",
            deactivateTitle: "Hold Save",
            deactivateMessage: "Notes can be edited before being saved",
            get title() {
                return "Save Notes Immediately";
            },
        },
        stopwatch_auto_start: {
            storage_name: SETTING_AUTOSTART,
            value: false,
            activateTitle: "Auto Start",
            activateMessage: "Stopwatches are started when created",
            deactivateTitle: "Manual Start",
            deactivateMessage: "Stopwatches are paused when created",
            get title() {
                return "Auto Start Stopwatches";
            },
        },
        show_alerts: {
            storage_name: SETTING_SHOW_ALERTS,
            value: true,
            activateTitle: "Show Alerts",
            activateMessage: "Showing all regular alerts",
            deactivateTitle: "Hide Alerts",
            deactivateMessage: "Hiding regular alert (other alerts will still happen)",
            get title() {
                return "Show General Alerts";
            },
        },
    },

    // Helper functions
    tryRunAlert(title, message) {
        if (this.show_alerts) plugin.alert(title, message);
    },
    debugLog(...message) {
        console.log(...message)
    },
    initSettings() {
        this.settings.forEach(current_setting => {
            // Try to get the saved item from storage if possible, or leave the current setting
            this.settings[current_setting].value = plugin.storage.getItem(this.settings[current_setting].storage_name) ?? this.settings[current_setting].value;
        });
    },
    checkedAction(item, action) {
        if (typeof item === "number") {
            const index = item;
            if (this.current_stopwatches[index]) {
                const stopwatch = this.current_stopwatches[index];
                action(stopwatch, index);
            }
            else {
                this.tryRunAlert("Invalid stopwatch index", `Expected a number between 0 and ${this.current_stopwatches.length - 1} (inclusive); got this instead: ${index}!`);
            }
        }
        else if (typeof item === "object") {
            const stopwatch = item;
            const index = this.current_stopwatches.indexOf(stopwatch);
            if (index > -1) {
                action(stopwatch, index);
            }
            else {
                this.tryRunAlert("Invalid stopwatch", `Expected an active stopwatch!`);
            }
        }
        else {
            this.tryRunAlert("Invalid Item", `Item provided is not valid: ${item.toString()}`);
        }
    },
    toggleSettingSave(setting) {
        plugin.storage.setItem(setting.storage_name, setting.value);
        this.tryRunAlert(
            setting.value ? setting.activateTitle : setting.deactivateTitle,
            setting.value ? setting.activateMessage : setting.deactivateMessage
        );
    },
    stopwatchClassStyle(stopwatch) {
        return stopwatch.running;
    },

    // Initialization
    async mounted() {
        plugin.onRegistered(async () => {
            await plugin.storage.init();
            // Assign all items if available or go with defaults
            debugLog(plugin.storage.getItem(SAVED_STOPWATCHES));
            debugLog(JSON.parse(plugin.storage.getItem(SAVED_STOPWATCHES)));
            this.current_stopwatches = JSON.parse(plugin.storage.getItem(SAVED_STOPWATCHES)) || [];
            this.stopwatch_name.value = plugin.storage.getItem(SETTING_STOPWATCH_TRACKER_NAME) ?? "#stopwatch";
            this.initSettings();
            this.tryRunAlert("Plugin Initialized", "Stopwatch plugin now registered and ready to use!");
        });
    },

    // Main page:
    // 1. Add a new stopwatch
    async stopwatch_add_new(using_stopwatch_template) {
        // Try to get the name if naming is allowed
        let stopwatch_name = "";
        if (this.settings.will_use_name.value) {
            let res = this.debug ? { value: "Debug Stopwatch Name Test" } : await plugin.prompt("Name Stopwatch", "What do you want to name your stopwatch?");
            if (res.value) {
                stopwatch_name = res.value;
            }
        }
        let stopwatch = null;
        // If using a stopwatch template, get the tracker info and create the stopwatch
        if (using_stopwatch_template) {
            const stopwatch_template = this.debug ? [] : await plugin.selectTrackables(null, true);
            this.debugLog(stopwatch_template);
            const trackers = stopwatch_template.map(track => {
                if (track.tracker && track.tracker.type === "timer") {
                    // Get each included tracker as name only, split by space
                    return track.tracker.include.split(" ").map(tracker => {
                        // If it is a tracker (#), person (@), or context (+); get just the name (without value, before '(')
                        if (tracker.startsWith("#") || tracker.startsWith("@") || tracker.startsWith("+")) {
                            return tracker.split("(", 1)[0];
                        }
                        else {
                            return tracker;
                        }
                    });
                }
                return track.id;
            }).flat();
            this.debugLog(trackers);
            stopwatch = new Stopwatch(stopwatch_name, trackers);
        }
        // Otherwise, just create the timer
        else {
            stopwatch = new Stopwatch(stopwatch_name, []);
        }
        this.current_stopwatches.push(stopwatch);
        // Auto start
        if (this.settings.stopwatch_auto_start.value) stopwatch.resume();
        // Show alert for new stopwatch and save the currently active ones 
        this.tryRunAlert(`New ${using_stopwatch_template ? "Specific" : "Custom"} Stopwatch created`, `A new stopwatch with name ${stopwatch_name} has been created!`);
        saveStopwatches(this.current_stopwatches);
    },
    // 2. Clear a stopwatch
    async stopwatch_clear(index) {
        this.checkedAction(index, async (stopwatch, index) => {
            // Ask to confirm deleting stopwatch
            let will_delete = this.debug ? { value: true } : await plugin.confirm("Are you sure you want to delete this stopwatch?", "You will not be able recovery it.");
            // If confirmed, delete the stopwatch at the specific index
            if (will_delete.value) {
                this.current_stopwatches.splice(index, 1);
                this.tryRunAlert("Stopwatch Deleted!", "The stopwatch has been deleted.");
            }
        });
        // Save the currently running stopwatches
        saveStopwatches(this.current_stopwatches);
    },
    // 3. Save a finished stopwatch
    async stopwatch_save(index) {
        this.checkedAction(index, async (stopwatch, index) => {
            // Get answers from any part of the tracker
            let answers = [];
            for (const tracker of stopwatch.after_stop) {
                let answer = this.debug ? { note: "#DEBUG" } : await plugin.getTrackableInput(tracker.id);
                this.debugLog(tracker, answer);
                answers.push(answer);
            }
            const name = stopwatch.name ? ` from ${stopwatch.name},` : "";
            const answer_notes = " " + answers.map(tracker => tracker.note).join(" ");
            const final_note = {
                note: `${this.stopwatch_name.value}(${stopwatch.formattedTime})${name}${answer_notes}`,
                score: 0,
            };
            this.current_stopwatches.splice(index, 1);
            this.settings.save_note_immediately.value
                ? plugin.createNote(final_note)
                : plugin.openNoteEditor(final_note);
        });
        // Save the currently running stopwatches
        saveStopwatches(this.current_stopwatches);
    },

    // Settings Page:
    toggleSettingsPage() {
        this.settings_open = !this.settings_open;
    },
    // 1. Change stopwatch tracker name
    async changeStopwatchTrackerName() {
        let res = this.debug ? { res: this.stopwatch_name.value + "!" } : await plugin.prompt("Stopwatch Tracker Name Change", "What would you like the stopwatch tracker name to be called? (defaults to #stopwatch)");
        if (res.value) {
            this.stopwatch_name.value = res.value || "#stopwatch";
            // Prepend "#" if not already there
            this.stopwatch_name.value = this.stopwatch_name.value.startsWith('#') ? this.stopwatch_name.value : "#" + this.stopwatch_name.value;
            plugin.storage.setItem(SETTING_STOPWATCH_TRACKER_NAME, this.stopwatch_name.value);
        }
    },
}).mount('#content')