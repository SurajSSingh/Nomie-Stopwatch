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
        "selectTrackables", // 
        // "getLocation",
    ],
    version: "0.1.0", // Mostly follows SemVer
    addToCaptureMenu: true,
    addToMoreMenu: true,
    addToWidgets: true,
});

// Petite Vue Initialization
createApp({
    // root scope for app one
}).mount('#content')