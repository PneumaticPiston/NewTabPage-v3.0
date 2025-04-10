/***
 * newtab.js
 * @todo: 
 * Make different types of link groups:
 *  - stack: a simple stack of links, displays the title of the link, favicon on the left side?
 *  - grid: a grid of links, similar to the current new tab page, can be a grid or row
 *  - single: a single link, similar to the current new tab page shortcuts
 *  - row: a simple row of links, 
 * Search bar: dropdown to select search engine, search bar, and search button
 * Settings: button to open settings page at the bottom right corner
 * google account management: button to open google account management at the top right corner to the left of the app drawer
 * App drawer: button to open app drawer at the top right corner similar to the current new tab page
 *  - Allows the user to add and remove apps
 * 
 * Create a bar at the middle that containes a list of quick links
 * 
 * linkGroup: 
 *  - Configurable label at the top
 *  - Configurable x and y position
 *  - Configurable number of rows and columns
 *  - Configurable link size
 * 
 * link:
 *  - in the settings page, allow the user to click a button to remove the link
 *  - allow the user to change the title
 *  - allow the user to change the url
 * 
 * functions: 
 * getFavicon(url): returns the cached favicon of the url
 * 
 */
const container = document.getElementById('groups-container');
const shortcuts = document.getElementById('shortcuts-container');
const searchContainer = document.getElementById('search-container');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchIcon = document.getElementById('search-icon');

// Default settings
const defaultSettings = {
    theme: 'light',
    backgroundURL: '',
    showSearch: true,
    showShortcuts: true,
    searchEngine: 'google',
    searchBarPosition: { x: 10, y: 120 },
    headerLinks: [
        { name: 'Gmail', url: 'https://mail.google.com' },
        { name: 'Photos', url: 'https://photos.google.com' },
        { name: 'Search Labs', url: 'https://labs.google.com' }
    ],
    apps: [
        {
            name: 'Account',
            icon: 'https://www.gstatic.com/images/branding/product/1x/avatar_square_blue_32dp.png',
            url: 'https://myaccount.google.com/'
        },
        {
            name: 'Search',
            icon: 'https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png',
            url: 'https://www.google.com/'
        },
        {
            name: 'Maps',
            icon: 'https://maps.gstatic.com/mapfiles/maps_lite/favicon_maps.ico',
            url: 'https://maps.google.com/'
        },
        {
            name: 'YouTube',
            icon: 'https://www.youtube.com/s/desktop/1c3bfd26/img/favicon_32x32.png',
            url: 'https://youtube.com/'
        },
        {
            name: 'Play',
            icon: 'https://www.gstatic.com/images/branding/product/1x/play_round_32dp.png',
            url: 'https://play.google.com/'
        },
        {
            name: 'Gmail',
            icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
            url: 'https://mail.google.com/'
        },
        {
            name: 'Drive',
            icon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_32dp.png',
            url: 'https://drive.google.com/'
        },
        {
            name: 'Calendar',
            icon: 'https://ssl.gstatic.com/calendar/images/favicon_v2021_32.ico',
            url: 'https://calendar.google.com/'
        },
        {
            name: 'Photos',
            icon: 'https://ssl.gstatic.com/images/branding/product/1x/photos_32dp.png',
            url: 'https://photos.google.com/'
        }
    ]
};

// Current settings
let currentSettings = {...defaultSettings};

const SHORTCUTS = [
    {
        title: 'Google',
        url: 'https://www.google.com'
    },
    {
        title: 'Youtube',
        url: 'https://www.youtube.com'
    }
];
/* 
const GROUPS = [// link groups
    {// link group
        type: 'stack',
        x: 10,
        y: 250,
        title: 'Search',
        links: [
            {
                title: 'Google',
                url: 'https://www.google.com'
            },
            {
                title: 'Youtube',
                url: 'https://www.youtube.com'
            }
        ]
    }
];
*/
// Remove the hardcoded GROUPS array since we're loading from storage

// Function to position elements relative to center of screen
function calculatePosition(x, y) {
    // Get screen dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate center-relative coordinates
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    
    // Handle percentage-based positions (backward compatibility)
    let absX = x;
    let absY = y;
    
    if (typeof x === 'string' && x.endsWith('%')) {
        absX = (parseFloat(x) / 100) * screenWidth;
    }
    
    if (typeof y === 'string' && y.endsWith('%')) {
        absY = (parseFloat(y) / 100) * screenHeight;
    }
    
    // Convert to numbers if they're strings but not percentages
    if (typeof absX === 'string') absX = parseFloat(absX);
    if (typeof absY === 'string') absY = parseFloat(absY);
    
    // Handle NaN values
    if (isNaN(absX)) absX = centerX;
    if (isNaN(absY)) absY = centerY;
    
    // Convert from absolute to center-relative
    const relX = absX - centerX;
    const relY = absY - centerY;
    
    // Calculate scaled percentage position
    const percentX = relX / centerX; // -1 to 1
    const percentY = relY / centerY; // -1 to 1
    
    // Calculate absolute position based on current screen size
    const newX = centerX + (percentX * centerX);
    const newY = centerY + (percentY * centerY);
    
    return { x: newX, y: newY };
}

const newGroup = {
    stack: function(links, x, y, title) {
        let group = document.createElement('div');
        group.classList.add('group');
        group.classList.add('stack');
        
        // Only add header if title is not empty or whitespace
        if (title && title.trim().length > 0) {
            let header = document.createElement('div');
            header.classList.add('group-header');
            header.textContent = title;
            header.style.width = 'fit-content'; // Make title fit to content
            group.appendChild(header);
        }

        // Create link container
        let linkContainer = document.createElement('ul');
        links.forEach(async link => {
            let favicon = getFavicon(link.url);
            linkContainer.innerHTML += newLink.stack(link.title, link.url, favicon);
        });
        group.appendChild(linkContainer);

        // Calculate position relative to screen center
        const pos = calculatePosition(x, y);

        // Ensure absolute positioning
        group.style.position = 'absolute';
        group.style.top = pos.y + 'px';
        group.style.left = pos.x + 'px';
        return group;
    },
    grid: function(links, x, y, rows, columns, title) {
        let group = document.createElement('div');
        group.classList.add('group');
        
        // Only add header if title is not empty or whitespace
        if (title && title.trim().length > 0) {
            let header = document.createElement('div');
            header.classList.add('group-header');
            header.textContent = title;
            header.style.width = 'fit-content'; // Make title fit to content
            group.appendChild(header);
        }

        // Create grid container
        let gridContainer = document.createElement('div');
        gridContainer.classList.add('grid');
        links.forEach(async link => {
            let favicon = getFavicon(link.url);
            gridContainer.innerHTML += newLink.grid(link.title, link.url, favicon);
        });
        group.appendChild(gridContainer);

        // Calculate position relative to screen center
        const pos = calculatePosition(x, y);

        // Ensure absolute positioning
        group.style.position = 'absolute';
        group.style.top = pos.y + 'px';
        group.style.left = pos.x + 'px';
        
        // Set up grid layout with specified rows and columns
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        gridContainer.style.gridGap = '10px';
        return group;
    },
    single: function(link, x, y, title) {
        let group = document.createElement('div');
        
        // Only add header if title is not empty or whitespace
        if (title && title.trim().length > 0) {
            let header = document.createElement('div');
            header.classList.add('group-header');
            header.textContent = title;
            header.style.width = 'fit-content'; // Make title fit to content
            group.appendChild(header);
        }

        let favicon = getFavicon(link.url);
        group.innerHTML += newLink.single(link.title, link.url, favicon);
        group.classList.add('group');
        group.classList.add('single');
        
        // Calculate position relative to screen center
        const pos = calculatePosition(x, y);
        
        // Ensure absolute positioning
        group.style.position = 'absolute';
        group.style.top = pos.y + 'px';
        group.style.left = pos.x + 'px';
        return group;
    }
};

const newLink = {
    stack: function(title, url, favicon) {
        return `
            <li href="${url}" class="link-stack">
                <a href="${url}"><img src="${favicon}"/>${title}</a>
            </li>
        `;
    },
    grid: function(title, url, favicon) {
        return `
            <a href="${url}" class="link-grid">
                <img src="${favicon}"/>
                <span>${title}</span>
            </a>
        `;
    },
    single: function(title, url, favicon) {
        return `
            <a href="${url}" class="link-single">
                <img src="${favicon}"/>
                <span>${title}</span>
            </a>
        `;
    }
};

// Remove this line that creates a hardcoded group
// container.appendChild(newGroup.stack(GROUPS[0].links, GROUPS[0].x, GROUPS[0].y, GROUPS[0].title));

// Function to load groups from storage
async function loadGroups() {
    console.log('Loading groups from storage...');
    try {
        let groups = [];
        
        // Check if chrome.storage is available (running as extension)
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            console.log('Chrome storage API available');
            const result = await chrome.storage.sync.get(['groups']);
            console.log('Chrome storage result:', result);
            groups = result.groups || [];
        } else {
            // Fallback for development/testing environment
            console.warn('Chrome storage API not available, using localStorage fallback');
            const savedGroups = localStorage.getItem('groups');
            groups = savedGroups ? JSON.parse(savedGroups) : [];
        }
        
        if (groups && groups.length > 0) {
            console.log(`Found ${groups.length} groups in storage`);
            
            // Clear container first to avoid duplicates
            container.innerHTML = '';
            
            groups.forEach((group, index) => {
                console.log(`Processing group ${index}: ${group.title} (${group.type})`);
                console.log(`Position: x=${group.x}, y=${group.y}`);
                
                let groupElement;
                switch (group.type) {
                    case 'stack':
                        groupElement = newGroup.stack(group.links, group.x, group.y, group.title);
                        break;
                    case 'grid':
                        groupElement = newGroup.grid(group.links, group.x, group.y, group.rows || 1, group.columns || 1, group.title);
                        break;
                    case 'single':
                        if (group.links && group.links.length > 0) {
                            groupElement = newGroup.single(group.links[0], group.x, group.y, group.title);
                        }
                        break;
                }
                
                if (groupElement) {
                    container.appendChild(groupElement);
                    console.log(`Group ${index} added to container`);
                } else {
                    console.warn(`Group ${index} could not be created`);
                }
            });
        } else {
            console.log('No groups found in storage');
        }
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

// Initialize search functionality
function initializeSearch() {
    // Set up search engines
    const searchEngines = {
        google: {
            url: 'https://www.google.com/search?q=',
            icon: 'https://www.google.com/favicon.ico'
        },
        bing: {
            url: 'https://www.bing.com/search?q=',
            icon: 'https://www.bing.com/favicon.ico'
        },
        duckduckgo: {
            url: 'https://duckduckgo.com/?q=',
            icon: 'https://duckduckgo.com/favicon.ico'
        },
        yahoo: {
            url: 'https://search.yahoo.com/search?p=',
            icon: 'https://www.yahoo.com/favicon.ico'
        }
    };
    
    // Get current search engine from settings
    const engine = searchEngines[currentSettings.searchEngine] || searchEngines.google;
    
    // Set search icon
    searchIcon.src = engine.icon;
    
    // Handle search form submission
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = engine.url + encodeURIComponent(query);
        }
    });
    
    // Position search according to settings
    if (currentSettings.searchBarPosition) {
        // Use the same positioning calculation as groups
        const pos = calculatePosition(
            currentSettings.searchBarPosition.x,
            currentSettings.searchBarPosition.y
        );
        searchContainer.style.top = `${pos.y}px`;
        searchContainer.style.left = `${pos.x}px`;
        searchContainer.style.transform = 'none'; // Remove default centering
    }
    
    // Show/hide based on settings
    searchContainer.style.display = currentSettings.showSearch ? 'block' : 'none';
}

// Apply theme and accessibility settings
function applyTheme() {
    const theme = currentSettings.theme || 'light';
    const isCustomTheme = theme.startsWith('custom-');
    
    // Set CSS variables for colors
    if (isCustomTheme) {
        // Find the custom theme
        if (currentSettings.customThemes) {
            const customTheme = currentSettings.customThemes.find(t => t.id === theme);
            if (customTheme) {
                document.documentElement.style.setProperty('--all-background-color', customTheme.background);
                document.documentElement.style.setProperty('--group-background-color', customTheme.secondary);
                document.documentElement.style.setProperty('--text-color', customTheme.text);
                document.documentElement.style.setProperty('--accent-color', customTheme.accent);
                document.documentElement.style.setProperty('--primary-color', customTheme.primary);
            } else {
                // Fallback to default theme if custom theme not found
                document.documentElement.style.setProperty('--all-background-color', '#f1faee');
                document.documentElement.style.setProperty('--group-background-color', '#a8dadc');
                document.documentElement.style.setProperty('--text-color', '#1d3557');
                document.documentElement.style.setProperty('--accent-color', '#e63946');
                document.documentElement.style.setProperty('--primary-color', '#457b9d');
            }
        } else {
            // Fallback if customThemes array doesn't exist
            document.documentElement.style.setProperty('--all-background-color', '#f1faee');
            document.documentElement.style.setProperty('--group-background-color', '#a8dadc');
            document.documentElement.style.setProperty('--text-color', '#1d3557');
            document.documentElement.style.setProperty('--accent-color', '#e63946');
            document.documentElement.style.setProperty('--primary-color', '#457b9d');
        }
    } else if (theme === 'custom') {
        // Apply colors from current custom color values
        const customPrimary = '#457b9d'; // Default values
        const customSecondary = '#a8dadc';
        const customAccent = '#e63946';
        const customText = '#1d3557';
        const customBackground = '#f1faee';
        
        document.documentElement.style.setProperty('--all-background-color', customBackground);
        document.documentElement.style.setProperty('--group-background-color', customSecondary);
        document.documentElement.style.setProperty('--text-color', customText);
        document.documentElement.style.setProperty('--accent-color', customAccent);
        document.documentElement.style.setProperty('--primary-color', customPrimary);
    } else {
        document.documentElement.style.setProperty('--all-background-color', `var(--${theme}-background, #f1faee)`);
        document.documentElement.style.setProperty('--group-background-color', `var(--${theme}-secondary, #a8dadc)`);
        document.documentElement.style.setProperty('--text-color', `var(--${theme}-text, #1d3557)`);
        document.documentElement.style.setProperty('--accent-color', `var(--${theme}-accent, #e63946)`);
        document.documentElement.style.setProperty('--primary-color', `var(--${theme}-primary, #457b9d)`);
    }
    
    // Apply custom background if enabled
    if (currentSettings.useCustomBackground) {
        // Prefer stored image over URL
        if (currentSettings.backgroundImage) {
            document.body.style.backgroundImage = `url(${currentSettings.backgroundImage})`;
        } else if (currentSettings.backgroundURL) {
            document.body.style.backgroundImage = `url(${currentSettings.backgroundURL})`;
        }
    } else {
        document.body.style.backgroundImage = 'none';
    }
    
    // Apply accessibility settings
    if (currentSettings.fontSize) {
        document.documentElement.style.setProperty('--base-font-size', `${currentSettings.fontSize}px`);
    }
    
    if (currentSettings.groupScale) {
        document.documentElement.style.setProperty('--group-scale', currentSettings.groupScale / 100);
    }
    
    if (currentSettings.spacingScale) {
        document.documentElement.style.setProperty('--spacing-scale', currentSettings.spacingScale / 100);
    }
    
    // Apply high contrast if enabled
    if (currentSettings.highContrast) {
        document.documentElement.style.setProperty('--text-color', '#000000');
        document.documentElement.style.setProperty('--accent-color', '#FF0000');
    }
    
    // Apply SVG color for settings button
    const settingsIcon = document.querySelector('#settings-button img');
    if (settingsIcon) {
        settingsIcon.style.filter = `invert(${theme === 'dark' || theme === 'midnight' || theme === 'emerald' || theme === 'slate' || theme === 'deep' || theme === 'nord' || theme === 'cyber' ? 1 : 0})`;
    }
    
    // Add theme class to body
    document.body.className = ''; // Clear existing classes
    document.body.classList.add(`theme-${theme.split('-')[0]}`);
}

// Setup drag and drop for image search
function setupImageDrop() {
    const searchContainer = document.getElementById('search-container');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    
    // Ensure the search container exists
    if (!searchContainer) {
        console.error('Search container element not found');
        return;
    }
    
    // Create drop indicator
    const dropIndicator = document.createElement('div');
    dropIndicator.className = 'drop-indicator';
    dropIndicator.textContent = 'Drop image here to search';
    dropIndicator.style.display = 'none';
    dropIndicator.style.position = 'absolute';
    dropIndicator.style.top = '0';
    dropIndicator.style.left = '0';
    dropIndicator.style.width = '100%';
    dropIndicator.style.height = '100%';
    dropIndicator.style.display = 'none';
    dropIndicator.style.alignItems = 'center';
    dropIndicator.style.justifyContent = 'center';
    dropIndicator.style.backgroundColor = 'rgba(0,0,0,0.1)';
    dropIndicator.style.borderRadius = '24px';
    dropIndicator.style.fontWeight = 'bold';
    dropIndicator.style.zIndex = '10';
    searchContainer.appendChild(dropIndicator);
    
    // Track whether drag is active
    let dragActive = false;
    
    // Handle dragover
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        
        // Check if file is being dragged
        if (e.dataTransfer && e.dataTransfer.types && e.dataTransfer.types.includes('Files')) {
            dragActive = true;
            searchContainer.classList.add('drop-active');
            if (searchForm) searchForm.style.display = 'none';
            dropIndicator.style.display = 'flex';
        }
    });
    
    // Handle dragleave
    document.addEventListener('dragleave', (e) => {
        // Only deactivate if leaving to an element outside the search container
        // or if leaving to null (outside the document)
        if (!e.relatedTarget || !searchContainer.contains(e.relatedTarget)) {
            dragActive = false;
            searchContainer.classList.remove('drop-active');
            if (searchForm) searchForm.style.display = 'flex';
            dropIndicator.style.display = 'none';
        }
    });
    
    // Handle drop
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        
        // Reset state
        dragActive = false;
        searchContainer.classList.remove('drop-active');
        if (searchForm) searchForm.style.display = 'flex';
        dropIndicator.style.display = 'none';
        
        // Process the dropped file
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            
            // Check if it's an image
            if (file.type && file.type.startsWith('image/')) {
                performImageSearch(file);
            } else {
                console.warn('Dropped file is not an image:', file.type);
            }
        }
    });
    
    // Add fallback for drag end (in case dragleave doesn't fire)
    document.addEventListener('dragend', () => {
        if (dragActive) {
            dragActive = false;
            searchContainer.classList.remove('drop-active');
            if (searchForm) searchForm.style.display = 'flex';
            dropIndicator.style.display = 'none';
        }
    });
}

// Perform image search
function performImageSearch(imageFile) {
    if (!imageFile) {
        console.error('No image file provided for search');
        return;
    }
    
    try {
        const searchEngine = currentSettings.searchEngine || 'google';
        const reader = new FileReader();
        
        reader.onerror = function(error) {
            console.error('Error reading image file:', error);
            alert('There was an error processing your image. Please try again.');
        };
        
        reader.onload = function(e) {
            try {
                const base64Image = e.target.result;
                
                // Build URL for image search based on search engine
                let searchUrl;
                
                switch (searchEngine) {
                    case 'google':
                        // For Google, we need to redirect to Google Images
                        searchUrl = 'https://images.google.com/';
                        break;
                        
                    case 'bing':
                        // Bing supports drag and drop on their image search page
                        searchUrl = 'https://www.bing.com/images/search?view=detailv2&iss=sbiupload';
                        break;
                    
                    case 'yandex':
                        // Yandex image search
                        searchUrl = 'https://yandex.com/images/search';
                        break;
                        
                    default:
                        // Default to Google
                        searchUrl = 'https://images.google.com/';
                }
                
                // Open in a new tab to avoid losing user's current state
                window.open(searchUrl, '_blank');
            } catch (urlError) {
                console.error('Error navigating to search URL:', urlError);
                // Fallback to Google Images if there's an error
                window.open('https://images.google.com/', '_blank');
            }
        };
        
        // Start reading the file
        reader.readAsDataURL(imageFile);
    } catch (error) {
        console.error('Error in image search functionality:', error);
        alert('There was an error processing your image search. Please try again.');
    }
}

// Load everything when page loads
// Initialize header links
function initializeHeaderLinks() {
    const headerNav = document.querySelector('.header-nav');
    const appsDropdownContainer = headerNav.querySelector('.apps-dropdown-container');
    
    // Clear current links (keeping the apps dropdown)
    while (headerNav.firstChild) {
        if (headerNav.firstChild === appsDropdownContainer) {
            break;
        }
        headerNav.removeChild(headerNav.firstChild);
    }
    
    // Add header links from settings
    if (currentSettings.headerLinks && currentSettings.headerLinks.length > 0) {
        // Insert links before the apps dropdown
        currentSettings.headerLinks.forEach(link => {
            const linkElement = document.createElement('a');
            linkElement.href = link.url;
            linkElement.className = 'nav-link';
            linkElement.textContent = link.name;
            
            headerNav.insertBefore(linkElement, appsDropdownContainer);
        });
    }
}

// Initialize apps dropdown
function initializeAppsDropdown() {
    const appsToggle = document.getElementById('apps-toggle');
    const appsDropdown = document.getElementById('apps-dropdown');
    const appsGrid = document.querySelector('.apps-grid');
    
    // Toggle dropdown visibility
    appsToggle.addEventListener('click', function() {
        appsDropdown.style.display = appsDropdown.style.display === 'block' ? 'none' : 'block';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!appsToggle.contains(event.target) && !appsDropdown.contains(event.target)) {
            appsDropdown.style.display = 'none';
        }
    });
    
    // Populate apps grid
    if (currentSettings.apps && currentSettings.apps.length > 0) {
        appsGrid.innerHTML = ''; // Clear any existing apps
        
        currentSettings.apps.forEach(app => {
            const appItem = document.createElement('a');
            appItem.href = app.url;
            appItem.className = 'app-item';
            
            const appIcon = document.createElement('img');
            appIcon.src = app.icon;
            appIcon.alt = app.name;
            appIcon.className = 'app-icon';
            
            const appName = document.createElement('span');
            appName.textContent = app.name;
            appName.className = 'app-name';
            
            appItem.appendChild(appIcon);
            appItem.appendChild(appName);
            appsGrid.appendChild(appItem);
        });
        
        // Add the customize apps option (only visible in editor)
        if (window.location.href.includes('editor')) {
            const footer = document.createElement('div');
            footer.className = 'apps-footer';
            
            const customizeLink = document.createElement('a');
            customizeLink.href = '#';
            customizeLink.className = 'customize-apps';
            customizeLink.textContent = 'Customize apps';
            customizeLink.addEventListener('click', function(e) {
                e.preventDefault();
                // Open the apps manager if we're in the editor
                if (typeof openAppsManager === 'function') {
                    openAppsManager();
                }
            });
            
            footer.appendChild(customizeLink);
            appsDropdown.appendChild(footer);
        }
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load settings first
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            try {
                const result = await chrome.storage.sync.get(['settings']);
                if (result.settings) {
                    currentSettings = result.settings;
                } else {
                    console.warn('No settings found in Chrome storage, using defaults');
                    currentSettings = {...defaultSettings};
                }
            } catch (storageError) {
                console.error('Error accessing Chrome storage:', storageError);
                currentSettings = {...defaultSettings};
            }
        } else {
            // Fallback for development
            try {
                const savedSettings = localStorage.getItem('settings');
                if (savedSettings) {
                    currentSettings = JSON.parse(savedSettings);
                } else {
                    console.warn('No settings found in localStorage, using defaults');
                    currentSettings = {...defaultSettings};
                }
            } catch (localStorageError) {
                console.error('Error accessing localStorage:', localStorageError);
                currentSettings = {...defaultSettings};
            }
        }
        
        // Ensure critical settings properties exist
        if (!currentSettings.apps) {
            currentSettings.apps = [...defaultSettings.apps];
        }
        
        if (!currentSettings.headerLinks) {
            currentSettings.headerLinks = [...defaultSettings.headerLinks];
        }
        
        if (!currentSettings.searchBarPosition) {
            currentSettings.searchBarPosition = {...defaultSettings.searchBarPosition};
        }
        
        // Apply theme
        applyTheme();
        
        // Initialize search
        initializeSearch();
        
        // Initialize header links
        initializeHeaderLinks();
        
        // Initialize apps dropdown
        initializeAppsDropdown();
        
        // Set up image drop functionality
        setupImageDrop();
        
        // Load groups
        loadGroups();
        
        // Add window resize handler
        window.addEventListener('resize', handleWindowResize);
        
    } catch (error) {
        console.error('Error initializing new tab page:', error);
        // Continue with defaults
        currentSettings = {...defaultSettings};
        try {
            applyTheme();
            initializeSearch();
            initializeHeaderLinks();
            initializeAppsDropdown();
            loadGroups();
            window.addEventListener('resize', handleWindowResize);
        } catch (fallbackError) {
            console.error('Critical error in fallback initialization:', fallbackError);
            // Display error message to user
            const errorDiv = document.createElement('div');
            errorDiv.style.padding = '20px';
            errorDiv.style.margin = '20px auto';
            errorDiv.style.maxWidth = '500px';
            errorDiv.style.backgroundColor = '#ffdddd';
            errorDiv.style.border = '1px solid #ff0000';
            errorDiv.style.borderRadius = '5px';
            errorDiv.innerHTML = `
                <h3>Error Loading New Tab Page</h3>
                <p>There was a problem loading your new tab page settings. Try refreshing the page.</p>
                <p>If the problem persists, try resetting your settings from the settings page.</p>
            `;
            document.body.appendChild(errorDiv);
        }
    }
});

// Handle window resize
function handleWindowResize() {
    // Redraw all elements with updated positions
    loadGroups();
    
    // Reposition search
    if (currentSettings.searchBarPosition) {
        const pos = calculatePosition(
            currentSettings.searchBarPosition.x,
            currentSettings.searchBarPosition.y
        );
        searchContainer.style.top = `${pos.y}px`;
        searchContainer.style.left = `${pos.x}px`;
    }
}

function getFavicon(url) {
    try {
        if (!url) return ''; // Return empty if url is empty
        
        // Make sure URL is properly formatted
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        const domain = new URL(url).hostname;
        // Use www subdomain to improve favicon hit rate
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch (e) {
        console.warn('Error getting favicon for URL:', url, e);
        // Return a default icon instead of empty string
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItbGluayI+PHBhdGggZD0iTTEwIDEzYTUgNSAwIDAgMCA3LjU0LjU0bDMtM2E1IDUgMCAwIDAtNy4wNy03LjA3bC0xLjcyIDEuNzEiPjwvcGF0aD48cGF0aCBkPSJNMTQgMTFhNSA1IDAgMCAwLTcuNTQtLjU0bC0zIDNhNSA1IDAgMCAwIDcuMDcgNy4wN2wxLjcxLTEuNzEiPjwvcGF0aD48L3N2Zz4=';
    }
}