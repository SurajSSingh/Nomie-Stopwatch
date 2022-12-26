"use strict";

const plugin = new NomiePlugin({
    name: "Stopwatch",
    emoji: "⏱",
    description: "Run a simple stopwatch based on your trackers",
    uses: [
        "createNote", // Create a new Note in Nomie
        "onLaunch", // Run on each launch of Nomie
        // "onNote",
        // "searchNotes",
        "getTrackable", // Get a specific tracker
        // "getTrackableUsage", // Get the usage of a tracker
        "selectTrackables", // Select a tracker or some set of trackers
        // "getLocation",
    ],
    version: "0.3.1", // Mostly follows SemVer
    addToCaptureMenu: true,
    addToMoreMenu: true,
    addToWidgets: true,
});

// Constant strings
const SAVED_STOPWATCHES = "save_stopwatches";
const SETTING_STOPWATCH_TRACKER_NAME = "stopwatch_tracker_name";
const SETTING_ALLOW_NAMES = "allow_names";
const SETTING_IMMEDIATELY_SAVE = "immediate_save";

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
        this.time_elapsed = 0;
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
        return this.time_elapsed == 0 ? "Start" : "Resume"
    }

    get clear_text() {
        return "Clear";
    }

    get save_text() {
        return "Save";
    }

    reactive_formattedTime() {
        let x = this.time_elapsed;
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
            this.time_elapsed += 500;
        }, 500);
    }

}

// Petite Vue Initialization
PetiteVue.createApp({
    current_stopwatches: [],
    will_use_name: false,
    save_note_immediately: false,
    stopwatch_name: "#stopwatch",
    settings_open: false,
    // Initialization
    async mounted() {
        plugin.onRegistered(async () => {
            await plugin.storage.init();
            this.current_stopwatches = JSON.parse(plugin.storage.getItem(SAVED_STOPWATCHES)) ?? [];
            this.will_use_name = plugin.storage.getItem(SAVED_STOPWATCHES);
            this.save_note_immediately = plugin.storage.getItem(SETTING_IMMEDIATELY_SAVE);
            this.stopwatch_name = plugin.storage.getItem(SETTING_STOPWATCH_TRACKER_NAME);
        });
    },

    // Main page:
    // 1. Add a new stopwatch
    async stopwatch_add_new(will_use_trackers = false) {
        let stopwatch_name = "";
        if (this.will_use_name) {
            let res = await plugin.prompt("Name Stopwatch", "What do you want to name your stopwatch?");
            if (res.value) {
                stopwatch_name = res.value;
            }
        }

        if (will_use_trackers) {
            const trackers = await plugin.selectTrackables(null, true);
            this.current_stopwatches.push(new Stopwatch(stopwatch_name, trackers));
        }
        else {
            this.current_stopwatches.push(new Stopwatch(stopwatch_name, []));
        }
        plugin.alert(`New ${will_use_trackers ? "Specific" : "General"} Stopwatch created`, `A new stopwatch with name ${stopwatch_name} has been created!`);
        saveStopwatches(this.current_stopwatches);
    },
    // 2. Clear a stopwatch
    async stopwatch_clear(index) {
        if (this.current_stopwatches[index]) {
            let will_delete = await plugin.confirm("Are you sure you want to delete this stopwatch?", "You will not be able recovery it.");
            if (will_delete.value) {
                this.current_stopwatches.splice(index, 1);
                plugin.alert("Stopwatch Deleted!", "The stopwatch has been deleted.");
            }
        }
        else {
            plugin.alert("Invalid stopwatch index", `Expected a number between 0 and ${this.current_stopwatches.length - 1} (inclusive); got this instead: ${index}`);
        }
        saveStopwatches(this.current_stopwatches);
    },
    // 3. Save a finished stopwatch
    async stopwatch_save(index) {
        if (this.current_stopwatches[index]) {
            let stopwatch = this.current_stopwatches[index];
            console.log(stopwatch, stopwatch.after_stop);
            let answer = await Promise.all(stopwatch.after_stop.map(async tracker => {
                console.log(tracker);
                await plugin.getTrackableInput(tracker.id);
            }));
            console.log(answer, answer.toString());
            const name = stopwatch.name ? ` from ${stopwatch.name},` : "";
            const resulting_note = `${this.stopwatch_name}(${stopwatch.formattedTime})${name} `;
            if (this.save_note_immediately) {
                plugin.createNote({
                    note: resulting_note,
                    score: 0,
                })
            }
            else {
                plugin.openNoteEditor({
                    note: resulting_note,
                    score: 0,
                })
            }
            this.current_stopwatches.splice(index, 1);
        }
        else {
            plugin.alert("Invalid stopwatch index", `Expected a number between 0 and ${this.current_stopwatches.length - 1} (inclusive); got this instead: ${index}`);
        }
        saveStopwatches(this.current_stopwatches);
    },

    // Settings Page:
    toggleSettingsPage() {
        this.settings_open = !this.settings_open;
    },
    // 1. Change stopwatch tracker name
    async changeStopwatchTrackerName() {
        let res = await plugin.prompt("Stopwatch Tracker Name Change", "What would you like the stopwatch tracker name to be called? (defaults to #stopwatch)");
        if (res.value) {
            // Prepend "#" if not already there
            const new_name = new_name.startsWith('#') ? res.value : "#" + res.value;
            this.stopwatch_name = res.value || "#stopwatch";
            plugin.storage.setItem(SETTING_STOPWATCH_TRACKER_NAME, this.stopwatch_name);
        }
    },
    // 2. Allow naming stopwatches
    changeAllowNamingStopwatches(event) {
        plugin.storage.setItem(SETTING_ALLOW_NAMES, this.will_use_name);
        const title = this.will_use_name ? "Allowing Names" : "Disallowing Names";
        const message = this.will_use_name ? "You can now name you stopwatches!" : "You cannot name your stopwatches.";
        plugin.alert(title, message);
    },
    // 3. Allow saving notes immediately
    changeSavingNotesImmediately(event) {
        plugin.storage.setItem(SETTING_ALLOW_NAMES, this.save_note_immediately);
        const title = this.save_note_immediately ? "Save Immediately" : "Show Notes";
        const message = this.save_note_immediately ? "Your stopwatch notes will be saved immediately." : "Your stopwatch notes will show up and allow you to edit.";
        plugin.alert(title, message);
    },
    // 4. Add stopwatch templates
    // 5. Remove stopwatch template
}).mount('#content')