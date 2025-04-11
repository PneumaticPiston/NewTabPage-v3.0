// Define widget types available in the extension
const WIDGET_TYPES = {
    // Time and Weather widgets
    timeAndWeather: {
        title: "Time & Weather",
        widgets: {
            analogClock: {
                id: "analog-clock",
                name: "Analog Clock",
                icon: "🕒",
                description: "Displays an analog clock"
            },
            digitalClock: {
                id: "digital-clock",
                name: "Digital Clock",
                icon: "⏰",
                description: "Displays time in digital format"
            },
            weather: {
                id: "weather",
                name: "Weather",
                icon: "☁️",
                description: "Shows current weather conditions"
            },
            worldClock: {
                id: "world-clock",
                name: "World Clock",
                icon: "🌐",
                description: "Displays time in different time zones"
            }
        }
    },
    
    // Productivity widgets
    productivity: {
        title: "Productivity",
        widgets: {
            todo: {
                id: "todo",
                name: "To-Do List",
                icon: "✓",
                description: "Manage your tasks"
            },
            notes: {
                id: "notes",
                name: "Quick Notes",
                icon: "📝",
                description: "Write and save notes"
            },
            calendar: {
                id: "calendar",
                name: "Calendar",
                icon: "📅",
                description: "View upcoming events"
            },
            timer: {
                id: "timer",
                name: "Timer",
                icon: "⏱️",
                description: "Set timers and alarms"
            },
            pomodoro: {
                id: "pomodoro",
                name: "Pomodoro Timer",
                icon: "🍅",
                description: "Focus timer with breaks"
            }
        }
    },
    
    // Information widgets
    information: {
        title: "Information",
        widgets: {
            news: {
                id: "news",
                name: "News Headlines",
                icon: "📰",
                description: "Latest news headlines"
            },
            stocks: {
                id: "stocks",
                name: "Stocks",
                icon: "📈",
                description: "Stock prices and trends"
            },
            quote: {
                id: "quote",
                name: "Inspirational Quote",
                icon: "💬",
                description: "Random inspirational quotes"
            },
            rss: {
                id: "rss",
                name: "RSS Feed",
                icon: "📡",
                description: "Custom RSS feed reader"
            }
        }
    },
    
    // Media widgets
    media: {
        title: "Media",
        widgets: {
            music: {
                id: "music-controls",
                name: "Music Controls",
                icon: "🎵",
                description: "Control music playback"
            },
            bookmarks: {
                id: "bookmarks",
                name: "Bookmarks",
                icon: "🔖",
                description: "Quick access to bookmarks"
            },
            recentlyVisited: {
                id: "recently-visited",
                name: "Recently Visited",
                icon: "🕒",
                description: "Recently visited websites"
            }
        }
    }
};

// Template functions for widgets (to be implemented)
const WIDGET_TEMPLATES = {
    // Time & Weather
    "analog-clock": function() {
        return false; // Implementation placeholder
    },
    "digital-clock": function() {
        return false; // Implementation placeholder
    },
    "weather": function() {
        return false; // Implementation placeholder
    },
    "world-clock": function() {
        return false; // Implementation placeholder
    },
    
    // Productivity
    "todo": function() {
        return false; // Implementation placeholder
    },
    "notes": function() {
        return false; // Implementation placeholder
    },
    "calendar": function() {
        return false; // Implementation placeholder
    },
    "timer": function() {
        return false; // Implementation placeholder
    },
    "pomodoro": function() {
        return false; // Implementation placeholder
    },
    
    // Information
    "news": function() {
        return false; // Implementation placeholder
    },
    "stocks": function() {
        return false; // Implementation placeholder
    },
    "quote": function() {
        return false; // Implementation placeholder
    },
    "rss": function() {
        return false; // Implementation placeholder
    },
    
    // Media
    "music-controls": function() {
        return false; // Implementation placeholder
    },
    "bookmarks": function() {
        return false; // Implementation placeholder
    },
    "recently-visited": function() {
        return false; // Implementation placeholder
    }
};

// Array to store active widget instances
const WIDGETS = [];