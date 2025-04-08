const groupsContainer = document.getElementById('groups-editor-container');
const newGroupBtn = document.getElementById('new-group-btn');
const saveChangesBtn = document.getElementById('save-changes-btn');
const toggleDragBtn = document.getElementById('toggle-drag-btn');
const addSearchBtn = document.getElementById('add-search-btn');
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
    searchBarPosition: { x: 10, y: 120 }
};

// Load groups and settings when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check if chrome.storage is available (running as extension)
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            console.log('Chrome storage API available, loading data...');
            const data = await chrome.storage.sync.get(['groups', 'settings']);
            currentGroups = data.groups || [];
            currentSettings = data.settings || {...defaultSettings};
        } else {
            // Fallback for development/testing environment
            console.warn('Chrome storage API not available, using localStorage fallback');
            const savedGroups = localStorage.getItem('groups');
            const savedSettings = localStorage.getItem('settings');
            currentGroups = savedGroups ? JSON.parse(savedGroups) : [];
            currentSettings = savedSettings ? JSON.parse(savedSettings) : {...defaultSettings};
        }
        
        // Initialize search bar position
        if (currentSettings.searchBarPosition) {
            searchEditor.style.top = `${currentSettings.searchBarPosition.y}px`;
            searchEditor.style.left = `${currentSettings.searchBarPosition.x}px`;
            searchEditor.style.transform = 'none'; // Remove default centering
        }
        
        // Show/hide search bar based on settings
        searchEditor.style.display = currentSettings.showSearch ? 'block' : 'none';
        
        // Initialize drag events for search bar
        initSearchBarDrag();
        
        // Render groups
        renderGroups();
    } catch (error) {
        console.error('Error loading data:', error);
        currentGroups = [];
        currentSettings = {...defaultSettings};
        renderGroups(); // Still render UI even if loading fails
    }
});

function renderGroups() {
    groupsContainer.innerHTML = '';
    currentGroups.forEach((group, index) => {
        const groupElement = createGroupElement(group, index);
        groupsContainer.appendChild(groupElement);
    });
}

function createGroupElement(group, index) {
    const div = document.createElement('div');
    div.className = 'editor-group';
    div.dataset.index = index;
    
    // Always use absolute positioning to match the new tab page
    div.style.position = 'absolute';
    div.style.top = `${group.y || 10}px`;
    div.style.left = `${group.x || 10}px`;
    
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
    
    handle.addEventListener('mousedown', function(e) {
        if (!dragEnabled) return;
        
        e.preventDefault();
        
        // Initial positions
        initialX = e.clientX;
        initialY = e.clientY;
        
        // Current position
        const style = window.getComputedStyle(searchEditor);
        offsetX = parseInt(style.left) || 0;
        offsetY = parseInt(style.top) || 0;
        
        // Make sure it's using absolute positioning
        searchEditor.style.position = 'absolute';
        searchEditor.style.transform = 'none'; // Remove any transform
        
        // Add mousemove and mouseup event listeners
        document.addEventListener('mousemove', moveSearchBar);
        document.addEventListener('mouseup', stopMoveSearchBar);
    });
}

// Handle search bar movement
function moveSearchBar(e) {
    e.preventDefault();
    
    // Calculate new position
    const dx = e.clientX - initialX;
    const dy = e.clientY - initialY;
    
    searchEditor.style.top = `${offsetY + dy}px`;
    searchEditor.style.left = `${offsetX + dx}px`;
}

// Handle end of search bar movement
function stopMoveSearchBar() {
    // Remove event listeners
    document.removeEventListener('mousemove', moveSearchBar);
    document.removeEventListener('mouseup', stopMoveSearchBar);
    
    // Save the position
    const left = parseInt(searchEditor.style.left);
    const top = parseInt(searchEditor.style.top);
    
    // Update settings with new position
    currentSettings.searchBarPosition = { x: left, y: top };
}

// Toggle search bar visibility
addSearchBtn.addEventListener('click', () => {
    currentSettings.showSearch = !currentSettings.showSearch;
    searchEditor.style.display = currentSettings.showSearch ? 'block' : 'none';
    
    // Update button text
    addSearchBtn.textContent = currentSettings.showSearch ? 'Hide Search' : 'Show Search';
    
    // Toggle active class for visual indication
    addSearchBtn.classList.toggle('toggle-active', currentSettings.showSearch);
});

// Save button - Save groups and settings
saveChangesBtn.addEventListener('click', async () => {
    try {
        // Show feedback to user
        const saveButton = document.getElementById('save-changes-btn');
        const originalText = saveButton.textContent;
        saveButton.textContent = 'Saving...';
        
        // Check if chrome.storage is available (running as extension)
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            // Save groups and settings to Chrome storage sync
            await chrome.storage.sync.set({ 
                groups: currentGroups,
                settings: currentSettings
            });
            console.log('Data successfully saved to Chrome storage:', { groups: currentGroups, settings: currentSettings });
        } else {
            // Fallback for development/testing environment
            localStorage.setItem('groups', JSON.stringify(currentGroups));
            localStorage.setItem('settings', JSON.stringify(currentSettings));
            console.warn('Saved to localStorage (Chrome API not available)');
        }
        
        // Update feedback
        saveButton.textContent = 'Saved!';
        
        // Reset button text after 2 seconds
        setTimeout(() => {
            saveButton.textContent = originalText;
        }, 2000);
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error saving. Please try again.');
        
        // Reset button text
        document.getElementById('save-changes-btn').textContent = 'Save Changes';
    }
});

// Create grid overlay for snap
const gridOverlay = document.createElement('div');
gridOverlay.className = 'grid-overlay';
document.body.appendChild(gridOverlay);

// Toggle drag mode
toggleDragBtn.addEventListener('click', () => {
    dragEnabled = !dragEnabled;
    toggleDragBtn.textContent = dragEnabled ? 'Disable Drag' : 'Toggle Drag';
    
    // Apply visual indicator for active state
    if (dragEnabled) {
        toggleDragBtn.classList.add('toggle-active');
    } else {
        toggleDragBtn.classList.remove('toggle-active');
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
    
    // Get current positions - handle if they're not set yet
    const style = window.getComputedStyle(activeGroup);
    const left = style.left === 'auto' ? 0 : parseInt(style.left);
    const top = style.top === 'auto' ? 0 : parseInt(style.top);
    
    offsetX = left;
    offsetY = top;
    
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
    document.addEventListener('mouseup', handleMouseUp);
}

function handleMouseUp(e) {
    if (!activeGroup) return;
    
    // Clean up
    activeGroup.classList.remove('dragging');
    document.body.style.userSelect = '';
    
    // Hide grid overlay
    gridOverlay.style.display = 'none';
    
    // Update position in data (already snapped to grid)
    const index = parseInt(activeGroup.dataset.index);
    if (index >= 0 && index < currentGroups.length) {
        let left = activeGroup.style.left;
        let top = activeGroup.style.top;
        
        // Remove 'px' suffix
        left = left.replace('px', '');
        top = top.replace('px', '');
        
        updateGroupPosition(index, left, top);
    }
    
    // Remove document event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    activeGroup = null;
}

function handleMouseMove(e) {
    if (!activeGroup) return;
    
    e.preventDefault();
    
    const dx = e.clientX - initialX;
    const dy = e.clientY - initialY;
    
    // Calculate raw position
    let newX = offsetX + dx;
    let newY = offsetY + dy;
    
    // Snap to 10px grid
    newX = Math.round(newX / 10) * 10;
    newY = Math.round(newY / 10) * 10;
    
    // Apply snapped position
    activeGroup.style.left = `${newX}px`;
    activeGroup.style.top = `${newY}px`;
}

function updateGroupPosition(index, x, y) {
    // Parse values to ensure they're numeric
    const numX = parseInt(x, 10);
    const numY = parseInt(y, 10);
    
    // Convert to a common coordinate space (relative to screen center)
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    
    // Calculate relative position to screen center (as percentages from -1 to 1)
    // Then save absolute x,y based on a standard display size
    // This ensures the true position is saved, not the adapted one
    
    // Update the group's position
    currentGroups[index].x = numX;
    currentGroups[index].y = numY;
}

function getFavicon(url) {
    try {
        if (!url) return ''; // Return empty if url is empty
        
        // Make sure URL is properly formatted
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        const domain = new URL(url).hostname;
        // Use smaller favicon size and better error handling
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch (e) {
        console.warn('Error getting favicon for URL:', url, e);
        return ''; // Return empty string if URL is invalid
    }
}