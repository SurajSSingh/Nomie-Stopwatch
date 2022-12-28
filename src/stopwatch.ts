"use strict";

// #region Generate Code
// GENERATED from: https://github.com/open-nomie/plugins/blob/master/src/v1/plugin-connect.ts using https://www.typescriptlang.org/
type PluginUseTypes = "trackablesSelected" | "selectTrackables" | "onUIOpened" | "openNoteEditor" | "onWidget" | "registered" | "onLaunch" | "openURL" | "openPlugin" | "searchNotes" | "searchReply" | "confirmReply" | "promptReply" | "onNote" | "createNote";
 type PluginType = {
    id?: string;
    name: string;
    description?: string;
    emoji?: string;
    addToCaptureMenu: boolean;
    addToMoreMenu: boolean;
    url?: string;
    version: string;
    active?: boolean;
    uses: Array<PluginUseTypes>;
    error?: string;
    addToWidgets: boolean;
};
type getTrackableUsageProps = {
    tag: string;
    date?: Date;
    daysBack?: number;
    groupByDay?: boolean;
};
type UserPrefs = {
    use24Hour?: boolean;
    useMetric?: boolean;
    useLocation?: boolean;
    weekStarts: "monday" | "sunday";
    theme: "dark" | "light" | "system";
};
 declare class NomiePlugin {
    pluginDetails: PluginType;
    registered: boolean;
    pid: undefined | string;
    lid: undefined | string;
    listeners: any;
    ready: boolean;
    storage: any;
    prefs?: UserPrefs;
    constructor(starter: PluginType);
    /**
     * It returns a promise that resolves to an array of notes
     * @param {string} term - The search term
     * @param date - The date to search from.
     * @param [daysBack=7] - How many days back to search.
     * @returns A promise that resolves to an array of notes.
     */
    searchNotes(term: string, date?: Date, daysBack?: number): Promise<unknown>;
    openNoteEditor(note: any): void;
    /**
     * It returns a promise that resolves to an array of trackables
     * @param {any} type - The type of trackable to select. This can be a string or an array of strings.
     * @param [multiple=true] - boolean - whether or not to allow multiple trackables to be selected
     * @returns A promise that resolves to an array of trackables.
     */
    selectTrackables(type: any, multiple?: boolean): Promise<Array<any>>;
    /**
     * It returns a promise that resolves to an array of trackables.
     * @param {'tracker' | 'context' | 'person'} type - 'tracker' | 'context' | 'person'
     * @returns A promise that resolves to an array of trackables.
     */
    selectTrackable(type: 'tracker' | 'context' | 'person'): Promise<any>;
    /**
     * If the prefs object is not null, return the value of the use24Hour property
     * @returns The value of the use24Hour property of the prefs object.
     */
    get is24Hour(): boolean | undefined;
    /**
     * If the prefs object is not null, return the value of the useMetric property
     * @returns A boolean value that is the value of the useMetric property of the prefs object.
     */
    get isMetric(): boolean | undefined;
    /**
     * If the log is a string, then broadcast a createNote event with a note property set to the log.
     * Otherwise, broadcast a createNote event with the log as the payload
     * @param {any} log - any - This is the log that will be sent to the client.
     */
    createNote(log: any): void;
    openURL(url: string, title: string): void;
    _fireListeners(key: string, payload: any): void;
    /**
     * It listens for messages from the native app, and then fires the appropriate listener function
     * @param {any} event - any
     */
    onMessage(event: any): void;
    /**
     * It takes a string and returns a string
     * @param {string} type - The type of the element.
     * @returns A string that is a combination of the type and a random number.
     */
    private toId;
    /**
     * It adds a listener to the `listeners` object, which is a property of the `WebSocketService` class
     * @param {string} id - The id of the request.
     * @param {any} resolver - The function that will be called when the response is received.
     */
    private addResponseListener;
    /**
     * It returns a promise that resolves to the location data when the location data is available
     * @returns A promise that resolves to the location data.
     */
    getLocation(): Promise<any>;
    /**
     * It returns a promise that resolves to a trackable object.
     * @param {string} tag - The tag of the trackable you want to get.
     * @returns A promise that resolves to the trackable object.
     */
    getTrackable(tag: string): Promise<unknown>;
    /**
     * "Get the value of a trackable input with the given tag."
     *
     * The first thing we do is create a promise. This is a promise that will be resolved with the value
     * of the trackable input
     * @param {string} tag - The tag of the trackable input you want to get the value of.
     * @returns A promise that resolves to the value of the trackable input.
     */
    getTrackableInput(tag: string): Promise<unknown>;
    /**
     * `getTrackableUsage` is a function that returns a promise that resolves to an array of objects.
     * Each object has a `date` property and a `count` property. The `date` property is a date object.
     * The `count` property is a number
     * @param {getTrackableUsageProps} props - {
     * @returns A promise that resolves to the usage data.
     */
    getTrackableUsage(props: getTrackableUsageProps): Promise<unknown>;
    /**
     * The function returns a promise that resolves to the value of the input field
     * @param {string} title - The title of the prompt
     * @param {string} [message] - The message to display in the prompt.
     * @param {string} [type] - string - The type of prompt. This can be 'confirm' or 'prompt'.
     * @returns A promise.
     */
    prompt(title: string, message?: string, type?: string): Promise<unknown>;
    alert(title: string, message?: string): Promise<unknown>;
    openTemplateURL(url: string): void;
    /**
     * The function returns a promise that resolves when the user clicks the confirm button
     * @param {string} title - The title of the modal
     * @param {string} [message] - The message to be displayed in the dialog.
     * @returns A promise.
     */
    confirm(title: string, message?: string): Promise<unknown>;
    /**
     * If the listener exists, resolve the promise with the payload, and delete the listener
     * @param {any} payload - any
     */
    listenerResponse(payload: any): void;
    /**
     * It broadcasts a message to the main process, and then waits for a response
     * @param {string} key - The key to get the value of
     * @returns A promise that resolves to the value of the key in the storage.
     */
    getStorageItem(key: string): Promise<any>;
    /**
     * It broadcasts a message to the main process, and then waits for a response from the main process
     * @param {string} key - The key to store the value under
     * @param {any} value - any - The value to set the storage item to.
     * @returns A promise that resolves to the value of the key in storage.
     */
    setStorageItem(key: string, value: any): Promise<unknown>;
    /**
     * It takes an action and a payload, and sends a message to the parent window with the action and
     * payload
     * @param {string} action - The action to be performed.
     * @param {any} payload - any - This is the data that you want to send to the parent window.
     */
    broadcast(action: string, payload: any): void;
    /**
     * It returns the value of the pid query parameter in the URL, or undefined if it doesn't exist
     * @returns The pid of the current page.
     */
    getPid(): string | undefined;
    /**
     * It adds a listener to the event 'onUIOpened'
     * @param {Function} func - Function - The function to be called when the event is triggered.
     */
    onUIOpened(func: Function): () => void;
    /**
     * A function that takes a function as an argument and returns a function.
     * @param {Function} func - Function - The function to be called when the event is triggered.
     * @returns A function that removes the event listener.
     */
    onWidget(func: Function): () => void;
    /**
     * The function takes a function as an argument and calls the on function with the event name and the
     * function as arguments
     * @param {Function} func - Function - The function to be called when the event is triggered.
     */
    onNote(func: Function): () => void;
    /**
     * The function takes a function as an argument and calls the on function with the event name
     * onLaunch and the function as the argument
     * @param {Function} func - Function
     */
    onLaunch(func: Function): () => void;
    /**
     * The function takes a function as an argument and calls the on function with the event name and the
     * function as arguments
     * @param {Function} func - Function - The function to be called when the event is triggered.
     */
    onRegistered(func: Function): () => void;
    /**
     * It takes an event name and a function as arguments, and adds the function to the array of
     * listeners for that event name
     * @param {string} eventName - The name of the event you want to listen for.
     * @param {Function} func - The function to be called when the event is triggered.
     */
    on(eventName: string, func: Function): void;
    /**
     * It removes a function from the array of functions that are called when an event is triggered
     * @param {string} name - The name of the event.
     * @param {Function} func - The function to be called when the event is triggered.
     */
    off(name: string, func: Function): () => void;
    /**
     * If the plugin hasn't been registered, then broadcast the plugin details to the parent window
     */
    register(): void;
}
 declare class NomieStorage {
    plugin: NomiePlugin;
    data: any;
    filename: string;
    constructor(plugin: NomiePlugin, filename?: string);
    /**
     * > The `init` function loads the data from the storage plugin and sets the `data` property
     * @returns The NomieStorage object
     */
    init(): Promise<NomieStorage>;
    /**
     * It returns the value of the key in the data object
     * @param {string} key - The key of the item to get.
     * @returns The value of the key in the data object.
     */
    getItem(key: string): any;
    /**
     * It sets the value of the key in the data object, and then saves the data object to the file
     * @param {string} key - The key of the item to set.
     * @param {any} value - any
     * @returns The promise that is returned from the save() method.
     */
    setItem(key: string, value: any): Promise<unknown>;
    /**
     * It saves the data to the file
     * @returns The promise from the plugin.
     */
    private save;
}
// #endregion

// #region Setup Code
// Petite Vue loaded from index.html
declare const PetiteVue: any;

// Constant strings
const SAVED_STOPWATCHES = "save_stopwatches";
const SETTING_STOPWATCH_TRACKER_NAME = "stopwatch_tracker_name";
const SETTING_ALLOW_NAMES = "allow_names";
const SETTING_IMMEDIATELY_SAVE = "immediate_save";
const SETTING_AUTOSTART = "auto_start_stopwatch";
const SETTING_SHOW_ALERTS = "show_alerts";

// Helper functions
// Adapted from https://stackoverflow.com/questions/29816872/how-can-i-convert-milliseconds-to-hhmmss-format-using-javascript
function msToHMS(ms: number) {
    let seconds = ms / 1000;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return [hours, minutes, seconds];
}

function saveStopwatches(stopwatch_arr: Stopwatch[]) {
    console.log(stopwatch_arr);
    plugin.storage.setItem(SAVED_STOPWATCHES, JSON.stringify(stopwatch_arr));
}

// Types, Interfaces, and Classes
type Primitive = string | number | boolean;
type Dictionary<T> = Record<string, T>
type Setting<Value extends Primitive> = {
    readonly title: string,
    storage_name: string,
    value: Value,
};
interface ValueObject<Value>{
    [key: string]: any,
    value: Value
}
type ContentType = {
    current_stopwatches: Stopwatch[],
    debug: boolean,
    settings: Dictionary<Setting<Primitive>>,
    settings_open:boolean,
    stopwatch_name: Setting<string>,
}
interface ContentHelperFunctionality {
    tryRunAlert(title: string, message?: string): void,
    debugLog(...message: any[]): void,
    initSettings(): void,
    checkedAction(item: number | Stopwatch, action: (stopwatch: Stopwatch, index: number) => void): void,
    toggleSettingSave(setting: Setting<boolean>): void,
    stopwatchClassStyle(stopwatch: Stopwatch): boolean,
    initializeLoad(context?: string): void,
}
interface ContentVueFunctionality {
    mounted(): void,
}
interface StopwatchFunctionality{
    stopwatch_add_new(using_stopwatch_template: boolean): Promise<void>;
    stopwatch_clear(item: number | Stopwatch): void;
    stopwatch_save(item: number | Stopwatch): void;
}
interface SettingFunctionality{
    toggleSettingsPage(): void;
    changeStopwatchTrackerName(): Promise<void>
    initStorage(): Promise<void>
}


class Stopwatch {
    name: string;
    time_elapsed: any;
    is_running: boolean;
    currently_saved_millisec: number;
    after_stop: any[];
    last_unpause_time!: Date;
    timer!: number;

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
        // @ts-expect-error DateTime object subtraction not yet supported
        // TODO: Refactor to remove above TS error
        const from_pause = this.last_unpause_time && (now - this.last_unpause_time) >= 1000 ? now - this.last_unpause_time : 0;
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
        return this.time_elapsed.value == 0 ? "Start" : "Resume";
    }

    get clear_text() {
        return "Clear";
    }

    get save_text() {
        return "Save";
    }

    get reactive_formattedTime() {
        // Evaluate elapsed time and throwaway the value
        const _ = this.time_elapsed.value;
        return this.formattedTime;
    }

    pause() {
        const now = new Date();
        clearInterval(this.timer);
        // @ts-expect-error DateTime object subtraction not yet supported
        // TODO: Refactor to remove above TS error
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
//#endregion

// Init
const plugin = new NomiePlugin({
    name: "Stopwatch",
    emoji: "⏱",
    description: "Run a simple stopwatch based on your trackers",
    uses: [
        "createNote", // Create a new Note in Nomie
        "onLaunch", // Run on each launch of Nomie
        "onUIOpened", // Runs when UI is opened
        "onWidget", // Runs when widget is opened
        "selectTrackables", // Select a tracker or some set of trackers
        // "onNote", // Can listen for the note event - deactivate for now
        // "searchNotes", // May be used to search through notes - deactivate for now
        // "getTrackableUsage", // May be used to get the usage of a tracker - deactivate for now
        // "getLocation", // May be used if user allows location - deactivate for now
    ],
    version: "0.9.4", // Mostly follows SemVer
    addToCaptureMenu: true,
    addToMoreMenu: true,
    addToWidgets: true,
});

const content: ContentType & ContentHelperFunctionality & ContentVueFunctionality & StopwatchFunctionality & SettingFunctionality = {
    //#region Content Type
    current_stopwatches: [],
    debug: false,
    settings_open: false,
    settings: {
        will_use_name: {
            title: "Allow Naming Stopwatches",
            storage_name: SETTING_ALLOW_NAMES,
            value: false,
        },
        save_note_immediately: {
            title: "Save Notes Immediately",
            storage_name: SETTING_IMMEDIATELY_SAVE,
            value: false,
        },
        stopwatch_auto_start: {
            title:"Auto Start Stopwatches",
            storage_name: SETTING_AUTOSTART,
            value: false,
        },
        show_alerts: {
            title: "Show General Alerts",
            storage_name: SETTING_SHOW_ALERTS,
            value: true,
        },
    },
    stopwatch_name: {
        title: "Default Stopwatch",
        storage_name: SETTING_STOPWATCH_TRACKER_NAME,
        value: "#stopwatch",
    },
    //#endregion
    //#region Content Helper Functionality
    tryRunAlert(title, message) {
        if (this.settings.show_alerts.value) plugin.alert(title, message);
    },
    debugLog(...message): void {
        console.log(...message)
    },
    initSettings(): void {
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
    toggleSettingSave(setting): void {
        plugin.storage.setItem(setting.storage_name, setting.value);
        this.tryRunAlert(
            `${setting.title} Changed`,
            `Setting change to ${setting.value}.`,
            );
        },
        stopwatchClassStyle(stopwatch): any {
            return stopwatch.running;
        },
    initializeLoad(context) {
        const loaded_stopwatches=plugin.storage.getItem(SAVED_STOPWATCHES);
        console.log(loaded_stopwatches);
        if(loaded_stopwatches){
            const parsed_stopwatches = JSON.parse(loaded_stopwatches);
            console.log(parsed_stopwatches);
            this.current_stopwatches = parsed_stopwatches || [];
        }
        // Assign all items if available or go with defaults
        this.stopwatch_name.value = plugin.storage.getItem(SETTING_STOPWATCH_TRACKER_NAME) ?? "#stopwatch";
        this.initSettings();
        console.log(`Plugin Initialized:\n Stopwatch plugin registered${context ? " inside of " + context : ""}` );
    },
    //#endregion
    //#region Content Vue Functionality
     mounted() {
        // When Plugin is first registered
        plugin.onRegistered(async () => {
            await plugin.storage.init();
            this.initializeLoad("Registration");
        });
        // When Object is launched
        plugin.onLaunch(async () => {
            await plugin.storage.init();
            this.initializeLoad("Launch");
        })
        
        // When UI is opened
        plugin.onUIOpened(() => this.initializeLoad("UI"))

        // When Widget is opened
        plugin.onWidget(() => this.initializeLoad("Widget"))
    },
    //#endregion
    //#region StopwatchFunctionality
    // Main page:
    // 1. Add a new stopwatch
    async stopwatch_add_new(using_stopwatch_template) {
        // Try to get the name if naming is allowed
        let stopwatch_name = "";
        if (this.settings.will_use_name.value) {
                const res: any = this.debug ? { value: "Debug Stopwatch Name Test" } : await plugin.prompt("Name Stopwatch", "What do you want to name your stopwatch?");
            if (res.value) {
                stopwatch_name = res.value;
            }
        }
        let stopwatch = null;
        // If using a stopwatch template, get the tracker info and create the stopwatch
        if (using_stopwatch_template) {
            const stopwatch_template : any = this.debug
                ? {}
                : await plugin.selectTrackables(null, true);
            const trackers = stopwatch_template.map((track: any) => {
                if (track.tracker && track.tracker.type === "timer") {
                    // Get each included tracker as name only, split by space
                    return track.tracker.include.split(" ").map((tracker: any)=> {
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
            stopwatch = new Stopwatch(stopwatch_name, trackers);
        }
        // Otherwise, just create the timer
        else {
            stopwatch = new Stopwatch(stopwatch_name);
        }
        this.current_stopwatches.push(stopwatch);
        // Auto start
        if (this.settings.stopwatch_auto_start.value) stopwatch.resume();
        // Show alert for new stopwatch and save the currently active ones 
        this.tryRunAlert(`New ${using_stopwatch_template ? "Specific" : "Custom"} Stopwatch created`, `A new stopwatch with name ${stopwatch_name} has been created!`);
        saveStopwatches(this.current_stopwatches);
    },
    // 2. Clear a stopwatch
    stopwatch_clear(item) {
        this.checkedAction(item, async (_stopwatch, index) => {
            // Ask to confirm deleting stopwatch
            let will_delete:any = this.debug ? { value: true } : await plugin.confirm("Are you sure you want to delete this stopwatch?", "You will not be able recovery it.");
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
            const answer_notes = " " + answers.map((tracker:any) => tracker.note).join(" ");
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
    //#endregion

    // Settings Page:
    toggleSettingsPage() {
        this.settings_open = !this.settings_open;
    },
    // 1. Change stopwatch tracker name
    async changeStopwatchTrackerName() {
        let res:any = this.debug ? { res: this.stopwatch_name.value + "!" } : await plugin.prompt("Stopwatch Tracker Name Change", "What would you like the stopwatch tracker name to be called? (defaults to #stopwatch)");
        if (res.value) {
            this.stopwatch_name.value = res.value || "#stopwatch";
            // Prepend "#" if not already there
            if(typeof this.stopwatch_name.value === "string"){
                this.stopwatch_name.value = this.stopwatch_name.value.startsWith('#') ? this.stopwatch_name.value : "#" + this.stopwatch_name.value;
            }
            plugin.storage.setItem(SETTING_STOPWATCH_TRACKER_NAME, this.stopwatch_name.value);
        }
    },  
    async initStorage() {
        await plugin.storage.init();
        this.initializeLoad("Init Storage");
    }
};

// Petite Vue Initialization
PetiteVue.createApp(content).mount('#content');
console.log(`${plugin.pluginDetails.name} ${plugin.pluginDetails.version} Initialized` );