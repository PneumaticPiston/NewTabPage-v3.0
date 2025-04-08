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
    searchBarPosition: { x: 10, y: 120 }
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
    // Convert stored position from old coordinate system to center-relative
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    
    // Convert from absolute to center-relative
    const relX = x - centerX;
    const relY = y - centerY;
    
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
        searchContainer.style.top = `${currentSettings.searchBarPosition.y}px`;
        searchContainer.style.left = `${currentSettings.searchBarPosition.x}px`;
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
        const customTheme = currentSettings.customThemes.find(t => t.id === theme);
        if (customTheme) {
            document.documentElement.style.setProperty('--all-background-color', customTheme.background);
            document.documentElement.style.setProperty('--group-background-color', customTheme.secondary);
            document.documentElement.style.setProperty('--text-color', customTheme.text);
            document.documentElement.style.setProperty('--accent-color', customTheme.accent);
            document.documentElement.style.setProperty('--primary-color', customTheme.primary);
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
    
    // Create drop indicator
    const dropIndicator = document.createElement('div');
    dropIndicator.className = 'drop-indicator';
    dropIndicator.textContent = 'Drop image here to search';
    dropIndicator.style.display = 'none';
    searchContainer.appendChild(dropIndicator);
    
    // Handle dragover
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        
        // Check if file is being dragged
        if (e.dataTransfer.types.includes('Files')) {
            searchContainer.classList.add('drop-active');
            dropIndicator.style.display = 'flex';
            searchForm.style.display = 'none';
        }
    });
    
    // Handle dragleave
    document.addEventListener('dragleave', (e) => {
        if (!e.relatedTarget || !searchContainer.contains(e.relatedTarget)) {
            searchContainer.classList.remove('drop-active');
            dropIndicator.style.display = 'none';
            searchForm.style.display = 'flex';
        }
    });
    
    // Handle drop
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        
        searchContainer.classList.remove('drop-active');
        dropIndicator.style.display = 'none';
        searchForm.style.display = 'flex';
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            
            // Check if it's an image
            if (file.type.startsWith('image/')) {
                performImageSearch(file);
            }
        }
    });
}

// Perform image search
function performImageSearch(imageFile) {
    const searchEngine = currentSettings.searchEngine || 'google';
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const base64Image = e.target.result;
        
        // Build URL for image search based on search engine
        let searchUrl;
        
        switch (searchEngine) {
            case 'google':
                // For Google, we need to redirect to Google Images
                // We'd need to upload the image to a temporary location to do this properly
                // But for now, we'll just redirect to Google Images
                searchUrl = 'https://images.google.com/';
                break;
                
            case 'bing':
                // Bing supports drag and drop on their image search page
                searchUrl = 'https://www.bing.com/images/';
                break;
                
            default:
                // Default to Google
                searchUrl = 'https://images.google.com/';
        }
        
        // Navigate to the search URL
        window.location.href = searchUrl;
    };
    
    reader.readAsDataURL(imageFile);
}

// Load everything when page loads
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load settings first
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            const result = await chrome.storage.sync.get(['settings']);
            if (result.settings) {
                currentSettings = result.settings;
            }
        } else {
            // Fallback for development
            const savedSettings = localStorage.getItem('settings');
            if (savedSettings) {
                currentSettings = JSON.parse(savedSettings);
            }
        }
        
        // Apply theme
        applyTheme();
        
        // Initialize search
        initializeSearch();
        
        // Set up image drop functionality
        setupImageDrop();
        
        // Load groups
        loadGroups();
        
    } catch (error) {
        console.error('Error initializing new tab page:', error);
        // Continue with defaults
        loadGroups();
    }
});

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
        return ''; // Return empty string if URL is invalid
    }
}