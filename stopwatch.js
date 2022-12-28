"use strict";
const SAVED_STOPWATCHES = "save_stopwatches";
const SETTING_STOPWATCH_TRACKER_NAME = "stopwatch_tracker_name";
const SETTING_ALLOW_NAMES = "allow_names";
const SETTING_IMMEDIATELY_SAVE = "immediate_save";
const SETTING_AUTOSTART = "auto_start_stopwatch";
const SETTING_SHOW_ALERTS = "show_alerts";
// Convert milliseconds into Hours, Minutes, Seconds in an array
function msToHMS(ms) {
    let seconds = ms / 1000;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return [
        hours,
        minutes,
        seconds
    ];
}
// Save stopwatches to the plugin storage
function saveStopwatches(stopwatch_arr) {
    console.log(stopwatch_arr);
    plugin.storage.setItem(SAVED_STOPWATCHES, JSON.stringify(stopwatch_arr));
}
class Stopwatch {
    name;
    time_elapsed;
    is_running;
    currently_saved_millisec;
    last_unpause_time;
    after_stop;
    timer;
    constructor(name = "", after_stopwatch = null, time_elapsed = 0, currently_saved_millisec = 0, update_speed = 500, is_running = false, last_unpause_time = null) {
        this.name = name;
        this.time_elapsed = time_elapsed;
        this.update_speed = update_speed;
        this.is_running = is_running;
        this.currently_saved_millisec = currently_saved_millisec;
        this.last_unpause_time = last_unpause_time ? new Date(last_unpause_time): new Date();
        this.after_stop = Array.isArray(after_stopwatch) ? after_stopwatch : [];
    }
    toString() {
        return `Stopwatch (${this.is_running}): => ${this.last_unpause_time}, ${this.currently_saved_millisec}`;
    }
    get milliseconds() {
        const now = new Date();
        const from_pause = this.timer && now - this.last_unpause_time >= 1000 ? now - this.last_unpause_time : 0;
        return from_pause + this.currently_saved_millisec;
    }
    get time() {
        return msToHMS(this.milliseconds);
    }
    get formattedTime() {
        const [hours, minutes, seconds] = this.time.map((x) => String(x).padStart(2, "0"));
        return `${hours}:${minutes}:${seconds}`;
    }
    get running() {
        return this.is_running;
    }
    get running_text() {
        return "Pause";
    }
    get not_running_text() {
        return this.time_elapsed == 0 ? "Start" : "Resume";
    }
    get clear_text() {
        return "Clear";
    }
    get save_text() {
        return "Save";
    }
    get reactive_formattedTime() {
        this.time_elapsed;
        return this.formattedTime;
    }
    pause() {
        const now = new Date();
        clearInterval(this.timer);
        this.currently_saved_millisec += now - this.last_unpause_time;
        this.last_unpause_time = now;
        this.is_running = false;
        this.timer = null;
    }
    resume() {
        this.last_unpause_time = new Date();
        this.is_running = true;
        this.timer = setInterval(() => {
            this.time_elapsed += this.update_speed;
        }, this.update_speed);
    }
    toggle() {
        this.is_running ? this.pause() : this.resume();
    }
    // save(){
    //     return JSON.stringify({});
    // }
    // load(obj):{
    //     return new {
    //         name: this.name,
    //         time_elapsed: this.time_elapsed,
    //         is_running: this.is_running,
    //         currently_saved_millisec: this.currently_saved_millisec,
    //         last_unpause_time: this.last_unpause_time,
    //         after_stop: this.after_stop,
    //     };
    // }
}
const plugin = new NomiePlugin({
    name: "Stopwatch",
    emoji: "⏱",
    description: "Run a simple stopwatch based on your trackers",
    uses: [
        "createNote",
        "onLaunch",
        "onUIOpened",
        "onWidget",
        "selectTrackables"
    ],
    version: "0.10.6",
    addToCaptureMenu: true,
    addToMoreMenu: true,
    addToWidgets: true
});

new Vue({
    data() {
        return {
            current_stopwatches: [],
            debug: false,
            settings_open: false,
            settings: {
                will_use_name: {
                    title: "Allow Naming Stopwatches",
                    storage_name: SETTING_ALLOW_NAMES,
                    value: false
                },
                save_note_immediately: {
                    title: "Save Notes Immediately",
                    storage_name: SETTING_IMMEDIATELY_SAVE,
                    value: false
                },
                stopwatch_auto_start: {
                    title: "Auto Start Stopwatches",
                    storage_name: SETTING_AUTOSTART,
                    value: false
                },
                show_alerts: {
                    title: "Show General Alerts",
                    storage_name: SETTING_SHOW_ALERTS,
                    value: true
                }
            },
            stopwatch_name: {
                title: "Default Stopwatch",
                storage_name: SETTING_STOPWATCH_TRACKER_NAME,
                value: "#stopwatch"
            }
        };
    },
    async mounted() {
        // When Plugin is first registered
        plugin.onRegistered(async () => {
            await plugin.storage.init();
            this.initializeLoad("Registration");
        });
        // When Object is launched
        plugin.onLaunch(() => this.initializeLoad("Launch"))

        // When UI is opened
        plugin.onUIOpened(() => this.initializeLoad("UI"))

        // When Widget is opened
        plugin.onWidget(() => this.initializeLoad("Widget"))
    },
    methods: {
        tryRunAlert(title, message) {
            if (this.settings.show_alerts.value) plugin.alert(title, message);
        },
        initSettings() {
            for (const current_setting in this.settings) {
                this.settings[current_setting].value = plugin.storage.getItem(this.settings[current_setting].storage_name) ?? this.settings[current_setting].value;
            }
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
        },
        toggleSettingSave(setting) {
            plugin.storage.setItem(setting.storage_name, setting.value);
            this.tryRunAlert(
                `${setting.title} Changed`,
                `Setting change to ${setting.value}.`,
            );
        },
        stopwatchClassStyle(stopwatch) {
            return stopwatch.running;
        },
        loadStopwatches(){
            const loaded_stopwatches = plugin.storage.getItem(SAVED_STOPWATCHES);
            if (loaded_stopwatches) {
                const parsed_stopwatches = JSON.parse(loaded_stopwatches);
                this.current_stopwatches = parsed_stopwatches?.map(stopwatch_info => new Stopwatch(stopwatch_info.name, stopwatch_info.after_stop, stopwatch_info.time_elapsed, stopwatch_info.currently_saved_millisec, stopwatch_info.update_speed, stopwatch_info.is_running)) || [];
            }
            for (const stopwatch of this.current_stopwatches) {
                if (stopwatch.running) {
                    stopwatch.resume();
                }
            }
        },
        initializeLoad(context) {
            // Assign all items if available or go with defaults
            this.stopwatch_name.value = plugin.storage.getItem(SETTING_STOPWATCH_TRACKER_NAME) ?? "#stopwatch";
            this.loadStopwatches();
            this.initSettings();
            console.log(`Plugin Initialized:\n Stopwatch plugin registered${context ? " inside of " + context : ""}`);
        },
        async get_stopwatch_name(){
            if (this.settings.will_use_name.value) {
                const res = this.debug ? { value: "Debug Stopwatch Name Test" } : await plugin.prompt("Name Stopwatch", "What do you want to name your stopwatch?");
                if (res.value) {
                    return res.value;
                }
            }
            return "";
        },
        async produce_stopwatch(using_stopwatch_template, stopwatch_name){
            // If using a stopwatch template, get the tracker info and create the stopwatch
            if (using_stopwatch_template) {
                const stopwatch_template = this.debug
                    ? {}
                    : await plugin.selectTrackables(null, true);
                const trackers = stopwatch_template.map((track) => {
                    if (track.tracker && track.tracker.type === "timer") {
                        // Get each included tracker as name only, split by space
                        return track.tracker.include.split(" ").map((tracker) => {
                            // If it is a tracker (#), person (@), or context (+); get just the name (without value, before '(')
                            if (tracker.startsWith("#") || tracker.startsWith("@") || tracker.startsWith("+")) {
                                return tracker.split("(", 1)[0];
                            }
                            else {
                                return tracker.id;
                            }
                        });
                    }
                    return track.id;
                }).flat();
                this.debugLog(trackers);
                return new Stopwatch(stopwatch_name, trackers);
            }
            // Otherwise, just create the timer
            return new Stopwatch(stopwatch_name);
        },
        async stopwatch_add_new(using_stopwatch_template) {
            // Try to get the name if naming is allowed
            const stopwatch_name = await this.get_stopwatch_name();
            // Produce the stopwatch
            const stopwatch = await this.produce_stopwatch(using_stopwatch_template, stopwatch_name);
            // Add it to the currently active stopwatches
            this.current_stopwatches.push(stopwatch);
            // Auto start if it needs to
            if (this.settings.stopwatch_auto_start.value) stopwatch.resume();
            // Show alert for new stopwatch and save the currently active ones 
            this.tryRunAlert(`New ${using_stopwatch_template ? "Specific" : "Custom"} Stopwatch created`, `A new stopwatch with name ${stopwatch_name} has been created!`);
            saveStopwatches(this.current_stopwatches);
        },
        // 2. Clear a stopwatch
        stopwatch_clear(item) {
            this.checkedAction(item, async (_stopwatch, index) => {
                // Ask to confirm deleting stopwatch
                let will_delete = this.debug ? { value: true } : await plugin.confirm("Are you sure you want to delete this stopwatch?", "You will not be able recovery it.");
                // If confirmed, delete the stopwatch at the specific index
                if (will_delete.value) {
                    this.current_stopwatches.splice(index, 1);
                    this.tryRunAlert("Stopwatch Deleted!", "The stopwatch has been deleted.");
                }
                // Save the currently running stopwatches
                saveStopwatches(this.current_stopwatches);
            });
        },
        // 3. Save a finished stopwatch
        stopwatch_save(index) {
            this.checkedAction(index, async (stopwatch, index) => {
                // Get answers from any part of the tracker
                const answers = [];
                for (const tracker of stopwatch.after_stop) {
                    const answer = this.debug ? { note: "#DEBUG" } : await plugin.getTrackableInput(tracker);
                    this.debugLog(tracker, answer);
                    answers.push(answer);
                }
                const name = stopwatch.name ? ` from ${stopwatch.name},` : "";
                const answer_notes = " " + answers.map((tracker) => tracker.note).join(" ");
                const final_note = {
                    note: `${this.stopwatch_name.value}(${stopwatch.formattedTime})${name}${answer_notes}`,
                    score: 0,
                };
                this.current_stopwatches.splice(index, 1);
                this.settings.save_note_immediately.value
                    ? plugin.createNote(final_note)
                    : plugin.openNoteEditor(final_note);
                // Save the currently running stopwatches
                saveStopwatches(this.current_stopwatches);
            });
        },
        //#endregion

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
                if (typeof this.stopwatch_name.value === "string") {
                    this.stopwatch_name.value = this.stopwatch_name.value.startsWith('#') ? this.stopwatch_name.value : "#" + this.stopwatch_name.value;
                }
                plugin.storage.setItem(SETTING_STOPWATCH_TRACKER_NAME, this.stopwatch_name.value);
            }
        },
    }
}).$mount('#content');
console.log(`${plugin.pluginDetails.name} ${plugin.pluginDetails.version} Initialized`);
