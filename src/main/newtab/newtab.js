const Debugger = {
    log: (message) => {
        if(this.debugging) {
            console.log(message);
        }
    },
    error: (message) => {
        if(this.debugging) {
            console.error(message);
        }
    },
    warn: (message) => {
        if(this.debugging) {
            console.warn(message);
        }
    },
    debugging: false,
    debugging: {
        enable: function() {
            this.debugging = true;
        },
        disable: function() {
            this.debugging = false;
        }
    }
}

// Debugger.debugging.enable(); // Enable debugging

async function fetchSettingsAndGroups() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        Debugger.log('Using Chrome storage API');
      const { settings, groups, groupsLocation } = await chrome.storage.local.get(
        ['settings', 'groups', 'groupsLocation']
      );
      let finalGroups = groups;
      if (groupsLocation === 'local') {
        const local = await chrome.storage.local.get(['groups']);
        finalGroups = local.groups || [];
      }
      return {
        settings: settings || defaultSettings,
        groups: finalGroups || []
      };
    }
    const s = JSON.parse(localStorage.getItem('settings') || 'null') || defaultSettings;
    const g = JSON.parse(localStorage.getItem('groups') || '[]');
    return { settings: s, groups: g };
}

async function initializePage() {
    try {
        // Start performance measurement
        const endMeasure = measureLoadTime('Page initialization');
        
        // Load settings and groups in parallel - this is already good!
        const [settings, groups] = await Promise.all([
            getFromStorage('settings'),
            getFromStorage('groups')
        ]);
        
        // First apply critical settings that affect visual display
        applyTheme();
        initializeSearch();
        
        // Then start rendering content in parallel
        requestAnimationFrame(() => {
            // Use Promise.all for parallel operations that can happen simultaneously
            Promise.all([
                renderGroups(groups),
                initializeHeaderLinks(),
                initializeAppsDropdown()
            ]).then(() => {
                // Only after critical content is loaded, load non-critical elements
                setTimeout(() => {
                    loadWidgets();
                    setupImageDrop(); 
                }, 100);
                
                endMeasure();
            });
        });
    } catch (error) {
        Debugger.error('Error initializing:', error);
    }
}

function measureLoadTime(label) {
    const start = performance.now();
    return () => {
        const duration = performance.now() - start;
        Debugger.log(`${label} took ${duration}ms`);
    };
}

const endMeasure = measureLoadTime('Group loading');

const container = document.getElementById('groups-container');
const searchContainer = document.getElementById('search-container');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchIcon = document.getElementById('search-icon');

// Default settings
const defaultSettings = {
    theme: 'light',
    useCustomBackground: false,
    backgroundURL: '',
    backgroundImage: null,
    showSearch: true,
    searchEngine: 'google',
    searchBarPosition: { x: 540, y: 360 }, // Assumes that the display is at least 1080x720
    useGlassBackground: true, // Default to true for glass background effect
    fontSize: 16,
    groupScale: 100, // Global scaling factor
    customColors: {
        primary: '#457b9d',
        secondary: '#a8dadc',
        accent: '#e63946',
        text: '#1d3557',
        background: '#f1faee'
    },
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

// Function to position elements relative to viewport using percentages
function calculatePosition(x, y) {
    // Get screen dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Handle legacy format (numbers or strings with percentages)
    let percentX, percentY;
    
    // Handle percentage strings
    if (typeof x === 'string' && x.endsWith('%')) {
        percentX = parseFloat(x) / 100;
    } 
    // Handle numeric values (convert to percentage)
    else {
        const numX = parseFloat(x);
        percentX = !isNaN(numX) ? numX / screenWidth : 0.5; // Default to center if invalid
    }
    
    if (typeof y === 'string' && y.endsWith('%')) {
        percentY = parseFloat(y) / 100;
    }
    // Handle numeric values (convert to percentage)
    else {
        const numY = parseFloat(y);
        percentY = !isNaN(numY) ? numY / screenHeight : 0.5; // Default to center if invalid
    }
    
    // Ensure percentages are within bounds
    percentX = Math.max(0, Math.min(1, percentX));
    percentY = Math.max(0, Math.min(1, percentY));
    
    // Calculate absolute position based on current screen size
    const newX = percentX * screenWidth;
    const newY = percentY * screenHeight;
    
    return { 
        x: newX, 
        y: newY,
        percentX: percentX,
        percentY: percentY
    };
}

const newGroup = {
    stack: function(links, x, y, title) {
        let group = document.createElement('div');
        group.classList.add('group');
        group.classList.add('stack');
        
        // Add glass background class only if enabled in settings
        if (currentSettings.useGlassBackground !== false) {
            group.classList.add('glass-background');
        }
        
        // Only add header if title is not empty or whitespace
        if (title && title.trim().length > 0) {
            let header = document.createElement('div');
            header.classList.add('group-header');
            header.textContent = title;
            // Don't set inline width styles - let CSS handle it
            group.appendChild(header);
        }

        // Create link container
        let linkContainer = document.createElement('ul');
        links.forEach(async link => {
            let favicon = getFavicon(link.url);
            linkContainer.innerHTML += newLink.stack(link.title, link.url, favicon);
        });
        group.appendChild(linkContainer);

        // Calculate position using percentage-based system
        const pos = calculatePosition(x, y);

        // Ensure absolute positioning with percentages
        group.style.position = 'absolute';
        group.style.top = `${pos.percentY * 100}%`;
        group.style.left = `${pos.percentX * 100}%`;
        group.style.transform = 'translate(-50%, -50%)';
        return group;
    },
    grid: function(links, x, y, rows, columns, title) {
        let group = document.createElement('div');
        group.classList.add('group');
        
        // Add glass background class only if enabled in settings
        if (currentSettings.useGlassBackground !== false) {
            group.classList.add('glass-background');
        }
        
        // Only add header if title is not empty or whitespace
        if (title && title.trim().length > 0) {
            let header = document.createElement('div');
            header.classList.add('group-header');
            header.textContent = title;
            // Don't set inline width styles - let CSS handle it
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

        // Calculate position using percentage-based system
        const pos = calculatePosition(x, y);

        // Ensure absolute positioning with percentages
        group.style.position = 'absolute';
        group.style.top = `${pos.percentY * 100}%`;
        group.style.left = `${pos.percentX * 100}%`;
        group.style.transform = 'translate(-50%, -50%)';
        
        // Set up grid layout with specified rows and columns
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        gridContainer.style.gridGap = '10px';
        return group;
    },
    single: function(link, x, y, title) {
        let group = document.createElement('div');
        
        // Add glass background class only if enabled in settings
        if (currentSettings.useGlassBackground !== false) {
            group.classList.add('glass-background');
        }
        
        // Only add header if title is not empty or whitespace
        if (title && title.trim().length > 0) {
            let header = document.createElement('div');
            header.classList.add('group-header');
            header.textContent = title;
            // Don't set inline width styles - let CSS handle it
            group.appendChild(header);
        }

        let favicon = getFavicon(link.url);
        group.innerHTML += newLink.single(link.title, link.url, favicon);
        group.classList.add('group');
        group.classList.add('single');
        
        // Calculate position using percentage-based system
        const pos = calculatePosition(x, y);
        
        // Ensure absolute positioning with percentages
        group.style.position = 'absolute';
        group.style.top = `${pos.percentY * 100}%`;
        group.style.left = `${pos.percentX * 100}%`;
        group.style.transform = 'translate(-50%, -50%)';
        return group;
    }
};

const newLink = {
    stack: function(title, url, favicon) {
        return `
            <li class="link-stack">
                <a href="${url}"><img class="link-image" src="${favicon}"/>${title}</a>
            </li>
        `;
    },
    grid: function(title, url, favicon) {
        return `
            <a href="${url}"class="link-grid">
                <img class="link-image" src="${favicon}"/>
                <span class="grid-link-title">${title}</span>
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
async function lazyRenderGroups(groups) {
    const container = document.getElementById('groups-container');
    container.innerHTML = '';
    // Build placeholders array with computed top/left strings
    const placeholders = groups.map(group => {
      const percentX = typeof group.x === 'string' && group.x.endsWith('%')
        ? group.x
        : `${(parseFloat(group.x) / window.innerWidth) * 100}%`;
      const percentY = typeof group.y === 'string' && group.y.endsWith('%')
        ? group.y
        : `${(parseFloat(group.y) / window.innerHeight) * 100}%`;
      const ph = createGroupPlaceholder({ styleTop: percentY, styleLeft: percentX });
      container.appendChild(ph);
      return ph;
    });
    const fill = () => {
      placeholders.forEach((ph, idx) => {
        renderGroupContent(ph, groups[idx]);
      });
    };
    if ('requestIdleCallback' in window) {
      requestIdleCallback(fill, { timeout: 200 });
    } else {
      requestAnimationFrame(fill);
    }
}
function deferNonCritical() {
    const work = () => {
      loadWidgets();
      setupImageDrop();
    };
    if ('requestIdleCallback' in window) {
      requestIdleCallback(work);
    } else {
      setTimeout(work, 200);
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
        searchContainer.style.top = `${pos.percentY * 100}%`;
        searchContainer.style.left = `${pos.percentX * 100}%`;
        searchContainer.style.transform = 'translate(-50%, -50%)';
    }
    
    // Show/hide based on settings
    searchContainer.style.display = currentSettings.showSearch ? 'block' : 'none';
}

// Apply glass background setting to all relevant elements
function applyGlassBackground() {
    const useGlass = currentSettings.useGlassBackground !== false;
    
    // Apply to header
    const header = document.querySelector('.chrome-header');
    if (header) {
        if (useGlass) {
            header.classList.add('glass-background');
        } else {
            header.classList.remove('glass-background');
        }
    }
    
    // Apply to search form
    const searchForm = document.querySelector('.search-form');
    const searchContainer = document.querySelector('.search-container');
    if (searchForm) {
        if (useGlass) {
            searchContainer.classList.add('glass-background');
            searchForm.classList.add('glass-background');
        } else {
            searchContainer.classList.remove('glass-background');
            searchForm.classList.remove('glass-background');
        }
    }
    
    // Apply to apps dropdown
    const appsDropdown = document.querySelector('.apps-dropdown');
    if (appsDropdown) {
        if (useGlass) {
            appsDropdown.classList.add('glass-background');
        } else {
            appsDropdown.classList.remove('glass-background');
        }
    }
    
    // Apply to apps grid
    const appsGrid = document.querySelector('.apps-grid');
    if (appsGrid) {
        if (useGlass) {
            appsGrid.classList.add('glass-background');
        } else {
            appsGrid.classList.remove('glass-background');
        }
    }
    
    // Apply to all existing groups
    const groups = document.querySelectorAll('.group');
    groups.forEach(group => {
        if (useGlass) {
            group.classList.add('glass-background');
        } else {
            group.classList.remove('glass-background');
        }
    });
}

// Apply theme and accessibility settings
function applyTheme() {
    // —————————————————————————————
    // 1) Remove old theme-* classes
    // —————————————————————————————
    const themePrefix = 'theme-';
    Array.from(document.body.classList)
      .filter(c => c.startsWith(themePrefix))
      .forEach(c => document.body.classList.remove(c));
  
    // —————————————————————————————
    // 2) Determine current theme & dark set
    // —————————————————————————————
    const t = currentSettings.theme || 'light';
    const base = t.split('-')[0];
    const darkThemes = new Set(['dark','midnight','emerald','slate','deep','nord','cyber']);
    const isCustomTheme = t.startsWith('custom-') || t === 'custom';
  
    // —————————————————————————————
    // 3) Write color CSS-vars on :root
    // —————————————————————————————
    if (isCustomTheme) {
        if (t === 'custom') {
            // Handle base custom theme using customColors
            const customColors = currentSettings.customColors || {
                primary: '#457b9d',
                secondary: '#a8dadc',
                accent: '#e63946',
                text: '#1d3557',
                background: '#f1faee'
            };
            
            // Apply custom colors
            document.documentElement.style.setProperty('--all-background-color', customColors.background);
            document.documentElement.style.setProperty('--group-background-color', customColors.secondary);
            document.documentElement.style.setProperty('--text-color', customColors.text);
            document.documentElement.style.setProperty('--accent-color', customColors.accent);
            document.documentElement.style.setProperty('--primary-color', customColors.primary);
            
            // Set contrast text color - white for dark themes, black for light themes
            const isDarkBackground = isColorDark(customColors.primary);
            document.documentElement.style.setProperty('--contrast-text-color', isDarkBackground ? '#ffffff' : '#000000');
        } else {
            // Handle saved custom themes - find the custom theme in settings
            const customTheme = currentSettings.customThemes && currentSettings.customThemes.find(theme => theme.id === t);
            if (customTheme) {
                // Apply direct color values for custom themes
                document.documentElement.style.setProperty('--all-background-color', customTheme.background);
                document.documentElement.style.setProperty('--group-background-color', customTheme.secondary);
                document.documentElement.style.setProperty('--text-color', customTheme.text);
                document.documentElement.style.setProperty('--accent-color', customTheme.accent);
                document.documentElement.style.setProperty('--primary-color', customTheme.primary);
                
                // Set contrast text color - white for dark themes, black for light themes
                const isDarkBackground = isColorDark(customTheme.primary);
                document.documentElement.style.setProperty('--contrast-text-color', isDarkBackground ? '#ffffff' : '#000000');
            } else {
                // Fallback to light theme if custom theme not found
                document.documentElement.style.setProperty('--all-background-color', '#f1faee');
                document.documentElement.style.setProperty('--group-background-color', '#a8dadc');
                document.documentElement.style.setProperty('--text-color', '#1d3557');
                document.documentElement.style.setProperty('--accent-color', '#e63946');
                document.documentElement.style.setProperty('--primary-color', '#457b9d');
                document.documentElement.style.setProperty('--contrast-text-color', '#000000');
            }
        }
    } else {
        // Handle built-in themes using CSS variables
        document.documentElement.style.setProperty(
          '--all-background-color',
          `var(--${t}-background, #f1faee)`
        );
        document.documentElement.style.setProperty(
          '--group-background-color',
          `var(--${t}-secondary, #a8dadc)`
        );
        document.documentElement.style.setProperty(
          '--text-color',
          `var(--${t}-text, #1d3557)`
        );
        document.documentElement.style.setProperty(
          '--accent-color',
          `var(--${t}-accent, #e63946)`
        );
        document.documentElement.style.setProperty(
          '--primary-color',
          `var(--${t}-primary, #457b9d)`
        );
        document.documentElement.style.setProperty(
          '--contrast-text-color',
          darkThemes.has(base) ? '#ffffff' : '#000000'
        );
    }
  
    // —————————————————————————————
    // 4) Inline the body’s background
    // —————————————————————————————
    // Always set the fallback color:
    const bgColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--all-background-color');
    document.body.style.backgroundColor = bgColor;

  
    // —————————————————————————————
    // 5) Add the new theme class
    // —————————————————————————————
    document.body.classList.add(`theme-${base}`);
  
    // —————————————————————————————
    // 6) Accessibility & scaling
    // —————————————————————————————
    if (currentSettings.fontSize) {
      document.documentElement.style.setProperty(
        '--base-font-size',
        `${currentSettings.fontSize}px`
      );
    }
    if (currentSettings.groupScale) {
      const scaleValue = currentSettings.groupScale/100;
      // Set CSS variables for individual element scaling
      document.documentElement.style.setProperty('--group-scale', `${scaleValue}`);
      document.documentElement.style.setProperty('--element-scale', `${scaleValue}`);
      document.documentElement.style.setProperty('--spacing-multiplier', `${scaleValue}`);
      
      // Apply global scaling to all elements
      document.documentElement.style.transform = `scale(${scaleValue})`;
      document.documentElement.style.transformOrigin = 'center top';
      
      // Adjust the body to account for scaling
      if (scaleValue !== 1) {
        // Adjust body height to prevent scrollbars when scaling
        document.body.style.height = `${100 / scaleValue}vh`;
        document.body.style.width = `${100 / scaleValue}vw`;
        document.body.style.maxWidth = 'none';
        document.body.style.overflow = 'hidden';
      }
    }
    if (currentSettings.highContrast) {
      document.documentElement.style.setProperty('--text-color', '#000000');
      document.documentElement.style.setProperty('--accent-color', '#FF0000');
    }
  
    // —————————————————————————————
    // 7) Invert settings icon for dark
    // —————————————————————————————
    const icon = document.querySelector('#settings-button img');
    if (icon) {
      icon.style.filter = darkThemes.has(base) ? 'invert(1)' : 'invert(0)';
    }
    
    // —————————————————————————————
    // 8) Apply glass background settings
    // —————————————————————————————
    applyGlassBackground();
  }
  

// Setup drag and drop for image search
function setupImageDrop() {
    const searchContainer = document.getElementById('search-container');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    
    // Ensure the search container exists
    if (!searchContainer) {
        Debugger.error('Search container element not found');
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
                Debugger.warn('Dropped file is not an image:', file.type);
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
        Debugger.error('No image file provided for search');
        return;
    }
    
    try {
        const searchEngine = currentSettings.searchEngine || 'google';
        const reader = new FileReader();
        
        reader.onerror = function(error) {
            Debugger.error('Error reading image file:', error);
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
                Debugger.error('Error navigating to search URL:', urlError);
                // Fallback to Google Images if there's an error
                window.open('https://images.google.com/', '_blank');
            }
        };
        
        // Start reading the file
        reader.readAsDataURL(imageFile);
    } catch (error) {
        Debugger.error('Error in image search functionality:', error);
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

/// Initialize apps dropdown
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
            // Use getFavicon instead of direct icon URL
            appIcon.src = getFavicon(app.url);
            appIcon.alt = app.name;
            appIcon.className = 'app-icon';
            
            // Handle icon load error
            appIcon.onerror = function() {
                // If the icon fails to load and it's different from the original icon URL,
                // try the original icon URL as fallback
                if (appIcon.src !== app.icon) {
                    appIcon.src = app.icon;
                }
            };
            
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

// Function removed - using direct approach

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load settings and groups
        const { settings, groups } = await fetchSettingsAndGroups();
        currentSettings = { ...defaultSettings, ...settings };
        
        // Apply theme for colors 
        applyTheme();
        
        // Initialize the core page elements first
        initializeSearch();
        initializeHeaderLinks();
        lazyRenderGroups(groups);
        initializeAppsDropdown();
        
        // Load non-critical elements second
        deferNonCritical();
        
        // Load the background image last, after all other elements are loaded
        setTimeout(() => {
            // Check for background image
            if (currentSettings.useCustomBackground) {
                // Apply transition class for smooth fade-in
                document.body.classList.add('bg-transition');
                
                // Preload the image before applying to enable smooth transition
                const preloadBackgroundImage = (imageUrl, callback) => {
                    if (!imageUrl) {
                        if (callback) callback(false);
                        return;
                    }
                    
                    const img = new Image();
                    img.onload = function() {
                        if (callback) callback(true, imageUrl);
                    };
                    img.onerror = function() {
                        if (callback) callback(false);
                    };
                    img.src = imageUrl;
                };
                
                // Try to load background image from storage
                if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                    chrome.storage.local.get(['backgroundImage'], (localResult) => {
                        // Get the background image element
                        const backgroundImageElement = document.getElementById('background-image');

                        const bgUrl = localResult.backgroundImage || currentSettings.backgroundURL;
                        if (bgUrl) {
                            // Preload the background image for smooth transition
                            preloadBackgroundImage(bgUrl, (success, loadedUrl) => {
                                if (success) {
                                    // Apply the background with fade-in effect
                                    backgroundImageElement.style.backgroundImage = `url("${loadedUrl}")`;
                                    
                                    // Add loaded class for potential additional styling
                                    backgroundImageElement.classList.add('background-image');
                                } else {
                                    Debugger.warn("Failed to load background image:", bgUrl);
                                }
                            });
                        }
                        document.querySelectorAll('.group.placeholder.glass-background').forEach(el => el.remove());

                    });
                } else {
                    // Get the background image element
                    const backgroundImageElement = document.getElementById('background-image');
                    // Fallback for non-Chrome environments
                    const bgUrl = currentSettings.backgroundImage || currentSettings.backgroundURL;
                    if (bgUrl) {
                        // Preload the background image for smooth transition
                        preloadBackgroundImage(bgUrl, (success, loadedUrl) => {
                            if (success) {
                                    // Apply the background with fade-in effect
                                    backgroundImageElement.style.backgroundImage = `url("${loadedUrl}")`;
                                    
                                    // Add loaded class for potential additional styling
                                    backgroundImageElement.classList.add('background-image');
                            } else {
                                Debugger.warn("Failed to load background image:", bgUrl);
                            }
                        });
                    }
                }
            } else {
                // Remove the background image element if the user has disabled the custom background. 
                document.getElementById('background-image').remove();
            }
        }, 200); // Delay of 200ms to ensure other elements are loaded and rendered first
    } catch (error) {
        Debugger.error('Error initializing page:', error);
    }
});

function renderGroupContent(placeholder, group) {
    let el;
    switch (group.type) {
      case 'stack':
        el = newGroup.stack(group.links, group.x, group.y, group.title);
        break;
      case 'grid':
        el = newGroup.grid(group.links, group.x, group.y, group.rows || 1, group.columns || 1, group.title);
        break;
      case 'single':
        if (group.links && group.links.length > 0) {
          el = newGroup.single(group.links[0], group.x, group.y, group.title);
        }
        break;
      default:
        return;
    }
    // Virtualize large link lists
    if (Array.isArray(group.links) && group.links.length > 20 && el) {
      const list = el.querySelector('ul') || el.querySelector('.grid');
      if (list) {
        const items = Array.from(list.children);
        items.slice(20).forEach(node => node.remove());
        const moreBtn = document.createElement('button');
        moreBtn.textContent = `Show ${group.links.length - 20} more`;
        moreBtn.className = 'show-more-links';
        moreBtn.onclick = () => {
          list.innerHTML = '';
          items.forEach(node => list.appendChild(node));
          moreBtn.remove();
        };
        el.appendChild(moreBtn);
      }
    }
    // Replace only this placeholder
    placeholder.replaceWith(el);
}

// Function to determine if a color is dark (for contrast purposes)
function isColorDark(color) {
    // Handle hex colors
    let r, g, b;
    
    if (color.startsWith('#')) {
        // Convert hex to RGB
        let hex = color.substring(1);
        
        // Handle shorthand hex (#FFF)
        if (hex.length === 3) {
            r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
            g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
            b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
        } else {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }
    } else if (color.startsWith('rgb')) {
        // Handle rgb/rgba
        const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        if (rgbMatch) {
            r = parseInt(rgbMatch[1]);
            g = parseInt(rgbMatch[2]);
            b = parseInt(rgbMatch[3]);
        } else {
            // Default to white if color format not recognized
            return false;
        }
    } else {
        // Default to white for unrecognized formats
        return false;
    }
    
    // Calculate brightness using W3C algorithm
    // https://www.w3.org/TR/AERT/#color-contrast
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return true if dark, false if light
    return brightness < 128;
}

// Function to load widgets from storage and display them
async function loadWidgets() {
    Debugger.log('Loading widgets from storage...');
    try {
        let groups = [];
        
        // Check if chrome.storage is available (running as extension)
        if (typeof chrome !== 'undefined' && chrome.storage) {
            Debugger.log('Chrome storage API available');
            
            // First check if there's a reference to groups location in sync storage
            if (chrome.storage.local) {
                const syncData = await chrome.storage.local.get(['groups', 'groupsLocation']);
                
                // If groupsLocation is 'local', get groups from local storage
                if (syncData.groupsLocation === 'local') {
                    Debugger.log('Groups are stored in local storage according to sync reference');
                    const localData = await chrome.storage.local.get(['groups']);
                    groups = localData.groups || [];
                }
                // Otherwise try to get from sync storage directly
                else if (syncData.groups && syncData.groups.length > 0) {
                    Debugger.log('Groups found in sync storage');
                    groups = syncData.groups;
                }
                // If not found in sync, try local storage as fallback
                else {
                    Debugger.log('Groups not found in sync storage, checking local storage');
                    const localData = await chrome.storage.local.get(['groups']);
                    groups = localData.groups || [];
                }
            } else {
                // If sync is not available, try local
                Debugger.log('Sync storage not available, trying local storage');
                const localData = await chrome.storage.local.get(['groups']);
                groups = localData.groups || [];
            }
        } else {
            // Fallback for development/testing environment
            Debugger.warn('Chrome storage API not available, using localStorage fallback');
            const savedGroups = localStorage.getItem('groups');
            groups = savedGroups ? JSON.parse(savedGroups) : [];
        }
        
        if (groups && groups.length > 0) {
            Debugger.log(`Found ${groups.length} groups in storage, checking for widgets...`);
            
            // Filter only widgets
            const widgets = groups.filter(group => group.type === 'widget');
            
            if (widgets.length > 0) {
                Debugger.log(`Found ${widgets.length} widgets to display`);
                
                // Create and add each widget to the container
                widgets.forEach((widget, index) => {
                    Debugger.log(`Creating widget: ${widget.title} (${widget.widgetType})`);
                    
                    if (typeof WIDGET_TEMPLATES !== 'undefined' && typeof WIDGET_TEMPLATES.createWidget === 'function') {
                        // Create the widget using the template function
                        const widgetElement = WIDGET_TEMPLATES.createWidget(widget);
                        
                        // Add widget to the document
                        if (widgetElement) {
                            document.getElementById('groups-container').appendChild(widgetElement);
                            
                            // Store reference to the widget
                            if (Array.isArray(WIDGETS)) {
                                WIDGETS.push({
                                    id: `widget-${widget.widgetType}-${Date.now()}-${index}`,
                                    element: widgetElement,
                                    data: widget
                                });
                            }
                        }
                    } else {
                        Debugger.error('Widget templates not available');
                    }
                });
            } else {
                Debugger.log('No widgets found in groups');
            }
        } else {
            Debugger.log('No groups found in storage');
        }
    } catch (error) {
        Debugger.error('Error loading widgets:', error);
    } finally {
        endMeasure();
    }
}

function handleWindowResize() {
    // Redraw all elements with updated positions
    loadGroups();
    loadWidgets();
    
    // Reposition search
    if (currentSettings.searchBarPosition) {
        const pos = calculatePosition(
            currentSettings.searchBarPosition.x,
            currentSettings.searchBarPosition.y
        );
        searchContainer.style.top = `${pos.percentY * 100}%`;
        searchContainer.style.left = `${pos.percentX * 100}%`;
    }
    
    // Reinitialize shortcuts to ensure they're properly sized for the new window dimensions
    initializeShortcuts();
}

function createGroupPlaceholder(group) {
    const placeholder = document.createElement('div');
    placeholder.className = 'group placeholder';
    
    // Add glass background class only if enabled in settings
    if (currentSettings.useGlassBackground !== false) {
        placeholder.classList.add('glass-background');
    }
    
    placeholder.style.position = 'absolute';
    placeholder.style.top = group.styleTop;
    placeholder.style.left = group.styleLeft;
    placeholder.style.width = '150px';
    placeholder.style.height = '100px';
    placeholder.style.opacity = '0.3';
    placeholder.style.display = 'flex';
    placeholder.style.alignItems = 'center';
    placeholder.style.justifyContent = 'center';
    placeholder.textContent = 'Loading...';
    return placeholder;
}

/**
 * Get favicon for any URL with proper handling for dynamic favicons like Google Calendar
 * @param {string} url - URL to get favicon for
 * @return {string} - URL of favicon or default icon
 */
function getFavicon(url) {
    // Default icon as SVG data URI if all else fails
    const DEFAULT_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItbGluayI+PHBhdGggZD0iTTEwIDEzYTUgNSAwIDAgMCA3LjU0LjU0bDMtM2E1IDUgMCAwIDAtNy4wNy03LjA3bC0xLjcyIDEuNzEiPjwvcGF0aD48cGF0aCBkPSJNMTQgMTFhNSA1IDAgMCAwLTcuNTQtLjU0bC0zIDNhNSA1IDAgMCAwIDcuMDcgNy4wN2wxLjcxLTEuNzEiPjwvcGF0aD48L3N2Zz4=';
    
    try {
        // Return default icon if URL is empty
        if (!url || url.trim() === '') {
            return DEFAULT_ICON;
        }
        
        // Make sure URL is properly formatted with protocol
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        // Extract domain information
        let parsedUrl;
        try {
            parsedUrl = new URL(url);
        } catch (e) {
            Debugger.error('Invalid URL format:', url, e);
            return DEFAULT_ICON;
        }
        
        const domain = parsedUrl.hostname;
        
        // Create a local favicon cache for this session if it doesn't exist
        if (!window.faviconCache) {
            window.faviconCache = new Map();
        }
        
        // Special handling for Google Calendar's dynamic favicon
        if (domain === 'calendar.google.com') {
            // Get today's date for the dynamic calendar icon
            // Since Google Calendar changes its favicon to match the current date
            const today = new Date();
            const dateString = today.getDate().toString();
            
            // Either use a static calendar icon or a dynamically generated one
            // Option 1: Use a generic calendar icon (doesn't show current date but always works)
            const calendarGenericIcon = 'https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_' + dateString + '_2x.png';
            
            // Cache with a timestamp so it refreshes daily
            const cacheKey = `${domain}_${today.toDateString()}`;
            window.faviconCache.set(cacheKey, calendarGenericIcon);
            return calendarGenericIcon;
        }
        
        // Return cached favicon if available for other domains
        if (window.faviconCache.has(domain)) {
            return window.faviconCache.get(domain);
        }
        
        // Check for offline mode
        if (!navigator.onLine) {
            return DEFAULT_ICON;
        }
        
        // Special handling just for Google services that need specific icons
        const googleServiceIcons = {
            'mail.google.com': 'https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_32dp.png',
            'drive.google.com': 'https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png',
            'docs.google.com': 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico',
            'sheets.google.com': 'https://ssl.gstatic.com/docs/spreadsheets/images/favicon_jfk2.png',
            'slides.google.com': 'https://ssl.gstatic.com/docs/presentations/images/favicon5.ico',
            'meet.google.com': 'https://www.gstatic.com/meet/favicon_meet_2023_32dp.png',
            'chat.google.com': 'https://www.gstatic.com/chat/favicon_chat_32px.png',
            'classroom.google.com': 'https://ssl.gstatic.com/classroom/favicon.png',
            'keep.google.com': 'https://ssl.gstatic.com/keep/icon_2020q4v2_32dp.png'
            // Calendar is handled separately above
        };
        
        // Check if this is a Google service with known icon
        if (googleServiceIcons[domain]) {
            const iconUrl = googleServiceIcons[domain];
            window.faviconCache.set(domain, iconUrl);
            return iconUrl;
        }
        
        // For non-special cases, use Google's favicon service
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        
        // Cache the result for future use
        window.faviconCache.set(domain, faviconUrl);
        
        return faviconUrl;
    } catch (e) {
        Debugger.warn('Error getting favicon for URL:', url, e);
        return DEFAULT_ICON;
    }
}

