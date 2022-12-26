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
    version: "0.2.0", // Mostly follows SemVer
    addToCaptureMenu: true,
    addToMoreMenu: true,
    addToWidgets: true,
});

// Constant strings
const SAVED_STOPWATCHES = "save_stopwatches";

// Enums
const stopwatch_state = {
    RUNNING: "running",
    PAUSED: "paused",
    STOPPED: "stopped",
};

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

// Classes
class Stopwatch {
    constructor(after_stopwatch) {
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
        // console.log(now, this.last_unpause_time, this.currently_saved_millisec);
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
    // Initialization
    async mounted() {
        plugin.onRegistered(async () => {
            await plugin.storage.init();
            this.current_stopwatches = plugin.storage.getItem(SAVED_STOPWATCHES) ?? [];
        });
    },

    // Main page:
    // 1. Add a new stopwatch
    stopwatch_add_new(will_use_trackers = false) {
        if (will_use_trackers) {
            const trackers = plugin.selectTrackables(null, true);
            this.current_stopwatches.push(new Stopwatch(trackers));
        }
        else {
            this.current_stopwatches.push(new Stopwatch([]));
        }
        plugin.alert(`New ${will_use_trackers ? "Specific" : "General"} Stopwatch started`, "A new stopwatch has started!");
        plugin.storage.setItem(SAVED_STOPWATCHES, this.current_stopwatches);
    },
    // 2. Clear a stopwatch
    stopwatch_clear(index) {
        if (this.current_stopwatches[index]) {
            this.current_stopwatches.splice(index, 1);
        }
        else {
            plugin.alert("Invalid stopwatch index", `Expected a number between 0 and ${this.current_stopwatches.length - 1} (inclusive); got this instead: ${index}`);
        }
        plugin.storage.setItem(SAVED_STOPWATCHES, this.current_stopwatches);
    },
    // 3. Save a finished stopwatch
    stopwatch_save(index) {
        if (this.current_stopwatches[index]) {
            let stopwatch = this.current_stopwatches[index];
            plugin.openNoteEditor({
                note: `#stopwatch(${stopwatch.formattedTime})`,
                score: 3,
            })
            this.current_stopwatches.splice(index, 1);
        }
        else {
            plugin.alert("Invalid stopwatch index", `Expected a number between 0 and ${this.current_stopwatches.length - 1} (inclusive); got this instead: ${index}`);
        }
        plugin.storage.setItem(SAVED_STOPWATCHES, this.current_stopwatches);
    },

    // Settings Page:
    // 1. Change default stopwatch tracker
    // 2. Add/Remove stopwatch templates
}).mount('#content')