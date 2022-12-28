// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

"use strict";
const SAVED_STOPWATCHES = "save_stopwatches";
const SETTING_STOPWATCH_TRACKER_NAME = "stopwatch_tracker_name";
const SETTING_ALLOW_NAMES = "allow_names";
const SETTING_IMMEDIATELY_SAVE = "immediate_save";
const SETTING_AUTOSTART = "auto_start_stopwatch";
const SETTING_SHOW_ALERTS = "show_alerts";
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
function saveStopwatches(stopwatch_arr) {
    console.log(stopwatch_arr);
    plugin.storage.setItem(SAVED_STOPWATCHES, JSON.stringify(stopwatch_arr));
}
class Stopwatch {
    name;
    time_elapsed;
    is_running;
    currently_saved_millisec;
    after_stop;
    last_unpause_time;
    timer;
    constructor(name = "", after_stopwatch = null){
        this.name = name;
        this.time_elapsed = PetiteVue.reactive({
            value: 0
        });
        this.is_running = false;
        this.currently_saved_millisec = 0;
        this.after_stop = Array.isArray(after_stopwatch) ? after_stopwatch : [];
    }
    toString() {
        return `Stopwatch (${this.is_running}): => ${this.last_unpause_time}, ${this.currently_saved_millisec}`;
    }
    get milliseconds() {
        const now = new Date();
        const from_pause = this.last_unpause_time && now - this.last_unpause_time >= 1000 ? now - this.last_unpause_time : 0;
        return from_pause + this.currently_saved_millisec;
    }
    get time() {
        return msToHMS(this.milliseconds);
    }
    get formattedTime() {
        const [hours, minutes, seconds] = this.time.map((x)=>String(x).padStart(2, "0"));
        return `${hours}:${minutes}:${seconds}`;
    }
    get running() {
        return this.is_running;
    }
    get running_text() {
        return "Pause";
    }
    get not_running_text() {
        return this.time_elapsed.value == 0 ? "Start" : "Resume";
    }
    get clear_text() {
        return "Clear";
    }
    get save_text() {
        return "Save";
    }
    get reactive_formattedTime() {
        this.time_elapsed.value;
        return this.formattedTime;
    }
    pause() {
        const now = new Date();
        clearInterval(this.timer);
        this.currently_saved_millisec += now - this.last_unpause_time;
        this.last_unpause_time = now;
        this.is_running = false;
    }
    resume() {
        this.last_unpause_time = new Date();
        this.is_running = true;
        this.timer = setInterval(()=>{
            this.time_elapsed.value += 500;
        }, 500);
    }
    toggle() {
        this.is_running ? this.pause() : this.resume();
    }
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
    version: "0.9.5",
    addToCaptureMenu: true,
    addToMoreMenu: true,
    addToWidgets: true
});
const content = {
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
    },
    tryRunAlert (title, message) {
        if (this.settings.show_alerts.value) plugin.alert(title, message);
    },
    debugLog (...message) {
        console.log(...message);
    },
    initSettings () {
        for(const current_setting in this.settings){
            this.settings[current_setting].value = plugin.storage.getItem(this.settings[current_setting].storage_name) ?? this.settings[current_setting].value;
        }
    },
    checkedAction (item, action) {
        if (typeof item === "number") {
            const index = item;
            if (this.current_stopwatches[index]) {
                const stopwatch = this.current_stopwatches[index];
                action(stopwatch, index);
            } else {
                this.tryRunAlert("Invalid stopwatch index", `Expected a number between 0 and ${this.current_stopwatches.length - 1} (inclusive); got this instead: ${index}!`);
            }
        } else if (typeof item === "object") {
            const stopwatch1 = item;
            const index1 = this.current_stopwatches.indexOf(stopwatch1);
            if (index1 > -1) {
                action(stopwatch1, index1);
            } else {
                this.tryRunAlert("Invalid stopwatch", `Expected an active stopwatch!`);
            }
        }
    },
    toggleSettingSave (setting) {
        plugin.storage.setItem(setting.storage_name, setting.value);
        this.tryRunAlert(`${setting.title} Changed`, `Setting change to ${setting.value}.`);
    },
    stopwatchClassStyle (stopwatch) {
        return stopwatch.running;
    },
    initializeLoad (context) {
        const loaded_stopwatches = plugin.storage.getItem(SAVED_STOPWATCHES);
        console.log(loaded_stopwatches);
        if (loaded_stopwatches) {
            const parsed_stopwatches = JSON.parse(loaded_stopwatches);
            console.log(parsed_stopwatches);
            this.current_stopwatches = parsed_stopwatches || [];
        }
        this.stopwatch_name.value = plugin.storage.getItem(SETTING_STOPWATCH_TRACKER_NAME) ?? "#stopwatch";
        this.initSettings();
        console.log(`Plugin Initialized:\n Stopwatch plugin registered${context ? " inside of " + context : ""}`);
    },
    mounted () {
        plugin.onRegistered(async ()=>{
            await plugin.storage.init();
            this.initializeLoad("Registration");
        });
        plugin.onLaunch(async ()=>{
            await plugin.storage.init();
            this.initializeLoad("Launch");
        });
        plugin.onUIOpened(()=>this.initializeLoad("UI"));
        plugin.onWidget(()=>this.initializeLoad("Widget"));
        console.log("Mounted");
    },
    async stopwatch_add_new (using_stopwatch_template) {
        let stopwatch_name = "";
        if (this.settings.will_use_name.value) {
            const res = this.debug ? {
                value: "Debug Stopwatch Name Test"
            } : await plugin.prompt("Name Stopwatch", "What do you want to name your stopwatch?");
            if (res.value) {
                stopwatch_name = res.value;
            }
        }
        let stopwatch = null;
        if (using_stopwatch_template) {
            const stopwatch_template = this.debug ? {} : await plugin.selectTrackables(null, true);
            const trackers = stopwatch_template.map((track)=>{
                if (track.tracker && track.tracker.type === "timer") {
                    return track.tracker.include.split(" ").map((tracker)=>{
                        if (tracker.startsWith("#") || tracker.startsWith("@") || tracker.startsWith("+")) {
                            return tracker.split("(", 1)[0];
                        } else {
                            return tracker.id;
                        }
                    });
                }
                return track.id;
            }).flat();
            this.debugLog(trackers);
            stopwatch = new Stopwatch(stopwatch_name, trackers);
        } else {
            stopwatch = new Stopwatch(stopwatch_name);
        }
        this.current_stopwatches.push(stopwatch);
        if (this.settings.stopwatch_auto_start.value) stopwatch.resume();
        this.tryRunAlert(`New ${using_stopwatch_template ? "Specific" : "Custom"} Stopwatch created`, `A new stopwatch with name ${stopwatch_name} has been created!`);
        saveStopwatches(this.current_stopwatches);
    },
    stopwatch_clear (item) {
        this.checkedAction(item, async (_stopwatch, index)=>{
            let will_delete = this.debug ? {
                value: true
            } : await plugin.confirm("Are you sure you want to delete this stopwatch?", "You will not be able recovery it.");
            if (will_delete.value) {
                this.current_stopwatches.splice(index, 1);
                this.tryRunAlert("Stopwatch Deleted!", "The stopwatch has been deleted.");
            }
        });
        saveStopwatches(this.current_stopwatches);
    },
    stopwatch_save (index) {
        this.checkedAction(index, async (stopwatch, index)=>{
            const answers = [];
            for (const tracker of stopwatch.after_stop){
                const answer = this.debug ? {
                    note: "#DEBUG"
                } : await plugin.getTrackableInput(tracker);
                this.debugLog(tracker, answer);
                answers.push(answer);
            }
            const name = stopwatch.name ? ` from ${stopwatch.name},` : "";
            const answer_notes = " " + answers.map((tracker)=>tracker.note).join(" ");
            const final_note = {
                note: `${this.stopwatch_name.value}(${stopwatch.formattedTime})${name}${answer_notes}`,
                score: 0
            };
            this.current_stopwatches.splice(index, 1);
            this.settings.save_note_immediately.value ? plugin.createNote(final_note) : plugin.openNoteEditor(final_note);
        });
        saveStopwatches(this.current_stopwatches);
    },
    toggleSettingsPage () {
        this.settings_open = !this.settings_open;
    },
    async changeStopwatchTrackerName () {
        let res = this.debug ? {
            res: this.stopwatch_name.value + "!"
        } : await plugin.prompt("Stopwatch Tracker Name Change", "What would you like the stopwatch tracker name to be called? (defaults to #stopwatch)");
        if (res.value) {
            this.stopwatch_name.value = res.value || "#stopwatch";
            if (typeof this.stopwatch_name.value === "string") {
                this.stopwatch_name.value = this.stopwatch_name.value.startsWith('#') ? this.stopwatch_name.value : "#" + this.stopwatch_name.value;
            }
            plugin.storage.setItem(SETTING_STOPWATCH_TRACKER_NAME, this.stopwatch_name.value);
        }
    },
    async initStorage () {
        console.log(plugin);
        await plugin.storage.init().then(()=>this.initializeLoad("Init Storage"));
    }
};
PetiteVue.createApp(content).mount('#content');
console.log(`${plugin.pluginDetails.name} ${plugin.pluginDetails.version} Initialized`);
