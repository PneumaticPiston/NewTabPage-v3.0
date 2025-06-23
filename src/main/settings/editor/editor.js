const groupsContainer = document.getElementById('groups-editor-container');
const newGroupBtn = document.getElementById('new-group-btn');
const saveChangesBtn = document.getElementById('save-changes-btn');
const toggleDragBtn = document.getElementById('toggle-drag-btn');
// const addSearchBtn = document.getElementById('add-search-btn');
const searchEditor = document.getElementById('search-editor');
const editPopup = document.getElementById('edit-group-popup');
const newGroupPopup = document.getElementById('new-group-popup');
const linksEditor = document.getElementById('group-links-editor');
const newGroupLinks = document.getElementById('new-group-links');

// Debugger.debugging.enable(); // Enable debugging

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

// Function to apply theme to editor
function applyThemeToEditor() {
    const theme = currentSettings.theme || 'light';
    const isCustomTheme = theme.startsWith('custom-');
    
    // Set CSS variables for colors
    if (isCustomTheme && currentSettings.customThemes) {
        // Find the custom theme
        const customTheme = currentSettings.customThemes.find(t => t.id === theme);
        if (customTheme) {
            document.documentElement.style.setProperty('--all-background-color', customTheme.background);
            document.documentElement.style.setProperty('--group-background-color', customTheme.secondary);
            document.documentElement.style.setProperty('--text-color', customTheme.text);
            document.documentElement.style.setProperty('--accent-color', customTheme.accent);
            document.documentElement.style.setProperty('--primary-color', customTheme.primary);
            
            // Set contrast text color - white for dark themes, black for light themes
            const isDarkBackground = isColorDark(customTheme.primary);
            document.documentElement.style.setProperty('--contrast-text-color', isDarkBackground ? '#ffffff' : '#000000');
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
        
        // Set contrast text color - white for dark themes, black for light themes
        const isDarkBackground = isColorDark(customPrimary);
        document.documentElement.style.setProperty('--contrast-text-color', isDarkBackground ? '#ffffff' : '#000000');
    } else {
        document.documentElement.style.setProperty('--all-background-color', `var(--${theme}-background, #f1faee)`);
        document.documentElement.style.setProperty('--group-background-color', `var(--${theme}-secondary, #a8dadc)`);
        document.documentElement.style.setProperty('--text-color', `var(--${theme}-text, #1d3557)`);
        document.documentElement.style.setProperty('--accent-color', `var(--${theme}-accent, #e63946)`);
        document.documentElement.style.setProperty('--primary-color', `var(--${theme}-primary, #457b9d)`);
        
        // Set contrast text color appropriately based on theme
        let isDarkTheme = false;
        if (theme === 'dark' || theme === 'midnight' || theme === 'emerald' || 
            theme === 'slate' || theme === 'deep' || theme === 'nord' || theme === 'cyber') {
            isDarkTheme = true;
        }
        document.documentElement.style.setProperty('--contrast-text-color', isDarkTheme ? '#ffffff' : '#000000');
    }
    
    // Set body background color while preserving inline style attribute
    document.body.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--all-background-color');
}

let currentGroups = [];
let currentSettings = {};
let editingGroupIndex = -1;
let dragEnabled = false;
let activeGroup = null;
let initialX = 0;
let initialY = 0;
let offsetX = 0;
let offsetY = 0;

// Grid configuration for snapping - MODIFY THESE VALUES TO CHANGE GRID SIZE
// These values control the granularity of the grid when dragging elements
const GRID_SIZE_X = 2; // 5% grid horizontally (smaller = finer grid, larger = coarser grid)
const GRID_SIZE_Y = 2; // 5% grid vertically (smaller = finer grid, larger = coarser grid)
const MIN_MARGIN = 0; // Minimum margin from edges (%) - set to 0 to match newtab.js behavior

// Calculate grid divisions (number of cells in each dimension)
// These are derived from the grid size settings - DO NOT MODIFY DIRECTLY
const GRID_DIVISIONS_X = Math.round(100 / GRID_SIZE_X);
const GRID_DIVISIONS_Y = Math.round(100 / GRID_SIZE_Y);

// Default settings
const defaultSettings = {
    theme: 'light',
    backgroundURL: '',
    showSearch: true,
    searchEngine: 'google',
    searchBarPosition: { x: 10, y: 120 },
    fontSize: 16,
    groupScale: 100, // Global scaling factor
    useGlassBackground: true, // Default to true for glass background effect
    headerLinks: [
        { name: 'Gmail', url: 'https://mail.google.com' },
        { name: 'Photos', url: 'https://photos.google.com' },
        { name: 'Search Labs', url: 'https://labs.google.com' }
    ]
};

// Load groups and settings when page loads
// Function to apply scaling settings to ensure consistent element sizes
function applyScalingSettings() {
    // Get the scale values from current settings
    const fontSize = currentSettings.fontSize || 16;
    const groupScale = currentSettings.groupScale || 100;
    const scaleValue = groupScale / 100;
    
    // Apply scaling variables for consistent sizing
    document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
    document.documentElement.style.setProperty('--group-scale', `${scaleValue}`);
    document.documentElement.style.setProperty('--element-scale', `${scaleValue}`);
    document.documentElement.style.setProperty('--spacing-multiplier', `${scaleValue}`);
    document.documentElement.style.setProperty('--text-scale', fontSize / 16);
    
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
    
    Debugger.log('Applied scaling settings:', { fontSize, groupScale, scaleValue });
}

// Apply theme colors and layout settings to editor
function applyThemeToEditor() {
    if (currentSettings && currentSettings.theme) {
        const theme = currentSettings.theme || 'light';
        const isCustomTheme = theme.startsWith('custom-');
        
        // Add theme class to body
        document.body.className = '';
        document.body.classList.add(`theme-${theme.split('-')[0]}`);
        
        if (isCustomTheme && currentSettings.customThemes) {
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
            // Default values
            document.documentElement.style.setProperty('--all-background-color', '#f1faee');
            document.documentElement.style.setProperty('--group-background-color', '#a8dadc');
            document.documentElement.style.setProperty('--text-color', '#1d3557');
            document.documentElement.style.setProperty('--accent-color', '#e63946');
            document.documentElement.style.setProperty('--primary-color', '#457b9d');
        } else {
            document.documentElement.style.setProperty('--all-background-color', `var(--${theme}-background, #f1faee)`);
            document.documentElement.style.setProperty('--group-background-color', `var(--${theme}-secondary, #a8dadc)`);
            document.documentElement.style.setProperty('--text-color', `var(--${theme}-text, #1d3557)`);
            document.documentElement.style.setProperty('--accent-color', `var(--${theme}-accent, #e63946)`);
            document.documentElement.style.setProperty('--primary-color', `var(--${theme}-primary, #457b9d)`);
        }
        
        // Apply accessibility settings
        if (currentSettings.fontSize) {
            document.documentElement.style.setProperty('--base-font-size', `${currentSettings.fontSize}px`);
            document.documentElement.style.setProperty('--text-scale', currentSettings.fontSize / 16);
            document.documentElement.style.fontSize = `${currentSettings.fontSize}px`;
        }
        
        // Apply global scaling if set in settings
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
        
        // Apply custom background if enabled
        if (currentSettings.useCustomBackground) {
            // Prefer stored image over URL
            if (currentSettings.backgroundImage) {
                // Set the CSS variable for background image
                document.documentElement.style.setProperty('--background-image', `url("${currentSettings.backgroundImage}")`);
                // Also set inline style for better compatibility
                document.body.style.backgroundImage = `url("${currentSettings.backgroundImage}")`;
                document.body.style.backgroundRepeat = 'no-repeat';
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                // Add loaded class to body to trigger the fade-in
                document.body.classList.add('bg-loaded');
            } else if (currentSettings.backgroundURL) {
                // Set the CSS variable for background image
                document.documentElement.style.setProperty('--background-image', `url("${currentSettings.backgroundURL}")`);
                // Also set inline style for better compatibility
                document.body.style.backgroundImage = `url("${currentSettings.backgroundURL}")`;
                document.body.style.backgroundRepeat = 'no-repeat';
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                // Add loaded class to body to trigger the fade-in
                document.body.classList.add('bg-loaded');
            } else {
                document.documentElement.style.setProperty('--background-image', 'none');
                document.body.style.backgroundImage = '';
            }
        } else {
            document.documentElement.style.setProperty('--background-image', 'none');
            document.body.style.backgroundImage = '';
        }
    }
}

// Add an event listener for when the tab is closed, create a warning about saving changes
// Give two options: "Cancel" followed by "Exit without saving"
window.addEventListener('beforeunload', (event) => {
    if (currentGroups.length > 0) {
        const confirmationMessage = 'Make sure you save your changes before leaving. Are you sure you want to exit?';
        event.returnValue = confirmationMessage; // For most browsers
        return confirmationMessage; // For some older browsers
    }
});

window.addEventListener('beforereload', (event) => {
    if (currentGroups.length > 0) {
        const confirmationMessage = 'Make sure you save your changes before leaving. Are you sure you want to exit?';
        event.returnValue = confirmationMessage; // For most browsers
        return confirmationMessage; // For some older browsers
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check if chrome.storage is available (running as extension)
        if (typeof chrome !== 'undefined' && chrome.storage) {
            Debugger.log('Chrome storage API available, loading data...');
            
            // First, try to load settings from sync storage
            let syncData = {};
            if (chrome.storage.local) {
                syncData = await chrome.storage.local.get(['settings', 'groupsLocation', 'groups', 'scaling']);
            }
            
            // Load settings
            currentSettings = syncData.settings || {...defaultSettings};
            
            // Load scaling settings directly and apply them to ensure consistent dimensions
            if (syncData.scaling) {
                Debugger.log('Applying scaling settings from Chrome sync storage');
                applyScalingSettings(syncData.scaling);
            }
            
            // Load groups based on location indicator
            if (syncData.groupsLocation === 'local') {
                // Groups are stored in local storage
                const localData = await chrome.storage.local.get(['groups']);
                currentGroups = localData.groups || [];
                Debugger.log('Groups loaded from Chrome local storage');
            } else {
                // Try to get groups from sync storage first
                if (chrome.storage.local && syncData.groups && syncData.groups.length > 0) {
                    currentGroups = syncData.groups;
                    Debugger.log('Groups loaded from Chrome sync storage');
                } else {
                    // Fallback to local storage
                    const localData = await chrome.storage.local.get(['groups']);
                    currentGroups = localData.groups || [];
                    Debugger.log('Groups loaded from Chrome local storage (fallback)');
                }
            }
            
            // Load background image from local storage if we're using a custom background
            if (currentSettings.useCustomBackground) {
                try {
                    const localResult = await chrome.storage.local.get(['backgroundImage']);
                    if (localResult.backgroundImage) {
                        currentSettings.backgroundImage = localResult.backgroundImage;
                        Debugger.log('Background image loaded from Chrome local storage');
                    }
                } catch (localError) {
                    Debugger.warn('Error loading background image from local storage:', localError);
                }
            }
        } else {
            // Fallback for development/testing environment
            Debugger.warn('Chrome storage API not available, using localStorage fallback');
            const savedGroups = localStorage.getItem('groups');
            const savedSettings = localStorage.getItem('settings');
            currentGroups = savedGroups ? JSON.parse(savedGroups) : [];
            currentSettings = savedSettings ? JSON.parse(savedSettings) : {...defaultSettings};
            
            // Load background image from localStorage if we're using a custom background
            if (currentSettings.useCustomBackground) {
                try {
                    const backgroundImage = localStorage.getItem('backgroundImage');
                    if (backgroundImage) {
                        currentSettings.backgroundImage = backgroundImage;
                    }
                } catch (localError) {
                    Debugger.warn('Error loading background image from localStorage:', localError);
                }
            }
        }
        
        // Ensure headerLinks exists
        if (!currentSettings.headerLinks) {
            currentSettings.headerLinks = defaultSettings.headerLinks;
        }
        
        // Apply theme to editor
        applyThemeToEditor();

        // Initialize search bar position
        if (currentSettings.searchBarPosition) {
            // Handle both legacy and new percentage formats
            if (typeof currentSettings.searchBarPosition.x === 'string' && 
                currentSettings.searchBarPosition.x.endsWith('%') &&
                typeof currentSettings.searchBarPosition.y === 'string' && 
                currentSettings.searchBarPosition.y.endsWith('%')) {
                // Direct percentage values
                searchEditor.style.top = currentSettings.searchBarPosition.y;
                searchEditor.style.left = currentSettings.searchBarPosition.x;
            } else {
                // Legacy format - convert to percentages
                const pos = calculatePosition(
                    currentSettings.searchBarPosition.x,
                    currentSettings.searchBarPosition.y
                );
                searchEditor.style.top = `${pos.percentY * 100}%`;
                searchEditor.style.left = `${pos.percentX * 100}%`;
            }
            // Apply transform for centering
            searchEditor.style.transform = 'translate(-50%, -50%)';
        }
        
        // Show/hide search bar based on settings
        searchEditor.style.display = currentSettings.showSearch ? 'block' : 'none';
        
        // Initialize drag events for search bar
        initSearchBarDrag();
        
        // Render groups
        renderGroups();
        
        // Add window resize handler
        window.addEventListener('resize', handleWindowResize);
    } catch (error) {
        Debugger.error('Error loading data:', error);
        currentGroups = [];
        currentSettings = {...defaultSettings};
        renderGroups(); // Still render UI even if loading fails
    }
});

// Handle window resize
function handleWindowResize() {
    // Redraw all elements with updated positions
    renderGroups();
    
    // Reposition search editor
    if (currentSettings.searchBarPosition) {
        // Handle direct percentage values
        if (typeof currentSettings.searchBarPosition.x === 'string' && 
            currentSettings.searchBarPosition.x.endsWith('%') &&
            typeof currentSettings.searchBarPosition.y === 'string' && 
            currentSettings.searchBarPosition.y.endsWith('%')) {
            // Use percentages directly
            searchEditor.style.top = currentSettings.searchBarPosition.y;
            searchEditor.style.left = currentSettings.searchBarPosition.x;
        } else {
            // Legacy format - calculate percentages
            const pos = calculatePosition(
                currentSettings.searchBarPosition.x,
                currentSettings.searchBarPosition.y
            );
            searchEditor.style.top = `${pos.percentY * 100}%`;
            searchEditor.style.left = `${pos.percentX * 100}%`;
        }
    }
}

function renderGroups() {
    groupsContainer.innerHTML = '';
    currentGroups.forEach((group, index) => {
        const groupElement = createGroupElement(group, index);
        groupsContainer.appendChild(groupElement);
    });
}

// Function to position elements relative to viewport using percentages
// This ensures compatibility between newtab.js and editor.js
function calculatePosition(x, y) {
    // For editor.js, we need to match the viewport percentage calculation used in newtab.js
    // This ensures coordinates are stored identically in both places
    
    // Handle legacy format (numbers or strings with percentages)
    let percentX, percentY;
    
    // Handle percentage strings
    if (typeof x === 'string' && x.endsWith('%')) {
        percentX = parseFloat(x) / 100;
        // Also snap values from percentage strings to our grid
        percentX = Math.round(percentX * GRID_DIVISIONS_X) / GRID_DIVISIONS_X;
    } 
    // Handle numeric values (convert to percentage)
    else {
        const numX = parseFloat(x);
        // Treat numeric values as percentages (values should be 0-100)
        percentX = !isNaN(numX) ? numX / 100 : 0.5; // Default to center if invalid
        
        // Snap to grid using configurable X grid divisions
        percentX = Math.round(percentX * GRID_DIVISIONS_X) / GRID_DIVISIONS_X;
    }
    
    if (typeof y === 'string' && y.endsWith('%')) {
        percentY = parseFloat(y) / 100;
        // Also snap values from percentage strings to our grid
        percentY = Math.round(percentY * GRID_DIVISIONS_Y) / GRID_DIVISIONS_Y;
    }
    // Handle numeric values (convert to percentage)
    else {
        const numY = parseFloat(y);
        // Treat numeric values as percentages (values should be 0-100) 
        percentY = !isNaN(numY) ? numY / 100 : 0.5; // Default to center if invalid
        
        // Snap to grid using configurable Y grid divisions
        percentY = Math.round(percentY * GRID_DIVISIONS_Y) / GRID_DIVISIONS_Y;
    }
    
    // Apply min margin from the constant
    const marginPercent = MIN_MARGIN / 100;
    
    // Ensure percentages are within bounds
    percentX = Math.max(marginPercent, Math.min(1 - marginPercent, percentX));
    percentY = Math.max(marginPercent, Math.min(1 - marginPercent, percentY));
    
    // Calculate absolute position based on viewport size (same as newtab.js)
    // This is important for consistency between editor and newtab
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const newX = percentX * screenWidth;
    const newY = percentY * screenHeight;
    
    return { 
        x: newX, 
        y: newY,
        percentX: percentX,
        percentY: percentY
    };
}

function createGroupElement(group, index) {
    const div = document.createElement('div');
    div.className = 'editor-group';
    
    // Add glass background class only if enabled in settings
    if (currentSettings.useGlassBackground !== false) {
        div.classList.add('glass-background');
    }
    
    div.dataset.index = index;
    
    // Use the same positioning logic as newtab.js
    const pos = calculatePosition(group.x || 10, group.y || 10);
    
    // Always use absolute positioning to match the new tab page
    div.style.position = 'absolute';
    div.style.top = `${pos.percentY * 100}%`;
    div.style.left = `${pos.percentX * 100}%`;
    div.style.transform = 'translate(-50%, -50%)';
    
    // Add draggable class and event only if drag is enabled
    if (dragEnabled) {
        div.classList.add('draggable');
        div.addEventListener('mousedown', handleMouseDown);
    }

    // Check if it's a widget or a regular group
    if (group.type === 'widget') {
        // This is a widget
        return createWidgetElement(group, index, div, pos);
    }

    // Regular group handling
    const header = document.createElement('div');
    header.className = 'group-header';
    
    // Only show header if title is not empty or whitespace
    const hasTitle = group.title && group.title.trim().length > 0;
    
    if (hasTitle) {
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.value = group.title;
        titleInput.className = 'group-title';
        titleInput.onchange = (e) => updateGroupTitle(index, e.target.value);
        header.appendChild(titleInput);
    } else {
        header.style.display = 'flex';
        header.style.justifyContent = 'flex-end';
    }
    
    const controls = document.createElement('div');
    controls.className = 'group-controls';
    
    // Create edit and delete buttons with unicode icons
    const editBtn = document.createElement('button');
    editBtn.className = 'icon-button edit-group-btn';
    editBtn.innerHTML = '✎'; // pencil icon
    editBtn.onclick = () => openEditPopup(index);
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'icon-button remove-group-btn';
    removeBtn.innerHTML = '✕'; // x icon
    removeBtn.onclick = () => removeGroup(index);

    controls.appendChild(editBtn);
    controls.appendChild(removeBtn);

    header.appendChild(controls);
    div.appendChild(header);

    // Add preview of links based on group type
    const linksPreview = document.createElement('div');
    linksPreview.className = group.type === 'grid' ? 'grid' : 'stack';
    
    // Apply grid rows and columns if it's a grid type
    if (group.type === 'grid' && group.rows && group.columns) {
        linksPreview.style.gridTemplateColumns = `repeat(${group.columns}, 1fr)`;
        linksPreview.style.gridTemplateRows = `repeat(${group.rows}, 1fr)`;
    }
    
    group.links.forEach(link => {
        const favicon = getFavicon(link.url);
        if (group.type === 'stack') {
            linksPreview.innerHTML += `
                <div class="link-stack">
                    <img src="${favicon}" alt="${link.title}"/>
                    <span>${link.title}</span>
                </div>
            `;
        } else {
            linksPreview.innerHTML += `
                <div class="link-grid">
                    <img src="${favicon}" alt="${link.title}"/>
                    <span>${link.title}</span>
                </div>
            `;
        }
    });
    
    div.appendChild(linksPreview);
    return div;
}

// Function to create a widget element
function createWidgetElement(widget, index, containerDiv, pos) {
    // Style the container appropriately for a widget
    containerDiv.classList.add('widget-container');
    
    // Create header with controls
    const header = document.createElement('div');
    header.className = 'group-header';
    
    // Add widget title
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = widget.title || 'Widget';
    titleInput.className = 'group-title';
    titleInput.onchange = (e) => updateGroupTitle(index, e.target.value);
    header.appendChild(titleInput);
    
    // Add widget controls
    const controls = document.createElement('div');
    controls.className = 'group-controls';
    
    // Create settings and delete buttons
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'icon-button edit-group-btn';
    settingsBtn.innerHTML = '⚙️'; // gear icon
    settingsBtn.title = 'Widget Settings';
    settingsBtn.onclick = () => openWidgetSettings(index);
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'icon-button remove-group-btn';
    removeBtn.innerHTML = '✕'; // x icon
    removeBtn.title = 'Remove Widget';
    removeBtn.onclick = () => removeGroup(index);

    controls.appendChild(settingsBtn);
    controls.appendChild(removeBtn);
    header.appendChild(controls);
    containerDiv.appendChild(header);
    
    // Create widget content preview based on type
    const contentPreview = document.createElement('div');
    contentPreview.className = 'widget-preview';
    contentPreview.style.padding = '15px';
    contentPreview.style.minWidth = '200px';
    contentPreview.style.minHeight = '150px';
    contentPreview.style.display = 'flex';
    contentPreview.style.flexDirection = 'column';
    contentPreview.style.alignItems = 'center';
    contentPreview.style.justifyContent = 'center';
    
    // Display a different preview based on widget type
    const icon = document.createElement('div');
    icon.style.fontSize = '48px';
    icon.style.marginBottom = '10px';
    icon.textContent = widget.icon || '🔧';
    
    const name = document.createElement('div');
    name.textContent = widget.title || 'Widget';
    name.style.fontWeight = 'bold';
    
    const info = document.createElement('div');
    info.textContent = getWidgetTypeDescription(widget.widgetType);
    info.style.fontSize = '12px';
    info.style.opacity = '0.7';
    info.style.marginTop = '5px';
    info.style.textAlign = 'center';
    
    contentPreview.appendChild(icon);
    contentPreview.appendChild(name);
    contentPreview.appendChild(info);
    
    // Add the preview to the widget container
    containerDiv.appendChild(contentPreview);
    
    return containerDiv;
}

// Helper function to get widget description
function getWidgetTypeDescription(widgetType) {
    // Look through WIDGET_TYPES to find the description
    for (const category in WIDGET_TYPES) {
        const categoryObj = WIDGET_TYPES[category];
        for (const widgetKey in categoryObj.widgets) {
            const widget = categoryObj.widgets[widgetKey];
            if (widget.id === widgetType) {
                return widget.description;
            }
        }
    }
    return "Custom widget";
}

function updateGroupTitle(index, title) {
    currentGroups[index].title = title;
    // Auto-save when group title is changed
    saveGroupsToStorage();
}

function removeGroup(index) {
    currentGroups.splice(index, 1);
    renderGroups();
    // Auto-save when group is removed
    saveGroupsToStorage();
}

function createLinkInputs(container, link = { title: '', url: '' }, index = null) {
    const div = document.createElement('div');
    div.className = 'link-editor';
    
    // Calculate current number of links in container
    const linkCount = container.querySelectorAll('.link-editor').length;
    
    // Create index selector dropdown
    const indexSelector = document.createElement('select');
    indexSelector.className = 'link-index';
    
    // Populate index options (0 to current count)
    for (let i = 0; i <= linkCount; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.text = i + 1; // Display 1-based index to users
        indexSelector.appendChild(option);
    }
    
    // Set the current index if provided, otherwise use next available
    indexSelector.value = index !== null ? index : linkCount;
    
    // Add index selector to div
    div.appendChild(indexSelector);
    
    // Add title and URL inputs
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'link-title';
    titleInput.placeholder = 'Link Title';
    titleInput.value = link.title || '';
    div.appendChild(titleInput);
    
    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.className = 'link-url';
    urlInput.placeholder = 'Link URL';
    urlInput.value = link.url || '';
    div.appendChild(urlInput);
    
    // Add remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-link-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => div.remove());
    div.appendChild(removeBtn);
    
    // Add index change listener
    indexSelector.addEventListener('change', (e) => reorderLink(div, parseInt(e.target.value)));
    
    // Insert at specified index or append
    if (index !== null && index < container.children.length) {
        container.insertBefore(div, container.children[index]);
    } else {
        container.appendChild(div);
    }
}

// Function to reorder links
function reorderLink(linkElement, newIndex) {
    const container = linkElement.parentElement;
    const currentIndex = Array.from(container.children).indexOf(linkElement);
    
    // No change needed if already at target index
    if (currentIndex === newIndex) return;
    
    // Remove from current position
    container.removeChild(linkElement);
    
    // Insert at new position
    if (newIndex >= container.children.length) {
        container.appendChild(linkElement);
    } else {
        container.insertBefore(linkElement, container.children[newIndex]);
    }
    
    // Update all index selectors
    updateLinkIndexes(container);
}

// Update all index selectors in a container
function updateLinkIndexes(container) {
    const links = container.querySelectorAll('.link-editor');
    
    // First update the number of options in each selector
    links.forEach((link, i) => {
        const selector = link.querySelector('.link-index');
        const currentValue = parseInt(selector.value);
        
        // Clear existing options
        selector.innerHTML = '';
        
        // Populate with new options
        for (let j = 0; j < links.length; j++) {
            const option = document.createElement('option');
            option.value = j;
            option.text = j + 1; // Display 1-based index to users
            selector.appendChild(option);
        }
        
        // Try to maintain the current value if possible
        if (currentValue < links.length) {
            selector.value = currentValue;
        } else {
            selector.value = i;
        }
    });
}

// New group popup handlers
// Function to toggle grid settings visibility
document.getElementById('new-group-type').addEventListener('change', toggleGridSettings);
function toggleGridSettings() {
    const groupType = document.getElementById('new-group-type').value;
    const gridSettings = document.getElementById('grid-settings');
    
    // Show grid settings only for grid type
    gridSettings.style.display = groupType === 'grid' ? 'block' : 'none';
    
    // If single type, show only one link input
    if (groupType === 'single') {
        // Clear existing links except the first one
        const links = newGroupLinks.querySelectorAll('.link-editor');
        if (links.length > 1) {
            for (let i = 1; i < links.length; i++) {
                links[i].remove();
            }
        }
        
        // Disable "Add Link" button for single type
        document.getElementById('add-new-group-link-btn').disabled = true;
    } else {
        // Enable "Add Link" button for other types
        document.getElementById('add-new-group-link-btn').disabled = false;
    }
}

// Commented out previous direct event listener since we're now using the options menu
// newGroupBtn click is handled in the bottom code to show options menu

document.getElementById('add-new-group-link-btn').addEventListener('click', () => {
    createLinkInputs(newGroupLinks);
});

document.getElementById('cancel-new-group-btn').addEventListener('click', () => {
    newGroupPopup.style.display = 'none';
});

// Remove the duplicate event listener that was causing two groups to be created

function createNewGroup() {
    const title = document.getElementById('new-group-title').value;
    const type = document.getElementById('new-group-type').value;
    
    // Get links - respect the order from index selectors
    const linkElements = Array.from(newGroupLinks.querySelectorAll('.link-editor'));
    const linksByIndex = [];
    
    // First, collect links with their intended indexes
    linkElements.forEach(editor => {
        const link = {
            title: editor.querySelector('.link-title').value,
            url: editor.querySelector('.link-url').value,
            index: parseInt(editor.querySelector('.link-index').value)
        };
        
        // Only include links with title and URL
        if (link.title && link.url) {
            linksByIndex.push(link);
        }
    });
    
    // Sort by index
    linksByIndex.sort((a, b) => a.index - b.index);
    
    // Remove index property from final link objects
    const links = linksByIndex.map(link => ({
        title: link.title,
        url: link.url
    }));
    
    // Calculate a reasonable position for the new group
    // Try to place it in a spot that's not already occupied
    let x = 10;
    let y = 10;
    
    // Find available space
    const existingPositions = currentGroups.map(g => ({ x: g.x, y: g.y }));
    if (existingPositions.length > 0) {
        // Increment y by 100 until we find a position that's not occupied
        while (existingPositions.some(p => Math.abs(p.x - x) < 50 && Math.abs(p.y - y) < 50)) {
            y += 100;
        }
    }
    
    // Create new group object
    const newGroup = {
        type,
        title,
        links,
        x: x,
        y: y
    };
    
    // Add rows and columns for grid type
    if (type === 'grid') {
        newGroup.rows = parseInt(document.getElementById('grid-rows').value) || 1;
        newGroup.columns = parseInt(document.getElementById('grid-columns').value) || 1;
    }

    currentGroups.push(newGroup);
    renderGroups();
    document.getElementById('new-group-popup').style.display = 'none';
    // Auto-save when new group is created
    saveGroupsToStorage();
}

function openEditPopup(index) {
    editingGroupIndex = index;
    const group = currentGroups[index];
    
    // Reuse new group popup for editing
    document.getElementById('new-group-popup').style.display = 'flex';
    document.getElementById('new-group-title').value = group.title || '';
    document.getElementById('new-group-type').value = group.type;
    
    // Set grid rows and columns if present
    if (group.type === 'grid') {
        document.getElementById('grid-rows').value = group.rows || 1;
        document.getElementById('grid-columns').value = group.columns || 1;
    }
    
    // Show/hide grid settings based on type
    toggleGridSettings();
    
    // Clear and populate links
    newGroupLinks.innerHTML = '';
    group.links.forEach((link, idx) => createLinkInputs(newGroupLinks, link, idx));
    
    // Change button text and handler for editing
    const createBtn = document.getElementById('create-new-group-btn');
    createBtn.textContent = 'Save Changes';
    createBtn.onclick = saveGroupChanges;
}

function saveGroupChanges() {
    const title = document.getElementById('new-group-title').value;
    const type = document.getElementById('new-group-type').value;
    
    // Get links respecting the order from index selectors
    const linkElements = Array.from(newGroupLinks.querySelectorAll('.link-editor'));
    const linksByIndex = [];
    
    // First, collect links with their intended indexes
    linkElements.forEach(editor => {
        const link = {
            title: editor.querySelector('.link-title').value,
            url: editor.querySelector('.link-url').value,
            index: parseInt(editor.querySelector('.link-index').value)
        };
        
        // Only include links with title and URL
        if (link.title && link.url) {
            linksByIndex.push(link);
        }
    });
    
    // Sort by index
    linksByIndex.sort((a, b) => a.index - b.index);
    
    // Remove index property from final link objects
    const links = linksByIndex.map(link => ({
        title: link.title,
        url: link.url
    }));

    // Get the existing position
    const currentX = currentGroups[editingGroupIndex].x || 10;
    const currentY = currentGroups[editingGroupIndex].y || 10;

    // Update existing group while preserving position
    const updatedGroup = {
        ...currentGroups[editingGroupIndex],
        type,
        title,
        links,
        x: currentX,
        y: currentY
    };
    
    // Add rows and columns for grid type
    if (type === 'grid') {
        updatedGroup.rows = parseInt(document.getElementById('grid-rows').value) || 1;
        updatedGroup.columns = parseInt(document.getElementById('grid-columns').value) || 1;
    } else {
        // Remove rows and columns if not grid type
        delete updatedGroup.rows;
        delete updatedGroup.columns;
    }
    
    // Update the group
    currentGroups[editingGroupIndex] = updatedGroup;

    renderGroups();
    document.getElementById('new-group-popup').style.display = 'none';
    // Auto-save when group is updated
    saveGroupsToStorage();
    
    // Reset create button
    const createBtn = document.getElementById('create-new-group-btn');
    createBtn.textContent = 'Create Group';
    createBtn.onclick = createNewGroup;
}

// Safely add event listeners (check if elements exist first)
// These elements seem to be missing from the HTML - removing them for now
// If you need these functionalities, add the corresponding elements to newtab-editor.html

// Generic function to initialize draggable elements with position saving
function initDraggableElement(element, positionSettingKey) {
    if (!element) return;
    
    const handle = element.querySelector('.editor-handle');
    
    if (!handle) {
        Debugger.error(`Handle not found for ${positionSettingKey}`);
        return;
    }
    
    handle.addEventListener('mousedown', function(e) {
        if (!dragEnabled) return;
        
        e.preventDefault();
        
        // Initial cursor positions
        initialX = e.clientX;
        initialY = e.clientY;
        
        // Get current element position
        const rect = element.getBoundingClientRect();
        
        // Get current viewport dimensions
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Calculate current position as percentages
        let currentLeftPercent = (rect.left + rect.width / 2) / screenWidth;
        let currentTopPercent = (rect.top + rect.height / 2) / screenHeight;
        
        // Store these for the drag calculation
        offsetX = currentLeftPercent;
        offsetY = currentTopPercent;
        
        // Store original transform
        const originalTransform = element.style.transform;
        
        // Set as the active element for dragging
        activeGroup = element;
        
        // Ensure absolute positioning
        element.style.position = 'absolute';
        
        // Show grid overlay for snap-to-grid
        if (dragEnabled) {
            gridOverlay.style.display = 'block';
        }
        
        // Add mousemove and mouseup event listeners
        document.addEventListener('mousemove', handleDraggableMove);
        document.addEventListener('mouseup', function() {
            stopDraggableMove(element, positionSettingKey, originalTransform);
        });
    });
}

// Temporary functions for drag handling - we'll use these until we refactor the code
function handleDraggableMove(e) {
    if (!activeGroup) return;
    
    e.preventDefault();
    
    // Get current viewport dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate mouse movement in percentage of screen
    const dxPercent = (e.clientX - initialX) / screenWidth;
    const dyPercent = (e.clientY - initialY) / screenHeight;
    
    // Calculate new percentage positions
    let newPercentX = offsetX + dxPercent;
    let newPercentY = offsetY + dyPercent;
    
    // Snap to grid if drag is enabled
    if (dragEnabled) {
        // Snap to uniform grid using GRID_DIVISIONS (20x20 grid)
        newPercentX = Math.round(newPercentX * GRID_DIVISIONS_X) / GRID_DIVISIONS_X;
        newPercentY = Math.round(newPercentY * GRID_DIVISIONS_Y) / GRID_DIVISIONS_Y;
    }
    
    // Ensure percentages are within bounds (0-1)
    // Match the behavior in newtab.js which uses 0 to 1 range
    newPercentX = Math.max(0, Math.min(1, newPercentX));
    newPercentY = Math.max(0, Math.min(1, newPercentY));
    
    // Apply the new position
    activeGroup.style.left = `${newPercentX * 100}%`;
    activeGroup.style.top = `${newPercentY * 100}%`;
    activeGroup.style.transform = 'translate(-50%, -50%)';
}

// Handle element movement during drag
function handleDraggableMove(e) {
    if (!activeGroup) return;
    
    e.preventDefault();
    
    // Get current viewport dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate mouse movement in percentage of screen
    const dxPercent = (e.clientX - initialX) / screenWidth;
    const dyPercent = (e.clientY - initialY) / screenHeight;
    
    // Calculate new percentage positions
    let newPercentX = offsetX + dxPercent;
    let newPercentY = offsetY + dyPercent;
    
    // Snap to grid if drag is enabled
    if (dragEnabled) {
        // Snap to uniform grid using GRID_DIVISIONS (20x20 grid)
        newPercentX = Math.round(newPercentX * GRID_DIVISIONS_X) / GRID_DIVISIONS_X;
        newPercentY = Math.round(newPercentY * GRID_DIVISIONS_Y) / GRID_DIVISIONS_Y;
    }
    
    // Ensure percentages are within bounds (0-1)
    // Match the behavior in newtab.js which uses 0 to 1 range
    newPercentX = Math.max(0, Math.min(1, newPercentX));
    newPercentY = Math.max(0, Math.min(1, newPercentY));
    
    // Apply the new position
    activeGroup.style.left = `${newPercentX * 100}%`;
    activeGroup.style.top = `${newPercentY * 100}%`;
    activeGroup.style.transform = 'translate(-50%, -50%)';
}

// Handle end of element movement and save position
function stopDraggableMove(element, positionSettingKey, originalTransform) {
    // Remove event listeners
    document.removeEventListener('mousemove', handleDraggableMove);
    document.removeEventListener('mouseup', arguments.callee);
    
    // Hide grid overlay
    gridOverlay.style.display = 'none';
    
    // Make sure transform is maintained for proper centering
    element.style.transform = 'translate(-50%, -50%)';
    
    // Get position as percentages from current style
    let left = element.style.left;
    let top = element.style.top;
    
    // Make sure we have values
    if (!left || !top) {
        Debugger.error('Element position is missing');
        return;
    }
    
    // Make sure they're percentage-based
    if (!left.endsWith('%') || !top.endsWith('%')) {
        Debugger.error('Element position is not in percentage format');
        return;
    }
    
    // Reset active group
    activeGroup = null;
}

// Handle search bar movement
function moveSearchBar(e) {
    e.preventDefault();
    
    // Get current viewport dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate mouse movement in percentage of screen
    const dxPercent = (e.clientX - initialX) / screenWidth;
    const dyPercent = (e.clientY - initialY) / screenHeight;
    
    // Calculate new percentage positions
    let newPercentX = offsetX + dxPercent;
    let newPercentY = offsetY + dyPercent;
    
    // Snap to grid if drag is enabled
    if (dragEnabled) {
        // Snap to uniform grid using GRID_DIVISIONS (20x20 grid)
        newPercentX = Math.round(newPercentX * GRID_DIVISIONS_X) / GRID_DIVISIONS_X;
        newPercentY = Math.round(newPercentY * GRID_DIVISIONS_Y) / GRID_DIVISIONS_Y;
    }
    
    // Ensure percentages are within bounds (0-1)
    // Match the behavior in newtab.js which uses 0 to 1 range
    newPercentX = Math.max(0, Math.min(1, newPercentX));
    newPercentY = Math.max(0, Math.min(1, newPercentY));
    
    // Apply the new position
    searchEditor.style.left = `${newPercentX * 100}%`;
    searchEditor.style.top = `${newPercentY * 100}%`;
}


// Function to initialize search bar dragging
function initSearchBarDrag() {
    if (!searchEditor) return;
    
    // Add a class to indicate it's draggable
    searchEditor.classList.add('draggable');
    
    // Find the handle (or use the whole search bar if no handle)
    const handle = searchEditor.querySelector('.editor-handle') || searchEditor;
    
    // Add mousedown event to the handle
    handle.addEventListener('mousedown', function(e) {
        if (!dragEnabled) return;
        
        e.preventDefault();
        
        // Store initial cursor position
        initialX = e.clientX;
        initialY = e.clientY;
        
        // Get current position of the search bar
        const rect = searchEditor.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Convert position to viewport-relative coordinates
        let currentLeftPercent = (rect.left + rect.width / 2) / screenWidth;
        let currentTopPercent = (rect.top + rect.height / 2) / screenHeight;
        
        // Store position for drag calculation
        offsetX = currentLeftPercent;
        offsetY = currentTopPercent;
        
        // Add active drag class
        searchEditor.classList.add('dragging');
        
        // Show grid for snapping
        gridOverlay.style.display = 'block';
        
        // Set up document-level handlers for move and release
        document.addEventListener('mousemove', moveSearchBar);
        document.addEventListener('mouseup', stopSearchBarDrag);
    });
}

// Function to handle search bar move during drag
function moveSearchBar(e) {
    e.preventDefault();
    
    // Get viewport dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate mouse movement as percentage of screen
    const dxPercent = (e.clientX - initialX) / screenWidth;
    const dyPercent = (e.clientY - initialY) / screenHeight;
    
    // Calculate new position
    let newPercentX = offsetX + dxPercent;
    let newPercentY = offsetY + dyPercent;
    
    // Snap to grid if enabled
    if (dragEnabled) {
        newPercentX = Math.round(newPercentX * GRID_DIVISIONS_X) / GRID_DIVISIONS_X;
        newPercentY = Math.round(newPercentY * GRID_DIVISIONS_Y) / GRID_DIVISIONS_Y;
    }
    
    // Apply bounds checking
    newPercentX = Math.max(0, Math.min(1, newPercentX));
    newPercentY = Math.max(0, Math.min(1, newPercentY));
    
    // Update search bar position
    searchEditor.style.left = `${newPercentX * 100}%`;
    searchEditor.style.top = `${newPercentY * 100}%`;
}

// Function to handle search bar drag end
function stopSearchBarDrag() {
    // Remove event listeners
    document.removeEventListener('mousemove', moveSearchBar);
    document.removeEventListener('mouseup', stopSearchBarDrag);
    
    // Hide grid overlay
    gridOverlay.style.display = 'none';
    
    // Remove active class
    searchEditor.classList.remove('dragging');
    
    // Get final position
    const left = searchEditor.style.left;
    const top = searchEditor.style.top;
    
    // Update search bar position in settings
    if (left && top) {
        currentSettings.searchBarPosition = {
            x: left,
            y: top
        };
    }
}

// Add widget menu functionality
if (document.getElementById('add-group-button')) {
    document.getElementById('add-group-button').addEventListener('click', function() {
        // Opens the group editor dialog
        const newGroupPopup = document.getElementById('new-group-popup');
        newGroupPopup.style.display = 'flex';
        
        // Initialize the new group form
        document.getElementById('new-group-title').value = '';
        document.getElementById('new-group-type').value = 'stack';
        document.getElementById('grid-rows').value = '1';
        document.getElementById('grid-columns').value = '1';
        
        // Initialize and show/hide grid settings
        toggleGridSettings();
        
        // Clear and add initial link input
        newGroupLinks.innerHTML = '';
        createLinkInputs(newGroupLinks);
        
        // Reset create button
        const createBtn = document.getElementById('create-new-group-btn');
        createBtn.textContent = 'Create Group';
        createBtn.onclick = createNewGroup;
        
        // Hide add options menu
        document.getElementById('add-options').style.display = 'none';
    });
}

if (document.getElementById('add-widget-button')) {
    document.getElementById('add-widget-button').addEventListener('click', function() {
        // Open widget menu
        const widgetMenu = document.getElementById('widget-menu');
        
        // Populate widget menu if it's not already populated
        if (!widgetMenu.querySelector('.widget-group')) {
            populateWidgetMenu();
        }
        
        if (widgetMenu.style.display === 'block') {
            widgetMenu.style.display = 'none';
        } else {
            widgetMenu.style.display = 'block';
            // Hide add options menu
            document.getElementById('add-options').style.display = 'none';
        }
    });
}

// Populate widget menu based on WIDGET_TYPES configuration
function populateWidgetMenu() {
    try {
        const widgetMenu = document.getElementById('widget-menu');
        if (!widgetMenu) return;
        
        // Clear existing content
        widgetMenu.innerHTML = '';
        
        // Check if WIDGET_TYPES is defined (imported from widgets.js)
        if (typeof WIDGET_TYPES === 'undefined') {
            Debugger.error('WIDGET_TYPES not defined, cannot populate widget menu');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'widget-error';
            errorDiv.textContent = 'Widget configuration not available';
            widgetMenu.appendChild(errorDiv);
            return;
        }
        
        // Create groups and widgets based on WIDGET_TYPES
        for (const categoryKey in WIDGET_TYPES) {
            const category = WIDGET_TYPES[categoryKey];
            
            // Create category group
            const groupDiv = document.createElement('div');
            groupDiv.className = 'widget-group';
            
            // Add title
            const titleDiv = document.createElement('div');
            titleDiv.className = 'widget-group-title';
            titleDiv.textContent = category.title;
            groupDiv.appendChild(titleDiv);
            
            // Create widget list container
            const listDiv = document.createElement('div');
            listDiv.className = 'widget-list';
            
            // Add widgets to list
            for (const widgetKey in category.widgets) {
                const widget = category.widgets[widgetKey];
                
                const widgetItemDiv = document.createElement('div');
                widgetItemDiv.className = 'widget-item';
                widgetItemDiv.dataset.widget = widget.id;
                
                const iconDiv = document.createElement('div');
                iconDiv.className = 'widget-icon';
                iconDiv.textContent = widget.icon;
                
                const nameDiv = document.createElement('div');
                nameDiv.className = 'widget-name';
                nameDiv.textContent = widget.name;
                
                widgetItemDiv.appendChild(iconDiv);
                widgetItemDiv.appendChild(nameDiv);
                
                // Add click handler for widget selection
                widgetItemDiv.addEventListener('click', function() {
                    // Create a basic widget object
                    const widgetObj = {
                        type: 'widget',
                        widgetType: widget.id,
                        title: widget.name,
                        icon: widget.icon,
                        x: '50%',  // Default to center screen
                        y: '50%',  // Default to center screen
                        settings: {}  // Will hold widget-specific settings
                    };
                    
                    // Add the widget to the current groups
                    currentGroups.push(widgetObj);
                    
                    // Render the updated groups
                    renderGroups();
                    
                    // Hide the widget menu
                    document.getElementById('widget-menu').style.display = 'none';
                    
                    // Show notification
                    const notification = document.createElement('div');
                    notification.className = 'widget-notification';
                    notification.textContent = `Added ${widget.name} widget! You can drag it to position it.`;
                    notification.style.position = 'fixed';
                    notification.style.bottom = '20px';
                    notification.style.left = '50%';
                    notification.style.transform = 'translateX(-50%)';
                    notification.style.backgroundColor = 'var(--primary-color)';
                    notification.style.color = 'var(--contrast-text-color, white)';
                    notification.style.padding = '10px 20px';
                    notification.style.borderRadius = '4px';
                    notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
                    notification.style.zIndex = '9999';
                    document.body.appendChild(notification);
                    
                    // Remove notification after 3 seconds
                    setTimeout(() => {
                        notification.style.opacity = '0';
                        notification.style.transition = 'opacity 0.5s';
                        setTimeout(() => {
                            document.body.removeChild(notification);
                        }, 500);
                    }, 3000);
                });
                
                listDiv.appendChild(widgetItemDiv);
            }
            
            groupDiv.appendChild(listDiv);
            widgetMenu.appendChild(groupDiv);
        }
    } catch (error) {
        Debugger.error('Error populating widget menu:', error);
    }
}

// Handle closing menus when clicking elsewhere
document.addEventListener('click', function(event) {
    const widgetMenu = document.getElementById('widget-menu');
    const addOptions = document.getElementById('add-options');
    const newGroupBtn = document.getElementById('new-group-btn');
    const addWidgetButton = document.getElementById('add-widget-button');
    const addGroupButton = document.getElementById('add-group-button');
    
    // Close widget menu if click is outside the menu and not on its toggle button
    if (widgetMenu && widgetMenu.style.display === 'block' && 
        !widgetMenu.contains(event.target) && 
        event.target !== addWidgetButton) {
        widgetMenu.style.display = 'none';
    }
    
    // Close add options if click is outside the menu and not on its toggle button
    if (addOptions && addOptions.style.display === 'flex' &&
        !addOptions.contains(event.target) &&
        event.target !== newGroupBtn) {
        addOptions.style.display = 'none';
    }
});

newGroupBtn.addEventListener('click', function(e) {
    const optionsMenu = document.getElementById('add-options');
    e.stopPropagation(); // Prevent event bubbling
    
    if (optionsMenu.style.display === 'flex') {
        optionsMenu.style.display = 'none';
    } else {
        optionsMenu.style.display = 'flex';
    }
});

// Save button - Save groups and settings
saveChangesBtn.addEventListener('click', async () => {
    try {
        // Show feedback to user
        const saveButton = document.getElementById('save-changes-btn');
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = 'Saving...';
        
        // Check if chrome.storage is available (running as extension)
        if (typeof chrome !== 'undefined' && chrome.storage) {
            // To avoid QUOTA_BYTES_PER_ITEM error, save groups separately from settings
            // and use local storage for larger items
            
            // 1. First, clean up the data by removing any unnecessary large objects
            // We'll deep clone the groups to avoid modifying the original
            const sanitizedGroups = sanitizeGroupLinks(currentGroups);
            
            // 2. Store groups and settings separately to avoid hitting quota limit
            if (chrome.storage.local) {
                try {
                    // Make a copy of current settings for sync storage
                    // This is important to prevent modifying the original settings object
                    const settingsForSync = { ...currentSettings };
                    
                    // Check if we have a background image 
                    let backgroundImage = null;
                    if (settingsForSync.backgroundImage) {
                        // Store the background image separately in local storage
                        backgroundImage = settingsForSync.backgroundImage;
                        
                        // Remove background image from sync settings to avoid quota limits
                        settingsForSync.backgroundImage = null;
                    }
                    
                    // Try to save settings to sync storage (without the background image)
                    await chrome.storage.local.set({ settings: settingsForSync });
                    
                    // Save groups to local storage to avoid quota issues
                    await chrome.storage.local.set({ groups: sanitizedGroups });
                    
                    // Save the background image to local storage if we have one
                    if (backgroundImage) {
                        await chrome.storage.local.set({ backgroundImage });
                    }
                    
                    // Save a reference in sync storage that groups are in local storage
                    await chrome.storage.local.set({ groupsLocation: 'local' });
                    
                    Debugger.log('Data successfully saved to Chrome storage (split between sync and local)');
                } catch (syncError) {
                    Debugger.warn('Error saving to sync storage, falling back to local storage', syncError);
                    
                    // Make a copy of current settings for local storage
                    const settingsForLocal = { ...currentSettings };
                    
                    // Check if we have a background image 
                    let backgroundImage = null;
                    if (settingsForLocal.backgroundImage) {
                        // Store the background image separately
                        backgroundImage = settingsForLocal.backgroundImage;
                        
                        // Remove background image from settings to avoid quota limits
                        settingsForLocal.backgroundImage = null;
                    }
                    
                    // If sync fails, save everything to local storage
                    await chrome.storage.local.set({ 
                        groups: sanitizedGroups,
                        settings: settingsForLocal,
                        groupsLocation: 'local'
                    });
                    
                    // Save the background image separately if we have one
                    if (backgroundImage) {
                        await chrome.storage.local.set({ backgroundImage });
                    }
                }
            } else {
                // If sync is not available, use local
                
                // Make a copy of current settings for local storage
                const settingsForLocal = { ...currentSettings };
                
                // Check if we have a background image 
                let backgroundImage = null;
                if (settingsForLocal.backgroundImage) {
                    // Store the background image separately
                    backgroundImage = settingsForLocal.backgroundImage;
                    
                    // Remove background image from settings to avoid quota limits
                    settingsForLocal.backgroundImage = null;
                }
                
                await chrome.storage.local.set({ 
                    groups: sanitizedGroups,
                    settings: settingsForLocal
                });
                
                // Save the background image separately if we have one
                if (backgroundImage) {
                    await chrome.storage.local.set({ backgroundImage });
                }
            }
            
            // Optionally update currentGroups in memory
            currentGroups = sanitizedGroups;
        } else {
            // Fallback for development/testing environment
            const sanitizedGroups = sanitizeGroupLinks(currentGroups);
            localStorage.setItem('groups', JSON.stringify(sanitizedGroups));
            localStorage.setItem('settings', JSON.stringify(currentSettings));
            currentGroups = sanitizedGroups;
            Debugger.warn('Saved to localStorage (Chrome API not available)');
        }
        
        // Update feedback
        saveButton.innerHTML = 'Saved!';
        
        // Reset button text after 2 seconds
        setTimeout(() => {
            saveButton.innerHTML = originalText;
        }, 2000);
    } catch (error) {
        Debugger.error('Error saving data:', error);
        alert(`Error saving data: ${error.message}`);
        
        // Reset button text
        document.getElementById('save-changes-btn').innerHTML = '<i>💾</i>';
    }
});

// Create grid overlay for snap
const gridOverlay = document.createElement('div');
gridOverlay.className = 'grid-overlay';
document.body.appendChild(gridOverlay);

// Create rule of thirds overlay
const ruleOfThirdsOverlay = document.createElement('div');
ruleOfThirdsOverlay.className = 'rule-of-thirds';
document.body.appendChild(ruleOfThirdsOverlay);

// Debug function - Press Alt+G to toggle grid visibility
document.addEventListener('keydown', function(e) {
    if (e.altKey && e.key === 'g') {
        document.body.classList.toggle('show-grid');
    }
});

// Toggle drag mode
toggleDragBtn.addEventListener('click', () => {
    dragEnabled = !dragEnabled;
    toggleDragBtn.innerHTML = '<i>⫝̸</i>'; // Maintain the same icon regardless of state
    
    // Apply visual indicator for active state
    if (dragEnabled) {
        toggleDragBtn.classList.add('toggle-active');
        ruleOfThirdsOverlay.style.display = 'block';
    } else {
        toggleDragBtn.classList.remove('toggle-active');
        ruleOfThirdsOverlay.style.display = 'none';
    }
    
    // Refresh to apply drag mode
    renderGroups();
});

// Drag and drop event handlers
function handleDragStart(e) {
    activeGroup = e.target;
    activeGroup.classList.add('dragging');
    
    // Store initial position
    initialX = e.clientX;
    initialY = e.clientY;
}

function handleDragEnd(e) {
    if (!activeGroup) return;
    
    activeGroup.classList.remove('dragging');
    
    // Calculate new position
    const index = parseInt(activeGroup.dataset.index);
    if (index >= 0 && index < currentGroups.length) {
        updateGroupPosition(index, activeGroup.offsetLeft, activeGroup.offsetTop);
    }
    
    activeGroup = null;
}

function handleMouseDown(e) {
    if (!dragEnabled) return;
    
    // Only handle drag on the main div (not on inputs and buttons)
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
        return;
    }
    
    // Set current element as active for dragging
    activeGroup = e.currentTarget;
    initialX = e.clientX;
    initialY = e.clientY;
    
    // Get current element position from computed style
    const style = window.getComputedStyle(activeGroup);
    const left = style.left;
    const top = style.top;
    
    // Get screen dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate current position as a decimal (0-1 range)
    let currentLeftPercent = 0.5; // default to center
    let currentTopPercent = 0.5;  // default to center
    
    // Parse position values, handling both pixel and percentage formats
    if (left.endsWith('%')) {
        currentLeftPercent = parseFloat(left) / 100;
    } else {
        const leftPx = parseInt(left) || 0;
        currentLeftPercent = leftPx / screenWidth;
    }
    
    if (top.endsWith('%')) {
        currentTopPercent = parseFloat(top) / 100;
    } else {
        const topPx = parseInt(top) || 0;
        currentTopPercent = topPx / screenHeight;
    }
    
    // Store these values for the drag calculation
    offsetX = currentLeftPercent;
    offsetY = currentTopPercent;
    
    // Add visual feedback for dragging
    activeGroup.classList.add('dragging');
    
    // Show grid overlay for snap-to-grid
    gridOverlay.style.display = 'block';
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    e.preventDefault();
    
    // Add event listeners to document to handle mouse movements
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

function handleMouseUp(e) {
    if (!activeGroup) return;
    
    // Clean up the visual indicators
    activeGroup.classList.remove('dragging');
    document.body.style.userSelect = '';
    
    // Hide grid overlay, but keep rule of thirds if drag is enabled
    gridOverlay.style.display = 'none';
    ruleOfThirdsOverlay.style.display = dragEnabled ? 'block' : 'none';
    
    // Update the group position in the data model
    const index = parseInt(activeGroup.dataset.index);
    if (index >= 0 && index < currentGroups.length) {
        // Get the final position
        const left = activeGroup.style.left;
        const top = activeGroup.style.top;
        
        // Store as percentage values directly
        currentGroups[index].x = left;
        currentGroups[index].y = top;
    }
    
    // Remove the document event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Reset the active group
    activeGroup = null;
}

function handleMouseMove(e) {
    if (!activeGroup) return;
    
    e.preventDefault();
    
    // Get current viewport dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate mouse movement as percentage of screen
    const dxPercent = (e.clientX - initialX) / screenWidth;
    const dyPercent = (e.clientY - initialY) / screenHeight;
    
    // Calculate new percentage positions by adding the movement
    let newPercentX = offsetX + dxPercent;
    let newPercentY = offsetY + dyPercent;
    
    // Snap to grid if drag is enabled
    if (dragEnabled) {
        // Use the configured grid divisions for horizontal and vertical snapping
        newPercentX = Math.round(newPercentX * GRID_DIVISIONS_X) / GRID_DIVISIONS_X;
        newPercentY = Math.round(newPercentY * GRID_DIVISIONS_Y) / GRID_DIVISIONS_Y;
    }
    
    // Apply margin constraints
    const marginPercent = MIN_MARGIN / 100;
    newPercentX = Math.max(marginPercent, Math.min(1 - marginPercent, newPercentX));
    newPercentY = Math.max(marginPercent, Math.min(1 - marginPercent, newPercentY));
    
    // Apply the new position
    activeGroup.style.left = `${newPercentX * 100}%`;
    activeGroup.style.top = `${newPercentY * 100}%`;
    activeGroup.style.transform = 'translate(-50%, -50%)';
}

function updateGroupPosition(index, x, y) {
    // If values are already percentages, use them directly but snap to grid
    if (typeof x === 'string' && x.endsWith('%') && 
        typeof y === 'string' && y.endsWith('%')) {
        // Extract percentage values and snap to grid
        let percentX = parseFloat(x) / 100;
        let percentY = parseFloat(y) / 100;
        
        // Snap to uniform grid (20x20)
        percentX = Math.round(percentX * GRID_DIVISIONS) / GRID_DIVISIONS;
        percentY = Math.round(percentY * GRID_DIVISIONS) / GRID_DIVISIONS;
        
        currentGroups[index].x = `${percentX * 100}%`;
        currentGroups[index].y = `${percentY * 100}%`;
        // Auto-save when group position is updated
        saveGroupsToStorage();
        return;
    }
    
    // Parse values to ensure they're numeric
    const numX = parseInt(x, 10);
    const numY = parseInt(y, 10);
    
    // Get dimensions based on the window, not the container
    // This matches the calculation in newtab.js
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Convert absolute positions to percentages
    let percentX = numX / screenWidth;
    let percentY = numY / screenHeight;
    
    // Snap to grid using GRID_DIVISIONS (now fixed at 20)
    percentX = Math.round(percentX * GRID_DIVISIONS) / GRID_DIVISIONS;
    percentY = Math.round(percentY * GRID_DIVISIONS) / GRID_DIVISIONS;
    
    // Use min margin from the constant
    const marginPercent = MIN_MARGIN / 100;
    
    // Ensure percentages are within bounds
    percentX = Math.max(marginPercent, Math.min(1 - marginPercent, percentX));
    percentY = Math.max(marginPercent, Math.min(1 - marginPercent, percentY));
    
    // Store position as percentage strings
    currentGroups[index].x = `${percentX * 100}%`;
    currentGroups[index].y = `${percentY * 100}%`;
    // Auto-save when group position is updated
    saveGroupsToStorage();
}

// Function to create a widget settings dialog
function openWidgetSettings(index) {
    const widget = currentGroups[index];
    
    // Create a custom dialog for the widget settings
    const settingsDialog = document.createElement('div');
    settingsDialog.className = 'popup';
    settingsDialog.style.display = 'flex';
    
    const settingsContent = document.createElement('div');
    settingsContent.className = 'popup-content';
    
    // Add a title to the dialog
    const title = document.createElement('h2');
    title.textContent = `${widget.title || 'Widget'} Settings`;
    settingsContent.appendChild(title);
    
    // Add a description
    const description = document.createElement('p');
    description.textContent = `Configure your ${widget.title || 'Widget'} widget.`;
    settingsContent.appendChild(description);
    
    // Create settings form based on widget type
    const settingsForm = document.createElement('div');
    settingsForm.className = 'widget-settings-form';
    settingsForm.style.margin = '20px 0';
    
    // Initialize settings object if it doesn't exist
    if (!widget.settings) {
        widget.settings = {};
    }
    
    // Create appropriate settings form based on widget type
    switch (widget.widgetType) {
        case 'weather':
            createWeatherWidgetSettings(settingsForm, widget);
            break;
        case 'analog-clock':
        case 'digital-clock':
            createClockWidgetSettings(settingsForm, widget);
            break;
        case 'todo':
        case 'notes':
        case 'calendar':
        case 'timer':
        case 'pomodoro':
        case 'quote':
        case 'news':
        case 'stocks':
        case 'rss':
        case 'music-controls':
        case 'bookmarks':
        case 'recently-visited':
        default:
            settingsForm.innerHTML = `
                <p style="text-align: center; padding: 30px; background: rgba(0,0,0,1); border-radius: 8px;">
                    Additional settings for this widget type will be available in a future update.
                </p>
            `;
    }
    
    settingsContent.appendChild(settingsForm);
    
    // Add buttons
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'popup-buttons';
    
    const saveButton = document.createElement('button');
    saveButton.className = 'primary';
    saveButton.textContent = 'Save';
    saveButton.onclick = () => {
        saveWidgetSettings(widget, settingsForm);
        document.body.removeChild(settingsDialog);
        renderGroups(); // Refresh the UI to show updated widget
    };
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = () => document.body.removeChild(settingsDialog);
    
    buttonsDiv.appendChild(saveButton);
    buttonsDiv.appendChild(cancelButton);
    settingsContent.appendChild(buttonsDiv);
    
    // Add the dialog to the page
    settingsDialog.appendChild(settingsContent);
    document.body.appendChild(settingsDialog);
}

// Create settings form for weather widget
function createWeatherWidgetSettings(container, widget) {
    // Ensure settings object exists
    if (!widget.settings) {
        widget.settings = {};
    }
    
    const formHTML = `
        <div class="settings-row">
            <label for="weather-location">Location</label>
            <input type="text" id="weather-location" value="${widget.settings.location || ''}" 
                   placeholder="Enter zip code, city name, or 'auto' for current location">
            <p class="field-help">Enter a US ZIP code (e.g., 10001), city name (e.g., New York), or "auto" for automatic location detection</p>
        </div>
        
        <div class="settings-row">
            <label for="weather-units">Units</label>
            <select id="weather-units">
                <option value="imperial" ${widget.settings.units === 'imperial' || !widget.settings.units ? 'selected' : ''}>Fahrenheit (°F)</option>
                <option value="metric" ${widget.settings.units === 'metric' ? 'selected' : ''}>Celsius (°C)</option>
            </select>
        </div>
    `;
    
    container.innerHTML = formHTML;
    
    // Add some styling for the form
    const style = document.createElement('style');
    style.textContent = `
        .widget-settings-form .settings-row {
            margin-bottom: 15px;
        }
        
        .widget-settings-form label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        .widget-settings-form input[type="text"],
        .widget-settings-form select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .widget-settings-form .field-help {
            margin-top: 5px;
            font-size: 12px;
            color: #666;
        }
    `;
    document.head.appendChild(style);
}

// Create settings form for clock widgets
function createClockWidgetSettings(container, widget) {
    // Ensure settings object exists
    if (!widget.settings) {
        widget.settings = {};
    }
    
    const isDigital = widget.widgetType === 'digital-clock';
    
    let formHTML = `
        <div class="settings-row">
            <label for="clock-timezone">Timezone</label>
            <select id="clock-timezone">
                <option value="local" ${widget.settings.timezone === 'local' || !widget.settings.timezone ? 'selected' : ''}>Local Time</option>
                <option value="America/New_York" ${widget.settings.timezone === 'America/New_York' ? 'selected' : ''}>New York (EST/EDT)</option>
                <option value="America/Los_Angeles" ${widget.settings.timezone === 'America/Los_Angeles' ? 'selected' : ''}>Los Angeles (PST/PDT)</option>
                <option value="Europe/London" ${widget.settings.timezone === 'Europe/London' ? 'selected' : ''}>London (GMT/BST)</option>
                <option value="Europe/Paris" ${widget.settings.timezone === 'Europe/Paris' ? 'selected' : ''}>Paris (CET/CEST)</option>
                <option value="Asia/Tokyo" ${widget.settings.timezone === 'Asia/Tokyo' ? 'selected' : ''}>Tokyo (JST)</option>
            </select>
        </div>
    `;
    
    // Add digital clock specific options
    if (isDigital) {
        formHTML += `
            <div class="settings-row">
                <label for="clock-format">Time Format</label>
                <select id="clock-format">
                    <option value="24h" ${widget.settings.timeFormat === '24h' || !widget.settings.timeFormat ? 'selected' : ''}>24-hour</option>
                    <option value="12h" ${widget.settings.timeFormat === '12h' ? 'selected' : ''}>12-hour (AM/PM)</option>
                </select>
            </div>
            
            <div class="settings-row">
                <div class="checkbox-group">
                    <input type="checkbox" id="show-seconds" ${widget.settings.showSeconds !== false ? 'checked' : ''}>
                    <label for="show-seconds">Show seconds</label>
                </div>
            </div>
            
            <div class="settings-row">
                <div class="checkbox-group">
                    <input type="checkbox" id="show-date" ${widget.settings.showDate !== false ? 'checked' : ''}>
                    <label for="show-date">Show date</label>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = formHTML;
    
    // Add some styling for the form
    const style = document.createElement('style');
    style.textContent = `
        .widget-settings-form .settings-row {
            margin-bottom: 15px;
        }
        
        .widget-settings-form label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        .widget-settings-form select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .widget-settings-form .checkbox-group {
            display: flex;
            align-items: center;
        }
        
        .widget-settings-form .checkbox-group input[type="checkbox"] {
            margin-right: 10px;
        }
        
        .widget-settings-form .checkbox-group label {
            display: inline;
            margin-bottom: 0;
        }
    `;
    document.head.appendChild(style);
}

// Save widget settings from the form
function saveWidgetSettings(widget, form) {
    // Handle different widget types
    switch (widget.widgetType) {
        case 'weather':
            // Get values from the weather settings form
            const location = document.getElementById('weather-location').value.trim();
            const units = document.getElementById('weather-units').value;
            
            // Update widget settings
            widget.settings.location = location || 'auto';
            widget.settings.units = units;
            break;
            
        case 'digital-clock':
            // Get values from the digital clock settings form
            const timeFormat = document.getElementById('clock-format').value;
            const showSeconds = document.getElementById('show-seconds').checked;
            const showDate = document.getElementById('show-date').checked;
            const timezone = document.getElementById('clock-timezone').value;
            
            // Update widget settings
            widget.settings.timeFormat = timeFormat;
            widget.settings.showSeconds = showSeconds;
            widget.settings.showDate = showDate;
            widget.settings.timezone = timezone;
            break;
            
        case 'analog-clock':
            // Get values from the analog clock settings form
            const analogTimezone = document.getElementById('clock-timezone').value;
            
            // Update widget settings
            widget.settings.timezone = analogTimezone;
            break;
            
        default:
            // No specific settings for other widget types yet
            break;
    }
}

// Use global getFavicon function from editor-utils.js

// Apps management
let editingAppIndex = -1;

// Function to open the apps manager popup
function openAppsManager() {
    const appsManagerPopup = document.getElementById('apps-manager-popup');
    appsManagerPopup.style.display = 'flex';
    
    // Initialize the apps list
    renderAppsList();
}

// Function to render the apps list in the manager
function renderAppsList() {
    const appsListContainer = document.getElementById('apps-list-container');
    appsListContainer.innerHTML = '';
    
    if (!currentSettings.apps || currentSettings.apps.length === 0) {
        if (!currentSettings.apps) {
            currentSettings.apps = [];
        }
        
        // If no apps, show a message
        const noAppsMessage = document.createElement('div');
        noAppsMessage.className = 'no-apps-message';
        noAppsMessage.textContent = 'No apps added yet. Click "Add App" to get started.';
        noAppsMessage.style.padding = '16px';
        noAppsMessage.style.textAlign = 'center';
        appsListContainer.appendChild(noAppsMessage);
        return;
    }
    
    // Add each app to the list
    currentSettings.apps.forEach((app, index) => {
        const appItem = document.createElement('div');
        appItem.className = 'app-list-item';
        
        const appIcon = document.createElement('img');
        appIcon.src = app.icon || getFavicon(app.url);
        appIcon.alt = app.name;
        appIcon.className = 'app-list-icon';
        
        const appDetails = document.createElement('div');
        appDetails.className = 'app-list-details';
        
        const appName = document.createElement('div');
        appName.className = 'app-list-name';
        appName.textContent = app.name;
        
        const appUrl = document.createElement('div');
        appUrl.className = 'app-list-url';
        appUrl.textContent = app.url;
        
        appDetails.appendChild(appName);
        appDetails.appendChild(appUrl);
        
        const appActions = document.createElement('div');
        appActions.className = 'app-list-actions';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'app-edit-btn';
        editBtn.innerHTML = '✎'; // pencil icon
        editBtn.title = 'Edit app';
        editBtn.addEventListener('click', () => openAppEditor(index));
        
        // Move up button (disabled for first item)
        const moveUpBtn = document.createElement('button');
        moveUpBtn.className = 'app-move-up-btn';
        moveUpBtn.innerHTML = '↑'; // up arrow
        moveUpBtn.title = 'Move up';
        moveUpBtn.disabled = index === 0;
        moveUpBtn.style.opacity = index === 0 ? '0.5' : '1';
        moveUpBtn.addEventListener('click', () => moveApp(index, -1));
        
        // Move down button (disabled for last item)
        const moveDownBtn = document.createElement('button');
        moveDownBtn.className = 'app-move-down-btn';
        moveDownBtn.innerHTML = '↓'; // down arrow
        moveDownBtn.title = 'Move down';
        moveDownBtn.disabled = index === currentSettings.apps.length - 1;
        moveDownBtn.style.opacity = index === currentSettings.apps.length - 1 ? '0.5' : '1';
        moveDownBtn.addEventListener('click', () => moveApp(index, 1));
        
        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'app-remove-btn';
        removeBtn.innerHTML = '✕'; // x icon
        removeBtn.title = 'Remove app';
        removeBtn.addEventListener('click', () => {
            if (confirm(`Are you sure you want to remove "${app.name}"?`)) {
                removeApp(index);
            }
        });
        
        // Add buttons to actions container
        appActions.appendChild(moveUpBtn);
        appActions.appendChild(moveDownBtn);
        appActions.appendChild(editBtn);
        appActions.appendChild(removeBtn);
        
        // Add all elements to the app item
        appItem.appendChild(appIcon);
        appItem.appendChild(appDetails);
        appItem.appendChild(appActions);
        
        // Add app item to the container
        appsListContainer.appendChild(appItem);
    });
}

// Function to move app up or down in the list
function moveApp(index, direction) {
    // Check bounds
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= currentSettings.apps.length) {
        return;
    }
    
    // Swap the apps
    const temp = currentSettings.apps[index];
    currentSettings.apps[index] = currentSettings.apps[newIndex];
    currentSettings.apps[newIndex] = temp;
    
    // Re-render the list
    renderAppsList();
}

// Function to remove an app from the list
function removeApp(index) {
    currentSettings.apps.splice(index, 1);
    renderAppsList();
}

// Function to open the app editor
function openAppEditor(index = -1) {
    const appEditPopup = document.getElementById('app-edit-popup');
    appEditPopup.style.display = 'flex';
    
    const nameInput = document.getElementById('app-name');
    const urlInput = document.getElementById('app-url');
    const iconInput = document.getElementById('app-icon');
    
    editingAppIndex = index;
    
    if (index >= 0 && index < currentSettings.apps.length) {
        // Editing existing app
        const app = currentSettings.apps[index];
        nameInput.value = app.name || '';
        urlInput.value = app.url || '';
        iconInput.value = app.icon || '';
    } else {
        // Adding new app
        nameInput.value = '';
        urlInput.value = '';
        iconInput.value = '';
    }
}

// Function to save app changes
function saveAppChanges() {
    const nameInput = document.getElementById('app-name');
    const urlInput = document.getElementById('app-url');
    const iconInput = document.getElementById('app-icon');
    
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    const icon = iconInput.value.trim() || getFavicon(url);
    
    // Validation
    if (!name) {
        alert('Please enter an app name');
        return;
    }
    
    if (!url) {
        alert('Please enter a URL');
        return;
    }
    
    // Ensure URL has protocol
    let validUrl = url;
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
        validUrl = 'https://' + validUrl;
    }
    
    const app = {
        name,
        url: validUrl,
        icon: icon || getFavicon(validUrl)
    };
    
    if (editingAppIndex >= 0 && editingAppIndex < currentSettings.apps.length) {
        // Update existing app
        currentSettings.apps[editingAppIndex] = app;
    } else {
        // Add new app
        if (!currentSettings.apps) {
            currentSettings.apps = [];
        }
        currentSettings.apps.push(app);
    }
    
    // Close popup and refresh apps list
    document.getElementById('app-edit-popup').style.display = 'none';
    renderAppsList();
}

// Header Links Management
let editingHeaderLinkIndex = -1;

// Function to open the header links editor
function openHeaderEditor() {
    const headerEditorPopup = document.getElementById('header-editor-popup');
    headerEditorPopup.style.display = 'flex';
    
    // Initialize the header links list
    renderHeaderLinksList();
}

// Function to render the header links list
function renderHeaderLinksList() {
    const headerLinksContainer = document.getElementById('header-links-container');
    headerLinksContainer.innerHTML = '';
    
    if (!currentSettings.headerLinks || currentSettings.headerLinks.length === 0) {
        if (!currentSettings.headerLinks) {
            currentSettings.headerLinks = [];
        }
        
        // If no links, show a message
        const noLinksMessage = document.createElement('div');
        noLinksMessage.className = 'no-links-message';
        noLinksMessage.textContent = 'No header links added yet. Click "Add Link" to get started.';
        noLinksMessage.style.padding = '16px';
        noLinksMessage.style.textAlign = 'center';
        headerLinksContainer.appendChild(noLinksMessage);
        return;
    }
    
    // Add each link to the list
    currentSettings.headerLinks.forEach((link, index) => {
        const linkItem = document.createElement('div');
        linkItem.className = 'header-link-item';
        
        const linkDetails = document.createElement('div');
        linkDetails.className = 'app-list-details';
        
        const linkName = document.createElement('div');
        linkName.className = 'app-list-name';
        linkName.textContent = link.name;
        
        const linkUrl = document.createElement('div');
        linkUrl.className = 'app-list-url';
        linkUrl.textContent = link.url;
        
        linkDetails.appendChild(linkName);
        linkDetails.appendChild(linkUrl);
        
        const linkActions = document.createElement('div');
        linkActions.className = 'app-list-actions';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'app-edit-btn';
        editBtn.innerHTML = '✎'; // pencil icon
        editBtn.title = 'Edit link';
        editBtn.addEventListener('click', () => openHeaderLinkEditor(index));
        
        // Move up button (disabled for first item)
        const moveUpBtn = document.createElement('button');
        moveUpBtn.className = 'app-move-up-btn';
        moveUpBtn.innerHTML = '↑'; // up arrow
        moveUpBtn.title = 'Move up';
        moveUpBtn.disabled = index === 0;
        moveUpBtn.style.opacity = index === 0 ? '0.5' : '1';
        moveUpBtn.addEventListener('click', () => moveHeaderLink(index, -1));
        
        // Move down button (disabled for last item)
        const moveDownBtn = document.createElement('button');
        moveDownBtn.className = 'app-move-down-btn';
        moveDownBtn.innerHTML = '↓'; // down arrow
        moveDownBtn.title = 'Move down';
        moveDownBtn.disabled = index === currentSettings.headerLinks.length - 1;
        moveDownBtn.style.opacity = index === currentSettings.headerLinks.length - 1 ? '0.5' : '1';
        moveDownBtn.addEventListener('click', () => moveHeaderLink(index, 1));
        
        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'app-remove-btn';
        removeBtn.innerHTML = '✕'; // x icon
        removeBtn.title = 'Remove link';
        removeBtn.addEventListener('click', () => {
            if (confirm(`Are you sure you want to remove "${link.name}"?`)) {
                removeHeaderLink(index);
            }
        });
        
        // Add buttons to actions container
        linkActions.appendChild(moveUpBtn);
        linkActions.appendChild(moveDownBtn);
        linkActions.appendChild(editBtn);
        linkActions.appendChild(removeBtn);
        
        // Add all elements to the link item
        linkItem.appendChild(linkDetails);
        linkItem.appendChild(linkActions);
        
        // Add link item to the container
        headerLinksContainer.appendChild(linkItem);
    });
}

// Function to move header link up or down in the list
function moveHeaderLink(index, direction) {
    // Check bounds
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= currentSettings.headerLinks.length) {
        return;
    }
    
    // Swap the links
    const temp = currentSettings.headerLinks[index];
    currentSettings.headerLinks[index] = currentSettings.headerLinks[newIndex];
    currentSettings.headerLinks[newIndex] = temp;
    
    // Re-render the list
    renderHeaderLinksList();
}

// Function to remove a header link from the list
function removeHeaderLink(index) {
    currentSettings.headerLinks.splice(index, 1);
    renderHeaderLinksList();
}

// Function to open the header link editor
function openHeaderLinkEditor(index = -1) {
    const headerLinkEditPopup = document.getElementById('header-link-edit-popup');
    headerLinkEditPopup.style.display = 'flex';
    
    const nameInput = document.getElementById('header-link-name');
    const urlInput = document.getElementById('header-link-url');
    
    editingHeaderLinkIndex = index;
    
    if (index >= 0 && index < currentSettings.headerLinks.length) {
        // Editing existing link
        const link = currentSettings.headerLinks[index];
        nameInput.value = link.name || '';
        urlInput.value = link.url || '';
    } else {
        // Adding new link
        nameInput.value = '';
        urlInput.value = '';
    }
}

// Function to save header link changes
function saveHeaderLinkChanges() {
    const nameInput = document.getElementById('header-link-name');
    const urlInput = document.getElementById('header-link-url');
    
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    
    // Validation
    if (!name) {
        alert('Please enter a link name');
        return;
    }
    
    if (!url) {
        alert('Please enter a URL');
        return;
    }
    
    // Ensure URL has protocol
    let validUrl = url;
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
        validUrl = 'https://' + validUrl;
    }
    
    const link = {
        name,
        url: validUrl
    };
    
    if (editingHeaderLinkIndex >= 0 && editingHeaderLinkIndex < currentSettings.headerLinks.length) {
        // Update existing link
        currentSettings.headerLinks[editingHeaderLinkIndex] = link;
    } else {
        // Add new link
        if (!currentSettings.headerLinks) {
            currentSettings.headerLinks = [];
        }
        currentSettings.headerLinks.push(link);
    }
    
    // Close popup and refresh links list
    document.getElementById('header-link-edit-popup').style.display = 'none';
    renderHeaderLinksList();
}

// Initialize header editor and apps manager functionality
document.addEventListener('DOMContentLoaded', function() {
    // Apply theme immediately on page load
    applyThemeToEditor();
    
    // Event handler for the Edit Header button
    const editHeaderBtn = document.getElementById('edit-header-btn');
    if (editHeaderBtn) {
        editHeaderBtn.addEventListener('click', function() {
            openHeaderEditor();
        });
    }
    
    // Event handlers for the header editor popup
    const cancelHeaderBtn = document.getElementById('cancel-header-btn');
    const saveHeaderBtn = document.getElementById('save-header-btn');
    const addHeaderLinkBtn = document.getElementById('add-header-link-btn');
    
    if (cancelHeaderBtn) {
        cancelHeaderBtn.addEventListener('click', function() {
            document.getElementById('header-editor-popup').style.display = 'none';
        });
    }
    
    if (saveHeaderBtn) {
        saveHeaderBtn.addEventListener('click', function() {
            document.getElementById('header-editor-popup').style.display = 'none';
            // No need to save here - links are already updated in currentSettings
            // They'll be saved when the main Save Changes button is clicked
        });
    }
    
    if (addHeaderLinkBtn) {
        addHeaderLinkBtn.addEventListener('click', function() {
            openHeaderLinkEditor(); // Open the header link editor for a new link
        });
    }
    
    // Event handlers for header link edit popup
    const cancelHeaderLinkEditBtn = document.getElementById('cancel-header-link-edit-btn');
    const saveHeaderLinkEditBtn = document.getElementById('save-header-link-edit-btn');
    
    if (cancelHeaderLinkEditBtn) {
        cancelHeaderLinkEditBtn.addEventListener('click', function() {
            document.getElementById('header-link-edit-popup').style.display = 'none';
        });
    }
    
    if (saveHeaderLinkEditBtn) {
        saveHeaderLinkEditBtn.addEventListener('click', saveHeaderLinkChanges);
    }
    
    // Event handler for apps management
    const cancelAppsBtn = document.getElementById('cancel-apps-btn');
    const saveAppsBtn = document.getElementById('save-apps-btn');
    const addAppBtn = document.getElementById('add-app-btn');
    
    if (cancelAppsBtn) {
        cancelAppsBtn.addEventListener('click', function() {
            document.getElementById('apps-manager-popup').style.display = 'none';
        });
    }
    
    if (saveAppsBtn) {
        saveAppsBtn.addEventListener('click', function() {
            document.getElementById('apps-manager-popup').style.display = 'none';
            // No need to save here - apps are already updated in currentSettings
            // They'll be saved when the main Save Changes button is clicked
        });
    }
    
    if (addAppBtn) {
        addAppBtn.addEventListener('click', function() {
            openAppEditor(); // Open the app editor for a new app
        });
    }
    
    // Event handlers for app edit popup
    const cancelAppEditBtn = document.getElementById('cancel-app-edit-btn');
    const saveAppEditBtn = document.getElementById('save-app-edit-btn');
    
    if (cancelAppEditBtn) {
        cancelAppEditBtn.addEventListener('click', function() {
            document.getElementById('app-edit-popup').style.display = 'none';
        });
    }
    
    if (saveAppEditBtn) {
        saveAppEditBtn.addEventListener('click', saveAppChanges);
    }
});

function fixUrl(url) {
    if (!url) return '';
    if(url.includes('chrome:') || url.includes('edge:')) return url; // Don't modify Chrome/Edge URLs
    // If url starts with http:// or https://, return as is
    if (/^https?:\/\//i.test(url)) return url;
    // If url starts with www., add https://
    if (/^www\./i.test(url)) return 'https://' + url;
    // Otherwise, add https://
    return 'https://' + url;
}

function sanitizeGroupLinks(groups) {
    return groups.map(group => {
        if (Array.isArray(group.links)) {
            group.links = group.links.map(link => ({
                ...link,
                url: fixUrl(link.url)
            }));
        }
        return group;
    });
}

// Example usage before saving:
async function saveGroupsToStorage() {
    const sanitizedGroups = sanitizeGroupLinks(currentGroups);
    // Save sanitizedGroups instead of currentGroups
    if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ groups: sanitizedGroups });
    } else {
        localStorage.setItem('groups', JSON.stringify(sanitizedGroups));
    }
    // Optionally update currentGroups in memory
    currentGroups = sanitizedGroups;
}