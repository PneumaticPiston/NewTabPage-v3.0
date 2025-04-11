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

let currentGroups = [];
let currentSettings = {};
let editingGroupIndex = -1;
let dragEnabled = false;
let activeGroup = null;
let initialX = 0;
let initialY = 0;
let offsetX = 0;
let offsetY = 0;

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
    ]
};

// Load groups and settings when page loads
// Apply theme colors to body
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
        
        // Apply custom background if enabled
        if (currentSettings.useCustomBackground) {
            // Prefer stored image over URL
            if (currentSettings.backgroundImage) {
                document.documentElement.style.setProperty('--background-image', `url(${currentSettings.backgroundImage})`);
            } else if (currentSettings.backgroundURL) {
                document.documentElement.style.setProperty('--background-image', `url(${currentSettings.backgroundURL})`);
            }
        } else {
            document.documentElement.style.setProperty('--background-image', 'none');
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check if chrome.storage is available (running as extension)
        if (typeof chrome !== 'undefined' && chrome.storage) {
            console.log('Chrome storage API available, loading data...');
            
            // First, try to load settings from sync storage
            let syncData = {};
            if (chrome.storage.sync) {
                syncData = await chrome.storage.sync.get(['settings', 'groupsLocation']);
            }
            
            // Load settings
            currentSettings = syncData.settings || {...defaultSettings};
            
            // Load groups based on location indicator
            if (syncData.groupsLocation === 'local') {
                // Groups are stored in local storage
                const localData = await chrome.storage.local.get(['groups']);
                currentGroups = localData.groups || [];
                console.log('Groups loaded from Chrome local storage');
            } else {
                // Try to get groups from sync storage first
                if (chrome.storage.sync && syncData.groups) {
                    currentGroups = syncData.groups;
                    console.log('Groups loaded from Chrome sync storage');
                } else {
                    // Fallback to local storage
                    const localData = await chrome.storage.local.get(['groups']);
                    currentGroups = localData.groups || [];
                    console.log('Groups loaded from Chrome local storage (fallback)');
                }
            }
            
            // Load background image from local storage if we're using a custom background
            if (currentSettings.useCustomBackground) {
                try {
                    const localResult = await chrome.storage.local.get(['backgroundImage']);
                    if (localResult.backgroundImage) {
                        currentSettings.backgroundImage = localResult.backgroundImage;
                        console.log('Background image loaded from Chrome local storage');
                    }
                } catch (localError) {
                    console.warn('Error loading background image from local storage:', localError);
                }
            }
        } else {
            // Fallback for development/testing environment
            console.warn('Chrome storage API not available, using localStorage fallback');
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
                    console.warn('Error loading background image from localStorage:', localError);
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
        console.error('Error loading data:', error);
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

// Function to position elements relative to viewport using percentages (matching newtab.js)
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

function createGroupElement(group, index) {
    const div = document.createElement('div');
    div.className = 'editor-group';
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

function updateGroupTitle(index, title) {
    currentGroups[index].title = title;
}

function removeGroup(index) {
    currentGroups.splice(index, 1);
    renderGroups();
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

newGroupBtn.addEventListener('click', () => {
    document.getElementById('new-group-popup').style.display = 'flex';
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
});

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
    
    // Reset create button
    const createBtn = document.getElementById('create-new-group-btn');
    createBtn.textContent = 'Create Group';
    createBtn.onclick = createNewGroup;
}

// Safely add event listeners (check if elements exist first)
// These elements seem to be missing from the HTML - removing them for now
// If you need these functionalities, add the corresponding elements to newtab-editor.html

// Initialize search bar drag functionality
function initSearchBarDrag() {
    const handle = searchEditor.querySelector('.editor-handle');
    
    if (!handle) {
        console.error('Search bar handle not found');
        return;
    }
    
    handle.addEventListener('mousedown', function(e) {
        if (!dragEnabled) return;
        
        e.preventDefault();
        
        // Initial cursor positions
        initialX = e.clientX;
        initialY = e.clientY;
        
        // Get current element position
        const rect = searchEditor.getBoundingClientRect();
        
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
        const originalTransform = searchEditor.style.transform;
        
        // Ensure absolute positioning
        searchEditor.style.position = 'absolute';
        
        // Show grid overlay for snap-to-grid
        if (dragEnabled) {
            gridOverlay.style.display = 'block';
        }
        
        // Add mousemove and mouseup event listeners
        document.addEventListener('mousemove', moveSearchBar);
        document.addEventListener('mouseup', function() {
            stopMoveSearchBar(originalTransform);
        });
    });
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
        // Snap to 5% grid (0.05 increments)
        newPercentX = Math.round(newPercentX * 20) / 20;
        newPercentY = Math.round(newPercentY * 20) / 20;
    }
    
    // Ensure percentages are within bounds (0.05-0.95)
    newPercentX = Math.max(0.05, Math.min(0.95, newPercentX));
    newPercentY = Math.max(0.05, Math.min(0.95, newPercentY));
    
    // Apply the new position
    searchEditor.style.left = `${newPercentX * 100}%`;
    searchEditor.style.top = `${newPercentY * 100}%`;
    searchEditor.style.transform = 'translate(-50%, -50%)';
}

// Handle end of search bar movement
function stopMoveSearchBar(originalTransform) {
    // Remove event listeners
    document.removeEventListener('mousemove', moveSearchBar);
    document.removeEventListener('mouseup', arguments.callee);
    
    // Hide grid overlay
    gridOverlay.style.display = 'none';
    
    // Make sure transform is maintained for proper centering
    searchEditor.style.transform = 'translate(-50%, -50%)';
    
    // Get position as percentages from current style
    let left = searchEditor.style.left;
    let top = searchEditor.style.top;
    
    // Make sure we have values
    if (!left || !top) {
        console.error('Search bar position is missing');
        return;
    }
    
    // Make sure they're percentage-based
    if (!left.endsWith('%') || !top.endsWith('%')) {
        console.error('Search bar position is not in percentage format');
        return;
    }
    
    // Update settings with new position as percentages (preserve the % symbol)
    currentSettings.searchBarPosition = { 
        x: left, 
        y: top 
    };
}

// Add widget menu functionality
if (document.getElementById('add-group-button')) {
    document.getElementById('add-group-button').addEventListener('click', function() {
        // Opens the group editor dialog
        document.getElementById('new-group-popup').style.display = 'flex';
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
            console.error('WIDGET_TYPES not defined, cannot populate widget menu');
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
                    // Handle widget selection - to be implemented
                    console.log(`Selected widget: ${widget.id} (${widget.name})`);
                    alert(`Widget ${widget.name} selected! Widget functionality will be implemented in a future update.`);
                    document.getElementById('widget-menu').style.display = 'none';
                });
                
                listDiv.appendChild(widgetItemDiv);
            }
            
            groupDiv.appendChild(listDiv);
            widgetMenu.appendChild(groupDiv);
        }
    } catch (error) {
        console.error('Error populating widget menu:', error);
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

// New group button functionality - show options menu
newGroupBtn.addEventListener('click', function() {
    const optionsMenu = document.getElementById('add-options');
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
            const groupsToSave = JSON.parse(JSON.stringify(currentGroups));
            
            // 2. Store groups and settings separately to avoid hitting quota limit
            if (chrome.storage.sync) {
                try {
                    // Try to save settings to sync storage
                    await chrome.storage.sync.set({ settings: currentSettings });
                    
                    // Save groups to local storage to avoid quota issues
                    await chrome.storage.local.set({ groups: groupsToSave });
                    
                    // Save a reference in sync storage that groups are in local storage
                    await chrome.storage.sync.set({ groupsLocation: 'local' });
                    
                    console.log('Data successfully saved to Chrome storage (split between sync and local)');
                } catch (syncError) {
                    console.warn('Error saving to sync storage, falling back to local storage', syncError);
                    
                    // If sync fails, save everything to local storage
                    await chrome.storage.local.set({ 
                        groups: groupsToSave,
                        settings: currentSettings,
                        groupsLocation: 'local'
                    });
                }
            } else {
                // If sync is not available, use local
                await chrome.storage.local.set({ 
                    groups: groupsToSave,
                    settings: currentSettings
                });
            }
        } else {
            // Fallback for development/testing environment
            localStorage.setItem('groups', JSON.stringify(currentGroups));
            localStorage.setItem('settings', JSON.stringify(currentSettings));
            console.warn('Saved to localStorage (Chrome API not available)');
        }
        
        // Update feedback
        saveButton.innerHTML = 'Saved!';
        
        // Reset button text after 2 seconds
        setTimeout(() => {
            saveButton.innerHTML = originalText;
        }, 2000);
    } catch (error) {
        console.error('Error saving data:', error);
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
    
    activeGroup = e.currentTarget;
    initialX = e.clientX;
    initialY = e.clientY;
    
    // Get current positions as percentages
    const style = window.getComputedStyle(activeGroup);
    const left = style.left;
    const top = style.top;
    
    // Get screen dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Convert percentages to pixels for drag calculation
    if (left.endsWith('%')) {
        offsetX = (parseFloat(left) / 100) * screenWidth;
    } else {
        offsetX = parseInt(left) || 0;
    }
    
    if (top.endsWith('%')) {
        offsetY = (parseFloat(top) / 100) * screenHeight;
    } else {
        offsetY = parseInt(top) || 0;
    }
    
    // Store original transform
    const originalTransform = activeGroup.style.transform;
    
    // Set to absolute positioning if not already
    activeGroup.style.position = 'absolute';
    activeGroup.classList.add('dragging');
    
    // Show grid overlay for snap-to-grid
    gridOverlay.style.display = 'block';
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    e.preventDefault();
    
    // Add event listeners to document to handle mouse movements
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', function(upEvent) {
        handleMouseUp(upEvent, originalTransform);
    });
}

function handleMouseUp(e, originalTransform) {
    if (!activeGroup) return;
    
    // Clean up
    activeGroup.classList.remove('dragging');
    document.body.style.userSelect = '';
    
    // Hide grid overlay, but keep rule of thirds if drag is enabled
    gridOverlay.style.display = 'none';
    ruleOfThirdsOverlay.style.display = dragEnabled ? 'block' : 'none';
    
    // Ensure transform is maintained for proper centering
    activeGroup.style.transform = 'translate(-50%, -50%)';
    
    // Update position in data (already snapped to grid)
    const index = parseInt(activeGroup.dataset.index);
    if (index >= 0 && index < currentGroups.length) {
        let left = activeGroup.style.left;
        let top = activeGroup.style.top;
        
        // Store as percentage values directly
        currentGroups[index].x = left;
        currentGroups[index].y = top;
    }
    
    // Remove document event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', arguments.callee);
    
    activeGroup = null;
}

function handleMouseMove(e) {
    if (!activeGroup) return;
    
    e.preventDefault();
    
    const dx = e.clientX - initialX;
    const dy = e.clientY - initialY;
    
    // Get screen dimensions for percentage calculation
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate raw position
    let newX = offsetX + dx;
    let newY = offsetY + dy;
    
    // Convert to percentages
    let percentX = newX / screenWidth;
    let percentY = newY / screenHeight;
    
    // Snap to 5% grid (0.05 increment)
    if (dragEnabled) {
        percentX = Math.round(percentX * 20) / 20;
        percentY = Math.round(percentY * 20) / 20;
    }
    
    // Ensure percentages are within bounds
    percentX = Math.max(0.05, Math.min(0.95, percentX));
    percentY = Math.max(0.05, Math.min(0.95, percentY));
    
    // Apply snapped position as percentages
    activeGroup.style.left = `${percentX * 100}%`;
    activeGroup.style.top = `${percentY * 100}%`;
    activeGroup.style.transform = 'translate(-50%, -50%)';
}

function updateGroupPosition(index, x, y) {
    // If values are already percentages, use them directly
    if (typeof x === 'string' && x.endsWith('%') && 
        typeof y === 'string' && y.endsWith('%')) {
        currentGroups[index].x = x;
        currentGroups[index].y = y;
        return;
    }
    
    // Parse values to ensure they're numeric
    const numX = parseInt(x, 10);
    const numY = parseInt(y, 10);
    
    // Calculate percentages based on screen dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Convert absolute positions to percentages
    let percentX = numX / screenWidth;
    let percentY = numY / screenHeight;
    
    // Ensure percentages are within bounds (0.05-0.95)
    percentX = Math.max(0.05, Math.min(0.95, percentX));
    percentY = Math.max(0.05, Math.min(0.95, percentY));
    
    // Store position as percentage strings
    currentGroups[index].x = `${percentX * 100}%`;
    currentGroups[index].y = `${percentY * 100}%`;
}

function getFavicon(url) {
    try {
        if (!url) return ''; // Return empty if url is empty
        
        // Make sure URL is properly formatted
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        const domain = new URL(url).hostname;
        
        // Handle Google services specially
        if (domain.includes('google.com')) {
            // Extract the specific Google service
            const service = domain.split('.')[0];
            return `https://www.google.com/s2/favicons?domain=${service}.google.com&sz=32`;
        }
        
        // Default handling for other domains
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch (e) {
        console.warn('Error getting favicon for URL:', url, e);
        return ''; // Return empty string if URL is invalid
    }
}

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