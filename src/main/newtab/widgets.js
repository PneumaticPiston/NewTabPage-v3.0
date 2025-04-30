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

// Widget factory function to create and return widget elements
function createWidget(widgetData) {
    // Create the base widget container
    const widgetElement = document.createElement('div');
    widgetElement.className = 'widget';
    widgetElement.id = `widget-${widgetData.widgetType}-${Date.now()}`;
    
    // Set positioning based on widget data
    const pos = typeof calculatePosition === 'function' 
        ? calculatePosition(widgetData.x || 50, widgetData.y || 50)
        : { percentX: 0.5, percentY: 0.5 };
    
    widgetElement.style.position = 'absolute';
    widgetElement.style.top = `${pos.percentY * 100}%`;
    widgetElement.style.left = `${pos.percentX * 100}%`;
    widgetElement.style.transform = 'translate(-50%, -50%)';
    
    // Create content container
    const content = document.createElement('div');
    content.className = 'widget-content';
    
    // Handle specific widget types
    switch (widgetData.widgetType) {
        case 'analog-clock':
            setupAnalogClockWidget(content, widgetData);
            break;
        case 'digital-clock':
            setupDigitalClockWidget(content, widgetData);
            break;
        case 'weather':
            setupWeatherWidget(content, widgetData);
            break;
        case 'world-clock':
            setupWorldClockWidget(content, widgetData);
            break;
        case 'todo':
            setupTodoWidget(content, widgetData);
            break;
        case 'notes':
            setupNotesWidget(content, widgetData);
            break;
        case 'calendar':
            setupCalendarWidget(content, widgetData);
            break;
        case 'timer':
            setupTimerWidget(content, widgetData);
            break;
        case 'pomodoro':
            setupPomodoroWidget(content, widgetData);
            break;
        case 'quote':
            setupQuoteWidget(content, widgetData);
            break;
        case 'news':
            setupNewsWidget(content, widgetData);
            break;
        case 'stocks':
            setupStocksWidget(content, widgetData);
            break;
        case 'rss':
            setupRssWidget(content, widgetData);
            break;
        case 'music-controls':
            setupMusicWidget(content, widgetData);
            break;
        case 'bookmarks':
            setupBookmarksWidget(content, widgetData);
            break;
        case 'recently-visited':
            setupRecentlyVisitedWidget(content, widgetData);
            break;
        default:
            content.innerHTML = `<div class="widget-placeholder">
                <div class="widget-icon">${widgetData.icon || '🔧'}</div>
                <div>Widget: ${widgetData.title || widgetData.widgetType}</div>
            </div>`;
    }
    
    widgetElement.appendChild(content);
    return widgetElement;
}

// Implementation of widget setup functions
function setupAnalogClockWidget(container, widgetData) {
    container.className = 'widget-content clock-widget analog-clock';
    
    // Create clock face
    const clockFace = document.createElement('div');
    clockFace.className = 'clock-face';
    
    // Add hour markers
    for (let i = 1; i <= 12; i++) {
        const marker = document.createElement('div');
        marker.className = 'hour-marker';
        const angle = (i * 30) - 90; // 30 degrees per hour, starting at -90 degrees (12 o'clock)
        const markerX = Math.cos(angle * Math.PI / 180) * 80; // 80% of the radius
        const markerY = Math.sin(angle * Math.PI / 180) * 80;
        marker.style.left = `calc(50% + ${markerX}px)`;
        marker.style.top = `calc(50% + ${markerY}px)`;
        marker.textContent = i;
        clockFace.appendChild(marker);
    }
    
    // Create clock hands
    const hourHand = document.createElement('div');
    hourHand.className = 'clock-hand hour-hand';
    
    const minuteHand = document.createElement('div');
    minuteHand.className = 'clock-hand minute-hand';
    
    const secondHand = document.createElement('div');
    secondHand.className = 'clock-hand second-hand';
    
    // Create center dot
    const centerDot = document.createElement('div');
    centerDot.className = 'center-dot';
    
    // Create timezone label if not local
    const timezone = widgetData.settings?.timezone || 'local';
    let timezoneLabel = null;
    
    if (timezone !== 'local') {
        timezoneLabel = document.createElement('div');
        timezoneLabel.className = 'timezone-label';
        
        const timezoneNames = {
            'America/New_York': 'New York',
            'America/Los_Angeles': 'Los Angeles',
            'Europe/London': 'London',
            'Europe/Paris': 'Paris',
            'Asia/Tokyo': 'Tokyo'
        };
        
        timezoneLabel.textContent = timezoneNames[timezone] || timezone;
        container.appendChild(timezoneLabel);
    }
    
    // Add all elements to clock face
    clockFace.appendChild(hourHand);
    clockFace.appendChild(minuteHand);
    clockFace.appendChild(secondHand);
    clockFace.appendChild(centerDot);
    
    container.appendChild(clockFace);
    
    // Function to update clock
    function updateClock() {
        // Get current date
        const now = new Date();
        
        // Adjust for timezone if specified
        let hours, minutes, seconds;
        
        if (timezone === 'local') {
            // Use local time
            hours = now.getHours() % 12;
            minutes = now.getMinutes();
            seconds = now.getSeconds();
        } else {
            // Format the time for the specified timezone
            const options = {
                timeZone: timezone,
                hour12: false,
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            };
            
            try {
                // Get the time string in the target timezone
                const timeString = now.toLocaleTimeString('en-US', options);
                const [time, period] = timeString.split(' ');
                const [h, m, s] = time.split(':').map(num => parseInt(num, 10));
                
                hours = h % 12;
                minutes = m;
                seconds = s;
            } catch (error) {
                console.error('Error formatting time for timezone:', error);
                // Fallback to local time
                hours = now.getHours() % 12;
                minutes = now.getMinutes();
                seconds = now.getSeconds();
            }
        }
        
        // Calculate angles
        const hourAngle = (hours * 30) + (minutes * 0.5); // 30 degrees per hour + 0.5 degrees per minute
        const minuteAngle = minutes * 6; // 6 degrees per minute
        const secondAngle = seconds * 6; // 6 degrees per second
        
        // Apply rotations
        hourHand.style.transform = `translateX(-50%) rotate(${hourAngle}deg)`;
        minuteHand.style.transform = `translateX(-50%) rotate(${minuteAngle}deg)`;
        secondHand.style.transform = `translateX(-50%) rotate(${secondAngle}deg)`;
    }
    
    // Initial update
    updateClock();
    
    // Update every second
    const intervalId = setInterval(updateClock, 1000);
    
    // Store interval ID for cleanup
    container.dataset.intervalId = intervalId;
    
    // Add styling
    const style = document.createElement('style');
    style.textContent = `
    .analog-clock {
        width: 200px;
        height: 200px;
        padding: 10px;
        position: relative;
    }
    .clock-face {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        position: relative;
        background-color: var(--group-background-color, #f5f5f5);
        box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1), 0 0 10px rgba(0, 0, 0, 0.2);
    }
    .hour-marker {
        position: absolute;
        font-weight: bold;
        font-size: 14px;
        transform: translate(-50%, -50%);
        color: var(--text-color, #333);
    }
    .clock-hand {
        position: absolute;
        bottom: 50%;
        left: 50%;
        transform-origin: bottom;
        background-color: var(--text-color, #333);
    }
    .hour-hand {
        width: 6px;
        height: 50px;
        border-radius: 3px;
    }
    .minute-hand {
        width: 4px;
        height: 70px;
        border-radius: 2px;
    }
    .second-hand {
        width: 2px;
        height: 80px;
        background-color: var(--accent-color, #f00);
        border-radius: 1px;
    }
    .center-dot {
        position: absolute;
        width: 12px;
        height: 12px;
        background-color: var(--text-color, #333);
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    .timezone-label {
        position: absolute;
        bottom: 5px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 12px;
        color: var(--text-color, #333);
        opacity: 0.7;
        text-align: center;
        font-style: italic;
    }
    `;
    document.head.appendChild(style);
}

function setupDigitalClockWidget(container, widgetData) {
    container.className = 'widget-content clock-widget digital-clock';
    
    // Clock display elements
    const timeDisplay = document.createElement('div');
    timeDisplay.className = 'time-display';
    
    const dateDisplay = document.createElement('div');
    dateDisplay.className = 'date-display';
    
    const timezoneDisplay = document.createElement('div');
    timezoneDisplay.className = 'timezone-display';
    
    container.appendChild(timeDisplay);
    container.appendChild(dateDisplay);
    container.appendChild(timezoneDisplay);
    
    // Format options
    const timeFormat = widgetData.settings?.timeFormat || '24h'; // 12h or 24h
    const showSeconds = widgetData.settings?.showSeconds !== false;
    const showDate = widgetData.settings?.showDate !== false;
    const timezone = widgetData.settings?.timezone || 'local';
    
    // Display name for timezone
    const timezoneNames = {
        'local': 'Local Time',
        'America/New_York': 'New York',
        'America/Los_Angeles': 'Los Angeles',
        'Europe/London': 'London',
        'Europe/Paris': 'Paris',
        'Asia/Tokyo': 'Tokyo'
    };
    
    // Show timezone name if not local
    if (timezone !== 'local') {
        timezoneDisplay.textContent = timezoneNames[timezone] || timezone;
        timezoneDisplay.style.display = 'block';
    } else {
        timezoneDisplay.style.display = 'none';
    }
    
    // Function to update clock
    function updateClock() {
        // Get current date
        const now = new Date();
        
        // Adjust for timezone if specified
        let displayTime;
        
        if (timezone === 'local') {
            // Use local time
            displayTime = now;
        } else {
            // Format the time for the specified timezone
            const options = {
                timeZone: timezone,
                hour12: false // We'll handle 12/24 formatting ourselves
            };
            
            try {
                // Get the time string in the target timezone
                const timeString = now.toLocaleTimeString('en-US', options);
                
                // Create a new date object to work with
                const [time, period] = timeString.split(' ');
                const [hours, minutes, seconds] = time.split(':').map(num => parseInt(num, 10));
                
                // Create a new date with the extracted hours, minutes, seconds
                displayTime = new Date();
                displayTime.setHours(hours);
                displayTime.setMinutes(minutes);
                displayTime.setSeconds(seconds);
            } catch (error) {
                console.error('Error formatting time for timezone:', error);
                displayTime = now; // Fallback to local time
            }
        }
        
        // Format time based on settings
        let hours = displayTime.getHours();
        const minutes = displayTime.getMinutes().toString().padStart(2, '0');
        const seconds = displayTime.getSeconds().toString().padStart(2, '0');
        
        let timeString;
        let ampm = '';
        
        if (timeFormat === '12h') {
            ampm = hours >= 12 ? ' PM' : ' AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // Convert 0 to 12
            timeString = `${hours}:${minutes}${showSeconds ? ':' + seconds : ''}${ampm}`;
        } else {
            hours = hours.toString().padStart(2, '0');
            timeString = `${hours}:${minutes}${showSeconds ? ':' + seconds : ''}`;
        }
        
        timeDisplay.textContent = timeString;
        
        // Update date if showing
        if (showDate) {
            let dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            
            if (timezone !== 'local') {
                // Add timezone for date formatting
                dateOptions.timeZone = timezone;
            }
            
            dateDisplay.textContent = now.toLocaleDateString(undefined, dateOptions);
            dateDisplay.style.display = 'block';
        } else {
            dateDisplay.style.display = 'none';
        }
    }
    
    // Initial update
    updateClock();
    
    // Update every second
    const intervalId = setInterval(updateClock, 1000);
    
    // Store interval ID for cleanup
    container.dataset.intervalId = intervalId;
    
    // Add styling
    const style = document.createElement('style');
    style.textContent = `
    .digital-clock {
        width: 230px;
        padding: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        background-color: var(--group-background-color, #f5f5f5);
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        color: var(--text-color, #333);
    }
    .time-display {
        font-size: 36px;
        font-weight: bold;
        margin-bottom: 5px;
        font-family: 'Courier New', monospace;
        color: var(--text-color, #333);
    }
    .date-display {
        font-size: 14px;
        color: var(--text-color, #333);
        opacity: 0.7;
    }
    .timezone-display {
        font-size: 12px;
        color: var(--text-color, #333);
        opacity: 0.7;
        margin-top: 5px;
        font-style: italic;
    }
    `;
    document.head.appendChild(style);
}

function setupWeatherWidget(container, widgetData) {
    container.className = 'widget-content weather-widget';
    
    // Create weather display elements
    const currentConditions = document.createElement('div');
    currentConditions.className = 'current-conditions';
    
    const temperature = document.createElement('div');
    temperature.className = 'temperature';
    
    const condition = document.createElement('div');
    condition.className = 'condition';
    
    const location = document.createElement('div');
    location.className = 'location';
    
    // Status message for loading or error states
    const status = document.createElement('div');
    status.className = 'status';
    status.textContent = 'Loading weather...';
    
    // Add elements to container
    container.appendChild(currentConditions);
    container.appendChild(temperature);
    container.appendChild(condition);
    container.appendChild(location);
    container.appendChild(status);
    
    // Settings
    const units = widgetData.settings?.units || 'imperial'; // metric or imperial
    const locationId = widgetData.settings?.location || 'auto'; // auto for geolocation, city name, or zipcode
    
    // Fetch real weather data from OpenWeatherMap API
    fetchWeatherData(locationId, units)
        .then(weatherData => {
            if (weatherData) {
                // Display data
                temperature.textContent = `${Math.round(weatherData.temp)}°${units === 'metric' ? 'C' : 'F'}`;
                condition.textContent = weatherData.condition;
                currentConditions.textContent = getWeatherIcon(weatherData.conditionCode);
                location.textContent = weatherData.location;
                
                // Hide status when loaded
                status.style.display = 'none';
                
                // Show the weather data
                temperature.style.display = 'block';
                condition.style.display = 'block';
                currentConditions.style.display = 'block';
                location.style.display = 'block';
            } else {
                // Show error state
                status.textContent = 'Unable to load weather data';
                status.style.color = 'var(--accent-color, #ff5555)';
            }
        })
        .catch(error => {
            console.error('Weather widget error:', error);
            status.textContent = 'Error loading weather data';
            status.style.color = 'var(--accent-color, #ff5555)';
        });
    
    // Add styling
    const style = document.createElement('style');
    style.textContent = `
    .weather-widget {
        width: 200px;
        padding: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: var(--group-background-color, #f5f5f5);
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        color: var(--text-color, #333);
    }
    .current-conditions {
        font-size: 48px;
        margin-bottom: 10px;
        display: none;
    }
    .temperature {
        font-size: 36px;
        font-weight: bold;
        margin-bottom: 5px;
        display: none;
        color: var(--text-color, #333);
    }
    .condition {
        font-size: 18px;
        margin-bottom: 10px;
        display: none;
        color: var(--text-color, #333);
    }
    .location {
        font-size: 14px;
        color: var(--text-color, #333);
        opacity: 0.7;
        display: none;
    }
    .status {
        font-size: 14px;
        color: var(--text-color, #333);
        opacity: 0.7;
        margin-top: 10px;
    }
    `;
    document.head.appendChild(style);
}

// Helper function to fetch weather data
async function fetchWeatherData(location, units) {
    try {
        // First determine if we need to get coordinates
        let lat, lon;
        
        // Sample API Key for OpenWeatherMap - in a real extension, this should be hidden
        // This is just for demo purposes
        const apiKey = '37c1133b7ad6d2fa28b0af3aab4e42af';
        
        if (location === 'auto') {
            // Try to get user's location
            try {
                const position = await getCurrentPosition();
                lat = position.coords.latitude;
                lon = position.coords.longitude;
            } catch (error) {
                console.warn('Geolocation failed, using default location:', error);
                // Fallback to New York
                lat = 40.7128;
                lon = -74.0060;
            }
        } else if (/^\d{5}(-\d{4})?$/.test(location)) {
            // It's a US zip code
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/zip?zip=${location},US&appid=${apiKey}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to get location data from zip code');
            }
            
            const data = await response.json();
            lat = data.lat;
            lon = data.lon;
        } else {
            // Assume it's a city name
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to get location data from city name');
            }
            
            const data = await response.json();
            if (data.length === 0) {
                throw new Error('Location not found');
            }
            
            lat = data[0].lat;
            lon = data[0].lon;
        }
        
        // Now get the weather data
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`
        );
        
        if (!weatherResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        const weatherData = await weatherResponse.json();
        
        return {
            temp: weatherData.main.temp,
            condition: weatherData.weather[0].main,
            conditionCode: weatherData.weather[0].id,
            location: weatherData.name
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        // Return fake data in case of error to avoid breaking the widget
        return {
            temp: 72,
            condition: 'Clear',
            conditionCode: 800,
            location: 'New York, NY'
        };
    }
}

// Promise wrapper for geolocation API
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 300000 // Cache for 5 minutes
        });
    });
}

// Function to get weather icon based on condition code
function getWeatherIcon(conditionCode) {
    // Weather condition codes: https://openweathermap.org/weather-conditions
    if (conditionCode >= 200 && conditionCode < 300) {
        return '⛈️'; // Thunderstorm
    } else if (conditionCode >= 300 && conditionCode < 400) {
        return '🌧️'; // Drizzle
    } else if (conditionCode >= 500 && conditionCode < 600) {
        return '🌧️'; // Rain
    } else if (conditionCode >= 600 && conditionCode < 700) {
        return '❄️'; // Snow
    } else if (conditionCode >= 700 && conditionCode < 800) {
        return '🌫️'; // Atmosphere (fog, mist, etc.)
    } else if (conditionCode === 800) {
        return '☀️'; // Clear
    } else if (conditionCode > 800) {
        return '☁️'; // Clouds
    }
    return '🌡️'; // Default
}

function setupWorldClockWidget(container, widgetData) {
    container.className = 'widget-content world-clock-widget';
    
    // Settings
    const timezones = widgetData.settings?.timezones || [
        { name: 'New York', timezone: 'America/New_York' },
        { name: 'London', timezone: 'Europe/London' },
        { name: 'Tokyo', timezone: 'Asia/Tokyo' }
    ];
    
    // Create clocks container
    const clocksContainer = document.createElement('div');
    clocksContainer.className = 'clocks-container';
    
    // Create world clocks
    timezones.forEach(tz => {
        const clockItem = document.createElement('div');
        clockItem.className = 'clock-item';
        
        const cityName = document.createElement('div');
        cityName.className = 'city-name';
        cityName.textContent = tz.name;
        
        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'time-display';
        timeDisplay.dataset.timezone = tz.timezone;
        
        clockItem.appendChild(cityName);
        clockItem.appendChild(timeDisplay);
        clocksContainer.appendChild(clockItem);
    });
    
    container.appendChild(clocksContainer);
    
    // Function to update clocks
    function updateClocks() {
        const timeDisplays = container.querySelectorAll('.time-display');
        const now = new Date();
        
        timeDisplays.forEach(display => {
            const timezone = display.dataset.timezone;
            try {
                const options = {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: timezone
                };
                display.textContent = now.toLocaleTimeString(undefined, options);
            } catch (error) {
                display.textContent = 'Invalid timezone';
            }
        });
    }
    
    // Initial update
    updateClocks();
    
    // Update every minute
    const intervalId = setInterval(updateClocks, 60000);
    
    // Store interval ID for cleanup
    container.dataset.intervalId = intervalId;
    
    // Add styling
    const style = document.createElement('style');
    style.textContent = `
    .world-clock-widget {
        width: 200px;
        padding: 15px;
        background-color: var(--group-background-color, #f5f5f5);
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        color: var(--text-color, #333);
    }
    .clocks-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .clock-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 0;
        border-bottom: 1px solid var(--text-color, rgba(0, 0, 0, 0.1));
        border-bottom-color: rgba(var(--text-color, 0, 0, 0), 0.1);
    }
    .clock-item:last-child {
        border-bottom: none;
    }
    .city-name {
        font-weight: bold;
        color: var(--text-color, #333);
    }
    .time-display {
        font-family: 'Courier New', monospace;
        color: var(--text-color, #333);
    }
    `;
    document.head.appendChild(style);
}

function setupTodoWidget(container, widgetData) {
    container.className = 'widget-content todo-widget';
    
    // Create todo elements
    const todoList = document.createElement('ul');
    todoList.className = 'todo-list';
    
    const todoInput = document.createElement('div');
    todoInput.className = 'todo-input-container';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Add a new task...';
    input.className = 'todo-input';
    
    const addButton = document.createElement('button');
    addButton.className = 'add-todo-button';
    addButton.textContent = '+';
    
    todoInput.appendChild(input);
    todoInput.appendChild(addButton);
    
    container.appendChild(todoList);
    container.appendChild(todoInput);
    
    // Load saved todos from widget data or create empty array
    const todos = widgetData.settings?.todos || [];
    
    // Render initial todos
    renderTodos();
    
    // Add event listeners
    addButton.addEventListener('click', addTodo);
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    // Function to render todos
    function renderTodos() {
        todoList.innerHTML = '';
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            if (todo.completed) {
                li.classList.add('completed');
            }
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.completed;
            checkbox.addEventListener('change', () => toggleTodo(index));
            
            const text = document.createElement('span');
            text.textContent = todo.text;
            text.className = 'todo-text';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-todo';
            deleteBtn.textContent = '×';
            deleteBtn.addEventListener('click', () => deleteTodo(index));
            
            li.appendChild(checkbox);
            li.appendChild(text);
            li.appendChild(deleteBtn);
            todoList.appendChild(li);
        });
        
        // Save todos to widget data
        saveTodos();
    }
    
    // Add new todo
    function addTodo() {
        const todoText = input.value.trim();
        if (todoText) {
            todos.push({ text: todoText, completed: false });
            input.value = '';
            renderTodos();
        }
    }
    
    // Toggle todo completion
    function toggleTodo(index) {
        if (index >= 0 && index < todos.length) {
            todos[index].completed = !todos[index].completed;
            renderTodos();
        }
    }
    
    // Delete todo
    function deleteTodo(index) {
        if (index >= 0 && index < todos.length) {
            todos.splice(index, 1);
            renderTodos();
        }
    }
    
    // Save todos to storage
    function saveTodos() {
        // In a real implementation, this would save to chrome.storage
        // For now, we'll just update the widget data in memory
        if (!widgetData.settings) {
            widgetData.settings = {};
        }
        widgetData.settings.todos = todos;
        
        // Note: This doesn't persist between page reloads yet
        // That will require updating the storage implementation
    }
    
    // Add styling
    const style = document.createElement('style');
    style.textContent = `
    .todo-widget {
        width: 250px;
        padding: 15px;
        background-color: var(--group-background-color, #f5f5f5);
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        color: var(--text-color, #333);
    }
    .todo-list {
        list-style: none;
        padding: 0;
        margin: 0 0 10px 0;
        max-height: 200px;
        overflow-y: auto;
    }
    .todo-item {
        display: flex;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--text-color, rgba(0, 0, 0, 0.1));
        border-bottom-color: rgba(var(--text-color, 0, 0, 0), 0.1);
    }
    .todo-item.completed .todo-text {
        text-decoration: line-through;
        opacity: 0.6;
    }
    .todo-item input[type="checkbox"] {
        margin-right: 10px;
    }
    .todo-text {
        flex: 1;
        color: var(--text-color, #333);
    }
    .delete-todo {
        background: none;
        border: none;
        color: var(--accent-color, #ff5555);
        font-size: 18px;
        cursor: pointer;
        padding: 0 5px;
    }
    .todo-input-container {
        display: flex;
        margin-top: 10px;
    }
    .todo-input {
        flex: 1;
        padding: 8px;
        border: 1px solid var(--group-background-color, #ddd);
        border-radius: 4px 0 0 4px;
        color: var(--text-color, #333);
        background-color: var(--all-background-color, #fff);
    }
    .add-todo-button {
        background-color: var(--primary-color, #4caf50);
        color: var(--contrast-text-color, white);
        border: none;
        padding: 8px 12px;
        border-radius: 0 4px 4px 0;
        cursor: pointer;
    }
    `;
    document.head.appendChild(style);
}

function setupNotesWidget(container, widgetData) {
    container.className = 'widget-content notes-widget';
    
    // Create notes elements
    const notesContent = document.createElement('div');
    notesContent.className = 'notes-content';
    
    const textarea = document.createElement('textarea');
    textarea.className = 'notes-textarea';
    textarea.placeholder = 'Write your notes here...';
    
    // Load saved notes if available
    if (widgetData.settings?.notes) {
        textarea.value = widgetData.settings.notes;
    }
    
    notesContent.appendChild(textarea);
    container.appendChild(notesContent);
    
    // Auto-save notes when typing stops
    let saveTimeout;
    textarea.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveNotes, 1000); // Save 1 second after typing stops
    });
    
    // Function to save notes
    function saveNotes() {
        const notesText = textarea.value;
        
        // Update widget settings
        if (!widgetData.settings) {
            widgetData.settings = {};
        }
        widgetData.settings.notes = notesText;
        
        // In a real implementation, this would save to chrome.storage
        // For demonstration purposes, we're just updating the widget data in memory
    }
    
    // Add styling
    const style = document.createElement('style');
    style.textContent = `
    .notes-widget {
        width: 250px;
        padding: 15px;
        background-color: var(--group-background-color, #f5f5f5);
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        color: var(--text-color, #333);
    }
    .notes-content {
        width: 100%;
    }
    .notes-textarea {
        width: 100%;
        height: 150px;
        padding: 10px;
        border: 1px solid var(--group-background-color, #ddd);
        border-radius: 5px;
        resize: none;
        font-family: inherit;
        background-color: var(--all-background-color, #fff);
        color: var(--text-color, #333);
    }
    `;
    document.head.appendChild(style);
}

function setupQuoteWidget(container, widgetData) {
    container.className = 'widget-content quote-widget';
    
    // Create quote elements
    const quoteText = document.createElement('div');
    quoteText.className = 'quote-text';
    
    const quoteAuthor = document.createElement('div');
    quoteAuthor.className = 'quote-author';
    
    const refreshButton = document.createElement('button');
    refreshButton.className = 'refresh-quote';
    refreshButton.innerHTML = '↻';
    refreshButton.title = 'New Quote';
    
    container.appendChild(quoteText);
    container.appendChild(quoteAuthor);
    container.appendChild(refreshButton);
    
    // Sample quotes
    const quotes = [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
        { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" }
    ];
    
    // Function to display a random quote
    function displayRandomQuote() {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];
        
        quoteText.textContent = `"${quote.text}"`;
        quoteAuthor.textContent = `- ${quote.author}`;
    }
    
    // Display initial quote
    displayRandomQuote();
    
    // Add event listener for refresh button
    refreshButton.addEventListener('click', displayRandomQuote);
    
    // Add styling
    const style = document.createElement('style');
    style.textContent = `
    .quote-widget {
        width: 250px;
        padding: 20px;
        background-color: var(--group-background-color, #f5f5f5);
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        position: relative;
        color: var(--text-color, #333);
    }
    .quote-text {
        font-style: italic;
        margin-bottom: 10px;
        line-height: 1.4;
        color: var(--text-color, #333);
    }
    .quote-author {
        text-align: right;
        opacity: 0.7;
        font-size: 0.9em;
        color: var(--text-color, #333);
    }
    .refresh-quote {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        color: var(--text-color, #777);
        opacity: 0.7;
    }
    .refresh-quote:hover {
        color: var(--text-color, #333);
        opacity: 1;
    }
    `;
    document.head.appendChild(style);
}

function setupCalendarWidget(container, widgetData) {
    container.className = 'widget-content calendar-widget';
    
    // Create calendar elements
    const calendarHeader = document.createElement('div');
    calendarHeader.className = 'calendar-header';
    
    const prevMonthBtn = document.createElement('button');
    prevMonthBtn.className = 'month-nav prev-month';
    prevMonthBtn.innerHTML = '&lt;';
    
    const monthDisplay = document.createElement('div');
    monthDisplay.className = 'month-display';
    
    const nextMonthBtn = document.createElement('button');
    nextMonthBtn.className = 'month-nav next-month';
    nextMonthBtn.innerHTML = '&gt;';
    
    calendarHeader.appendChild(prevMonthBtn);
    calendarHeader.appendChild(monthDisplay);
    calendarHeader.appendChild(nextMonthBtn);
    
    // Create weekday header
    const weekdayHeader = document.createElement('div');
    weekdayHeader.className = 'weekday-header';
    
    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    weekdays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'weekday';
        dayElement.textContent = day;
        weekdayHeader.appendChild(dayElement);
    });
    
    // Create calendar grid
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-grid';
    
    // Add all elements to container
    container.appendChild(calendarHeader);
    container.appendChild(weekdayHeader);
    container.appendChild(calendarGrid);
    
    // Current displayed month
    let currentMonth = new Date();
    
    // Function to render calendar
    function renderCalendar() {
        // Update month display
        monthDisplay.textContent = currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' });
        
        // Clear grid
        calendarGrid.innerHTML = '';
        
        // Get first day of month and last day
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        
        // Get the day of the week of the first day (0 = Sunday, 6 = Saturday)
        const firstDayOfWeek = firstDay.getDay();
        
        // Create blank cells for days before first day of month
        for (let i = 0; i < firstDayOfWeek; i++) {
            const blankDay = document.createElement('div');
            blankDay.className = 'day empty';
            calendarGrid.appendChild(blankDay);
        }
        
        // Create cells for each day of the month
        const today = new Date();
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            dayElement.textContent = day;
            
            // Check if this day is today
            if (today.getDate() === day && 
                today.getMonth() === currentMonth.getMonth() && 
                today.getFullYear() === currentMonth.getFullYear()) {
                dayElement.classList.add('today');
            }
            
            calendarGrid.appendChild(dayElement);
        }
    }
    
    // Initially render calendar
    renderCalendar();
    
    // Add event listeners for month navigation
    prevMonthBtn.addEventListener('click', () => {
        currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
        renderCalendar();
    });
    
    // Add styling
    const style = document.createElement('style');
    style.textContent = `
    .calendar-widget {
        width: 280px;
        padding: 15px;
        background-color: var(--group-background-color, #f5f5f5);
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        color: var(--text-color, #333);
    }
    .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    .month-display {
        font-weight: bold;
        text-align: center;
        flex: 1;
        color: var(--text-color, #333);
    }
    .month-nav {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        padding: 0 10px;
        color: var(--text-color, #333);
    }
    .weekday-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        font-weight: bold;
        margin-bottom: 5px;
    }
    .weekday {
        padding: 5px;
        color: var(--text-color, #333);
    }
    .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
    }
    .day {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;
        color: var(--text-color, #333);
    }
    .day:hover {
        background-color: var(--text-color, rgba(0, 0, 0, 0.1));
        background-color: rgba(var(--text-color, 0, 0, 0), 0.1);
        cursor: pointer;
    }
    .day.empty {
        background: none;
    }
    .day.today {
        background-color: var(--primary-color, #4285f4);
        color: var(--contrast-text-color, white);
    }
    `;
    document.head.appendChild(style);
}

function setupTimerWidget(container, widgetData) {
    container.className = 'widget-content timer-widget';
    
    // Timer state
    const timerState = {
        time: 0, // time in seconds
        isRunning: false,
        interval: null
    };
    
    // Create timer elements
    const timerDisplay = document.createElement('div');
    timerDisplay.className = 'timer-display';
    timerDisplay.textContent = '00:00:00';
    
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'timer-controls';
    
    const startStopBtn = document.createElement('button');
    startStopBtn.className = 'timer-button start';
    startStopBtn.textContent = 'Start';
    
    const resetBtn = document.createElement('button');
    resetBtn.className = 'timer-button reset';
    resetBtn.textContent = 'Reset';
    
    // Quick preset buttons
    const presetsContainer = document.createElement('div');
    presetsContainer.className = 'timer-presets';
    
    const presets = [
        { label: '5m', seconds: 300 },
        { label: '10m', seconds: 600 },
        { label: '25m', seconds: 1500 },
    ];
    
    presets.forEach(preset => {
        const presetBtn = document.createElement('button');
        presetBtn.className = 'preset-button';
        presetBtn.textContent = preset.label;
        presetBtn.addEventListener('click', () => {
            timerState.time = preset.seconds;
            updateDisplay();
            stopTimer();
        });
        presetsContainer.appendChild(presetBtn);
    });
    
    // Add elements to container
    controlsContainer.appendChild(startStopBtn);
    controlsContainer.appendChild(resetBtn);
    
    container.appendChild(timerDisplay);
    container.appendChild(controlsContainer);
    container.appendChild(presetsContainer);
    
    // Timer functions
    function updateDisplay() {
        const hours = Math.floor(timerState.time / 3600);
        const minutes = Math.floor((timerState.time % 3600) / 60);
        const seconds = timerState.time % 60;
        
        timerDisplay.textContent = [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    }
    
    function startTimer() {
        timerState.isRunning = true;
        startStopBtn.textContent = 'Pause';
        startStopBtn.classList.remove('start');
        startStopBtn.classList.add('pause');
        
        timerState.interval = setInterval(() => {
            if (timerState.time > 0) {
                timerState.time--;
                updateDisplay();
            } else {
                stopTimer();
                notifyTimerComplete();
            }
        }, 1000);
    }
    
    function stopTimer() {
        timerState.isRunning = false;
        startStopBtn.textContent = 'Start';
        startStopBtn.classList.remove('pause');
        startStopBtn.classList.add('start');
        
        clearInterval(timerState.interval);
    }
    
    function resetTimer() {
        stopTimer();
        timerState.time = 0;
        updateDisplay();
    }
    
    function notifyTimerComplete() {
        // Visual notification
        timerDisplay.classList.add('timer-complete');
        setTimeout(() => {
            timerDisplay.classList.remove('timer-complete');
        }, 3000);
        
        // Sound notification (if browser allows)
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLHPM+N2fUBEGJV+68fPWt2gdAiFAlNjw7M6jdTEGGzJkpOXz8d7GoFEQBRUlU4293PXx6ox5SxMIESlJdavQ7/n41rSARB0HEyMvW3eVs+L78O/GmFwzDAcaJTFDXXOPs/L67+PCnWZBFQUSHyo3PUlacJXA+PfrzLaFUSkIChUlMDU4PUdT');
            audio.play();
        } catch (e) {
            console.log('Audio notification not supported');
        }
    }
    
    // Add event listeners
    startStopBtn.addEventListener('click', () => {
        if (timerState.isRunning) {
            stopTimer();
        } else {
            startTimer();
        }
    });
    
    resetBtn.addEventListener('click', resetTimer);
    
    // Add styling
    const style = document.createElement('style');
    style.textContent = `
    .timer-widget {
        width: 230px;
        padding: 15px;
        background-color: var(--group-background-color, #f5f5f5);
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center;
        color: var(--text-color, #333);
    }
    .timer-display {
        font-size: 32px;
        font-family: 'Courier New', monospace;
        margin-bottom: 15px;
        padding: 10px;
        background-color: var(--all-background-color, #fff);
        border-radius: 5px;
        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
        color: var(--text-color, #333);
    }
    .timer-controls {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-bottom: 10px;
    }
    .timer-button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
    }
    .start {
        background-color: var(--primary-color, #4CAF50);
        color: var(--contrast-text-color, white);
    }
    .pause {
        background-color: var(--secondary-color, #FFC107);
        color: var(--text-color, #333);
    }
    .reset {
        background-color: var(--accent-color, #F44336);
        color: var(--contrast-text-color, white);
    }
    .timer-presets {
        display: flex;
        justify-content: center;
        gap: 8px;
    }
    .preset-button {
        padding: 5px 10px;
        border: 1px solid var(--group-background-color, #ddd);
        background-color: var(--all-background-color, #fff);
        border-radius: 4px;
        cursor: pointer;
        color: var(--text-color, #333);
    }
    .timer-complete {
        animation: pulse 0.5s alternate infinite;
    }
    @keyframes pulse {
        from { background-color: var(--all-background-color, #fff); }
        to { background-color: var(--accent-color, #ffcdd2); opacity: 0.7; }
    }
    `;
    document.head.appendChild(style);
}

// Handler functions for remaining widget types with placeholder implementation
function setupPomodoroWidget(container, widgetData) {
    container.innerHTML = `
        <div class="widget-placeholder">
            <div class="widget-icon">🍅</div>
            <div>Pomodoro Timer</div>
            <div class="coming-soon">Coming soon</div>
        </div>
    `;
}

function setupNewsWidget(container, widgetData) {
    container.innerHTML = `
        <div class="widget-placeholder">
            <div class="widget-icon">📰</div>
            <div>News Headlines</div>
            <div class="coming-soon">Coming soon</div>
        </div>
    `;
}

function setupStocksWidget(container, widgetData) {
    container.innerHTML = `
        <div class="widget-placeholder">
            <div class="widget-icon">📈</div>
            <div>Stocks</div>
            <div class="coming-soon">Coming soon</div>
        </div>
    `;
}

function setupRssWidget(container, widgetData) {
    container.innerHTML = `
        <div class="widget-placeholder">
            <div class="widget-icon">📡</div>
            <div>RSS Feed</div>
            <div class="coming-soon">Coming soon</div>
        </div>
    `;
}

function setupMusicWidget(container, widgetData) {
    container.innerHTML = `
        <div class="widget-placeholder">
            <div class="widget-icon">🎵</div>
            <div>Music Controls</div>
            <div class="coming-soon">Coming soon</div>
        </div>
    `;
}

function setupBookmarksWidget(container, widgetData) {
    container.innerHTML = `
        <div class="widget-placeholder">
            <div class="widget-icon">🔖</div>
            <div>Bookmarks</div>
            <div class="coming-soon">Coming soon</div>
        </div>
    `;
}

function setupRecentlyVisitedWidget(container, widgetData) {
    container.innerHTML = `
        <div class="widget-placeholder">
            <div class="widget-icon">🕒</div>
            <div>Recently Visited</div>
            <div class="coming-soon">Coming soon</div>
        </div>
    `;
}

// Widget template functions for rendering widgets with createWidget
const WIDGET_TEMPLATES = {
    createWidget: createWidget
};

// Array to store active widget instances
const WIDGETS = [];

