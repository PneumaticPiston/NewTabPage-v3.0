// Ensure toggleGridSettings is available in global scope
window.toggleGridSettings = function() {
    const groupType = document.getElementById('new-group-type').value;
    const gridSettings = document.getElementById('grid-settings');
    gridSettings.style.display = groupType === 'grid' ? 'block' : 'none';
    
    // If single type, show only one link input
    if (groupType === 'single') {
        // Clear existing links except the first one
        const links = document.getElementById('new-group-links').querySelectorAll('.link-editor');
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
};

// Initialize the shortcuts in the editor page
function initializeEditorShortcuts() {
    const shortcutsContainer = document.getElementById('shortcuts-container');
    
    // Skip if shortcuts container doesn't exist
    if (!shortcutsContainer) return;
    
    // Clear existing shortcuts
    const shortcutsContent = shortcutsContainer.querySelector('.shortcuts-content');
    if (!shortcutsContent) return;
    
    shortcutsContent.innerHTML = '';
    
    // Get shortcuts from settings
    let shortcuts = [];
    if (window.currentSettings && window.currentSettings.shortcuts) {
        shortcuts = window.currentSettings.shortcuts;
    } else {
        // Initialize with empty shortcuts array if none found
        shortcuts = [];
        
        // Save empty shortcuts to settings if they don't exist
        if (window.currentSettings) {
            window.currentSettings.shortcuts = shortcuts;
        }
    }
    
    // Add each shortcut
    shortcuts.forEach((shortcut, index) => {
        const shortcutDiv = document.createElement('div');
        shortcutDiv.className = 'shortcut-link';
        shortcutDiv.dataset.index = index;
        
        const iconElement = document.createElement('img');
        iconElement.src = getFavicon(shortcut.url);
        iconElement.alt = shortcut.title;
        iconElement.className = 'shortcut-icon';
        
        const labelElement = document.createElement('span');
        labelElement.textContent = shortcut.title;
        labelElement.className = 'shortcut-label';
        
        // Add to link element
        shortcutDiv.appendChild(iconElement);
        shortcutDiv.appendChild(labelElement);
        
        // Add to container
        shortcutsContent.appendChild(shortcutDiv);
    });
    
    // Update width based on number of shortcuts
    const shortcutCount = shortcuts.length;
    if (shortcutCount > 0) {
        // Calculate approximate width based on number of shortcuts
        // Each shortcut is approximately 80px wide (60px width + 20px gap)
        const estimatedWidth = Math.min(Math.max(shortcutCount * 80 + 40, 400), 800); // Add 40px for padding
        shortcutsContainer.style.width = `${estimatedWidth}px`;
    } else {
        shortcutsContainer.style.width = 'auto';
    }
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
            console.error('Invalid URL format:', url, e);
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
        console.warn('Error getting favicon for URL:', url, e);
        return DEFAULT_ICON;
    }
}

// Make getFavicon available globally
window.getFavicon = getFavicon;

// Shortcuts management functions
// Store original shortcuts before opening editor for cancellation
let originalShortcuts = [];

// Set up the shortcuts editor popup
function setupShortcutsEditorPopup() {
    console.log('Setting up shortcuts editor popup');
    const popup = document.getElementById('shortcuts-editor-popup');
    if (!popup) {
        console.error('Shortcuts editor popup not found!');
        return;
    }
    
    const container = document.getElementById('shortcuts-list-container');
    if (!container) {
        console.error('Shortcuts list container not found!');
        return;
    }
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Deep copy the current shortcuts for cancel functionality
    originalShortcuts = JSON.parse(JSON.stringify(window.currentSettings.shortcuts || []));
    
    // Add each shortcut to the editor
    if (window.currentSettings.shortcuts && window.currentSettings.shortcuts.length > 0) {
        window.currentSettings.shortcuts.forEach((shortcut, index) => {
            addShortcutToEditor(container, shortcut, index);
        });
    } else {
        // Add at least one empty shortcut if none exist
        addShortcutToEditor(container, { title: '', url: '' }, 0);
    }
    
    // Set up the buttons directly without node replacement
    // (node replacement may be causing the issues)
    
    // Set up save button
    const saveBtn = document.getElementById('save-shortcuts-btn');
    if (saveBtn) {
        console.log('Setting up save button');
        // Clear any existing event listeners by cloning and replacing
        saveBtn.replaceWith(saveBtn.cloneNode(true));
        
        // Re-get the button after replacement
        const newSaveBtn = document.getElementById('save-shortcuts-btn');
        newSaveBtn.onclick = function() {
            console.log('Save button clicked');
            saveShortcutsFromEditor();
            popup.style.display = 'none';
        };
    }
    
    // Set up cancel button
    const cancelBtn = document.getElementById('cancel-shortcuts-btn');
    if (cancelBtn) {
        console.log('Setting up cancel button');
        // Clear any existing event listeners by cloning and replacing
        cancelBtn.replaceWith(cancelBtn.cloneNode(true));
        
        // Re-get the button after replacement
        const newCancelBtn = document.getElementById('cancel-shortcuts-btn');
        newCancelBtn.onclick = function() {
            console.log('Cancel button clicked');
            // Restore original shortcuts
            window.currentSettings.shortcuts = JSON.parse(JSON.stringify(originalShortcuts));
            // Update display without saving
            initializeEditorShortcuts();
            popup.style.display = 'none';
        };
    }
    
    // Set up add button
    const addBtn = document.getElementById('add-shortcut-list-btn');
    if (addBtn) {
        console.log('Setting up add button');
        // Clear any existing event listeners by cloning and replacing
        addBtn.replaceWith(addBtn.cloneNode(true));
        
        // Re-get the button after replacement
        const newAddBtn = document.getElementById('add-shortcut-list-btn');
        newAddBtn.onclick = function() {
            console.log('Add button clicked');
            const index = container.children.length;
            addShortcutToEditor(container, { title: '', url: '' }, index);
        };
    }
}

// Open the shortcuts editor - direct function that doesn't rely on helper functions
window.openShortcutsEditor = function() {
    console.log('Opening shortcuts editor');
    
    // Get the popup element
    const popup = document.getElementById('shortcuts-editor-popup');
    if (!popup) {
        console.error('Shortcuts editor popup not found!');
        return;
    }
    
    // Get the container for shortcuts
    const container = document.getElementById('shortcuts-list-container');
    if (!container) {
        console.error('Shortcuts list container not found!');
        return;
    }
    
    // Clear existing shortcuts
    container.innerHTML = '';
    
    // Save original shortcuts for cancel operation
    window.originalShortcuts = JSON.parse(JSON.stringify(window.currentSettings.shortcuts || []));
    
    // Add shortcuts to the editor
    if (window.currentSettings.shortcuts && window.currentSettings.shortcuts.length > 0) {
        window.currentSettings.shortcuts.forEach((shortcut, index) => {
            addShortcutToEditor(container, shortcut, index);
        });
    } else {
        // Add empty shortcut if none exist
        addShortcutToEditor(container, { title: '', url: '' }, 0);
    }
    
    // Set up save button
    const saveBtn = document.getElementById('save-shortcuts-btn');
    if (saveBtn) {
        saveBtn.onclick = function() {
            // Gather shortcuts from the editor
            const shortcuts = [];
            const rows = container.querySelectorAll('.shortcut-editor');
            
            rows.forEach(row => {
                const titleInput = row.querySelector('.shortcut-title');
                const urlInput = row.querySelector('.shortcut-url');
                
                const title = titleInput.value.trim();
                const url = urlInput.value.trim();
                
                // Skip empty entries
                if (!title || !url) return;
                
                // Ensure URL has protocol
                let validUrl = url;
                if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
                    validUrl = 'https://' + validUrl;
                }
                
                shortcuts.push({
                    title: title,
                    url: validUrl
                });
            });
            
            // Update settings and save
            window.currentSettings.shortcuts = shortcuts;
            saveShortcutsToStorage();
            initializeEditorShortcuts();
            
            // Close popup
            popup.style.display = 'none';
        };
    }
    
    // Set up cancel button
    const cancelBtn = document.getElementById('cancel-shortcuts-btn');
    if (cancelBtn) {
        cancelBtn.onclick = function() {
            // Restore original shortcuts
            window.currentSettings.shortcuts = JSON.parse(JSON.stringify(window.originalShortcuts));
            initializeEditorShortcuts();
            
            // Close popup
            popup.style.display = 'none';
        };
    }
    
    // Set up add button
    const addBtn = document.getElementById('add-shortcut-list-btn');
    if (addBtn) {
        addBtn.onclick = function() {
            const index = container.children.length;
            addShortcutToEditor(container, { title: '', url: '' }, index);
        };
    }
    
    // Show the popup
    popup.style.display = 'flex';
};

// Create the shortcuts editor popup dynamically
function createShortcutsEditorPopup() {
    const popupHTML = `
    <div id="shortcuts-editor-popup" class="popup" style="display: none;">
        <div class="popup-content">
            <h2>Edit Shortcuts</h2>
            <p>Customize the shortcuts that appear below the search bar.</p>
            
            <div id="shortcuts-list-container">
                <!-- Shortcuts will be added here -->
            </div>
            
            <div class="popup-buttons">
                <button id="add-shortcut-btn">Add Shortcut</button>
                <button class="secondary" id="cancel-shortcuts-btn">Cancel</button>
                <button class="primary" id="save-shortcuts-btn">Save Shortcuts</button>
            </div>
        </div>
    </div>
    
    <!-- Shortcut edit form popup -->
    <div id="shortcut-edit-popup" class="popup" style="display: none;">
        <div class="popup-content">
            <h2>Edit Shortcut</h2>
            
            <div class="form-group">
                <label for="shortcut-title">Shortcut Name:</label>
                <input type="text" id="shortcut-title" placeholder="e.g. Google">
            </div>
            
            <div class="form-group">
                <label for="shortcut-url">URL:</label>
                <input type="url" id="shortcut-url" placeholder="e.g. https://www.google.com">
            </div>
            
            <div class="popup-buttons">
                <button class="secondary" id="cancel-shortcut-edit-btn">Cancel</button>
                <button class="primary" id="save-shortcut-edit-btn">Save Shortcut</button>
            </div>
        </div>
    </div>
    `;
    
    // Add the popup to the document
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = popupHTML;
    document.body.appendChild(tempDiv.firstElementChild);
    document.body.appendChild(tempDiv.firstElementChild);
    
    // Add event listeners
    document.getElementById('cancel-shortcuts-btn').addEventListener('click', function() {
        document.getElementById('shortcuts-editor-popup').style.display = 'none';
    });
    
    document.getElementById('save-shortcuts-btn').addEventListener('click', function() {
        // Update the shortcuts mock display
        updateShortcutsMock();
        
        // Close the popup
        document.getElementById('shortcuts-editor-popup').style.display = 'none';
    });
    
    document.getElementById('add-shortcut-btn').addEventListener('click', function() {
        openShortcutEditor();
    });
    
    document.getElementById('cancel-shortcut-edit-btn').addEventListener('click', function() {
        document.getElementById('shortcut-edit-popup').style.display = 'none';
    });
    
    document.getElementById('save-shortcut-edit-btn').addEventListener('click', saveShortcutChanges);
}

let editingShortcutIndex = -1;

// Add function to save shortcuts to storage
function saveShortcutsToStorage() {
    console.log('Saving shortcuts to storage:', window.currentSettings.shortcuts);
    
    // Make sure shortcuts exist
    if (!window.currentSettings.shortcuts) {
        window.currentSettings.shortcuts = [];
    }
    
    try {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            if (chrome.storage.sync) {
                chrome.storage.sync.set({ settings: window.currentSettings }, function() {
                    console.log('Shortcuts saved to chrome.storage.sync');
                });
            } else {
                chrome.storage.local.set({ settings: window.currentSettings }, function() {
                    console.log('Shortcuts saved to chrome.storage.local');
                });
            }
        } else {
            // Fallback for development/testing environment
            localStorage.setItem('settings', JSON.stringify(window.currentSettings));
            console.log('Shortcuts saved to localStorage');
        }
    } catch (error) {
        console.error('Error saving shortcuts:', error);
    }
}

// Function to render the shortcuts list in the editor
function renderShortcutsList() {
    const shortcutsListContainer = document.getElementById('shortcuts-list-container');
    if (!shortcutsListContainer) return;
    
    shortcutsListContainer.innerHTML = '';
    
    if (!window.currentSettings.shortcuts || window.currentSettings.shortcuts.length === 0) {
        if (!window.currentSettings.shortcuts) {
            window.currentSettings.shortcuts = [];
        }
        
        // If no shortcuts, add an empty input
        addShortcutInput(shortcutsListContainer);
        return;
    }
    
    // Add each shortcut to the list as an editable input
    window.currentSettings.shortcuts.forEach((shortcut, index) => {
        addShortcutInput(shortcutsListContainer, shortcut, index);
    });
}

// Function to add a shortcut input row to the editor
function addShortcutInput(container, shortcut = { title: '', url: '' }, index = null) {
    const div = document.createElement('div');
    div.className = 'link-editor shortcut-editor';
    
    // Calculate current number of shortcuts in container
    const shortcutCount = container.querySelectorAll('.shortcut-editor').length;
    
    // Create index selector dropdown
    const indexSelector = document.createElement('select');
    indexSelector.className = 'link-index';
    
    // Populate index options (0 to current count)
    for (let i = 0; i <= shortcutCount; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.text = i + 1; // Display 1-based index to users
        indexSelector.appendChild(option);
    }
    
    // Set the current index if provided, otherwise use next available
    indexSelector.value = index !== null ? index : shortcutCount;
    
    // Add index selector to div
    div.appendChild(indexSelector);
    
    // Add title input
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'link-title';
    titleInput.value = shortcut.title || '';
    div.appendChild(titleInput);
    
    // Add URL input
    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.className = 'link-url';
    urlInput.value = shortcut.url || '';
    div.appendChild(urlInput);
    
    // Add preview icon
    const previewIcon = document.createElement('img');
    previewIcon.className = 'shortcut-preview-icon';
    previewIcon.src = shortcut.url ? getFavicon(shortcut.url) : '';
    previewIcon.alt = 'Favicon';
    previewIcon.style.width = '24px';
    previewIcon.style.height = '24px';
    previewIcon.style.marginRight = '8px';
    div.appendChild(previewIcon);
    
    // Update icon when URL changes
    urlInput.addEventListener('blur', () => {
        if (urlInput.value) {
            previewIcon.src = getFavicon(urlInput.value);
        }
    });
    
    // Add remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-link-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => div.remove());
    div.appendChild(removeBtn);
    
    // Add index change listener
    indexSelector.addEventListener('change', (e) => reorderShortcutInput(div, parseInt(e.target.value)));
    
    // Insert at specified index or append
    if (index !== null && index < container.children.length) {
        container.insertBefore(div, container.children[index]);
    } else {
        container.appendChild(div);
    }
    
    // Update all index selectors
    updateShortcutIndexes(container);
}

// Function to reorder shortcut inputs
function reorderShortcutInput(shortcutElement, newIndex) {
    const container = shortcutElement.parentElement;
    const currentIndex = Array.from(container.children).indexOf(shortcutElement);
    
    // No change needed if already at target index
    if (currentIndex === newIndex) return;
    
    // Remove from current position
    container.removeChild(shortcutElement);
    
    // Insert at new position
    if (newIndex >= container.children.length) {
        container.appendChild(shortcutElement);
    } else {
        container.insertBefore(shortcutElement, container.children[newIndex]);
    }
    
    // Update all index selectors
    updateShortcutIndexes(container);
}

// Update all index selectors in a container
function updateShortcutIndexes(container) {
    const inputs = container.querySelectorAll('.shortcut-editor');
    
    // First update the number of options in each selector
    inputs.forEach((input, i) => {
        const selector = input.querySelector('.link-index');
        const currentValue = parseInt(selector.value);
        
        // Clear existing options
        selector.innerHTML = '';
        
        // Populate with new options
        for (let j = 0; j < inputs.length; j++) {
            const option = document.createElement('option');
            option.value = j;
            option.text = j + 1; // Display 1-based index to users
            selector.appendChild(option);
        }
        
        // Try to maintain the current value if possible
        if (currentValue < inputs.length) {
            selector.value = currentValue;
        } else {
            selector.value = i;
        }
    });
}

// Function to gather all shortcuts from the editor
function gatherShortcutsFromEditor() {
    const container = document.getElementById('shortcuts-list-container');
    if (!container) return [];
    
    const shortcutInputs = container.querySelectorAll('.shortcut-editor');
    if (!shortcutInputs.length) return [];
    
    const shortcuts = [];
    
    // Create an array with placeholders
    const tempShortcuts = new Array(shortcutInputs.length).fill(null);
    
    // First pass: put each shortcut in its correct position based on index
    shortcutInputs.forEach((input) => {
        const indexSelector = input.querySelector('.link-index');
        const titleInput = input.querySelector('.link-title');
        const urlInput = input.querySelector('.link-url');
        
        const index = parseInt(indexSelector.value);
        const title = titleInput.value.trim();
        const url = urlInput.value.trim();
        
        // Skip empty shortcuts
        if (!title && !url) return;
        
        // Ensure URL has protocol
        let validUrl = url;
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
            validUrl = 'https://' + url;
        }
        
        tempShortcuts[index] = {
            title: title,
            url: validUrl
        };
    });
    
    // Second pass: remove null entries (gaps in the array)
    tempShortcuts.forEach(shortcut => {
        if (shortcut) shortcuts.push(shortcut);
    });
    
    return shortcuts;
}

// Add a shortcut to the editor
function addShortcutToEditor(container, shortcut, index) {
    // Create the shortcut row
    const row = document.createElement('div');
    row.className = 'shortcut-editor';
    
    // Create the order selector
    const orderSelector = document.createElement('div');
    orderSelector.className = 'shortcut-order';
    
    // Up button - disable for first item
    const upBtn = document.createElement('button');
    upBtn.className = 'order-btn up-btn';
    upBtn.textContent = '↑';
    upBtn.title = 'Move up';
    upBtn.disabled = index === 0;
    upBtn.style.opacity = index === 0 ? '0.5' : '1';
    upBtn.addEventListener('click', () => moveShortcutInEditor(row, -1));
    orderSelector.appendChild(upBtn);
    
    // Down button - will be disabled for last item in updateOrderButtons
    const downBtn = document.createElement('button');
    downBtn.className = 'order-btn down-btn';
    downBtn.textContent = '↓';
    downBtn.title = 'Move down';
    downBtn.addEventListener('click', () => moveShortcutInEditor(row, 1));
    orderSelector.appendChild(downBtn);
    
    row.appendChild(orderSelector);
    
    // Title input
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'shortcut-title';
    titleInput.value = shortcut.title || '';
    titleInput.setAttribute('required', 'required');
    row.appendChild(titleInput);
    
    // URL input
    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.className = 'shortcut-url';
    urlInput.value = shortcut.url || '';
    urlInput.setAttribute('required', 'required');
    urlInput.addEventListener('blur', () => {
        if (urlInput.value) {
            previewIcon.src = getFavicon(urlInput.value);
        }
    });
    row.appendChild(urlInput);
    
    // Preview icon
    const previewIcon = document.createElement('img');
    previewIcon.className = 'shortcut-preview';
    previewIcon.src = shortcut.url ? getFavicon(shortcut.url) : '';
    previewIcon.alt = 'Preview';
    previewIcon.style.width = '24px';
    previewIcon.style.height = '24px';
    row.appendChild(previewIcon);
    
    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-shortcut-btn';
    removeBtn.textContent = '✕';
    removeBtn.title = 'Remove shortcut';
    removeBtn.addEventListener('click', () => {
        row.remove();
        updateOrderButtons(container);
    });
    row.appendChild(removeBtn);
    
    // Add to container at specified index or at the end
    if (index < container.children.length) {
        container.insertBefore(row, container.children[index]);
    } else {
        container.appendChild(row);
    }
    
    // Update all order buttons
    updateOrderButtons(container);
}

// Move a shortcut up or down in the editor
function moveShortcutInEditor(row, direction) {
    const container = row.parentElement;
    const rows = Array.from(container.children);
    const currentIndex = rows.indexOf(row);
    const newIndex = currentIndex + direction;
    
    // Check bounds
    if (newIndex < 0 || newIndex >= rows.length) return;
    
    // Remove from current position
    container.removeChild(row);
    
    // Insert at new position
    if (newIndex >= rows.length - 1) {
        container.appendChild(row);
    } else {
        container.insertBefore(row, rows[newIndex]);
    }
    
    // Update button states
    updateOrderButtons(container);
}

// Update the enabled/disabled state of order buttons
function updateOrderButtons(container) {
    const rows = Array.from(container.children);
    
    rows.forEach((row, index) => {
        const upBtn = row.querySelector('.up-btn');
        const downBtn = row.querySelector('.down-btn');
        
        if (upBtn) {
            upBtn.disabled = index === 0;
            upBtn.style.opacity = index === 0 ? '0.5' : '1';
        }
        
        if (downBtn) {
            downBtn.disabled = index === rows.length - 1;
            downBtn.style.opacity = index === rows.length - 1 ? '0.5' : '1';
        }
    });
}

// Save shortcuts from the editor
function saveShortcutsFromEditor() {
    const container = document.getElementById('shortcuts-list-container');
    if (!container) return;
    
    const rows = container.querySelectorAll('.shortcut-editor');
    const shortcuts = [];
    
    // Gather shortcuts from the UI
    rows.forEach(row => {
        const titleInput = row.querySelector('.shortcut-title');
        const urlInput = row.querySelector('.shortcut-url');
        
        const title = titleInput.value.trim();
        const url = urlInput.value.trim();
        
        // Skip empty entries
        if (!title || !url) return;
        
        // Ensure URL has protocol
        let validUrl = url;
        if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
            validUrl = 'https://' + validUrl;
        }
        
        shortcuts.push({
            title: title,
            url: validUrl
        });
    });
    
    // Update settings
    window.currentSettings.shortcuts = shortcuts;
    
    // Update visual display
    initializeEditorShortcuts();
    
    // Save to storage
    saveShortcutsToStorage();
}

// Function to update the shortcuts display
function updateShortcutsMock() {
    // Update the actual shortcuts container in the editor
    initializeEditorShortcuts();
    
    // Also update the legacy mock if it exists
    const shortcutsMock = document.getElementById('shortcuts-editor-mock');
    if (shortcutsMock) {
        // Clear existing shortcuts
        const shortcutsContent = shortcutsMock.querySelector('.shortcuts-content');
        if (shortcutsContent) {
            shortcutsContent.innerHTML = '';
            
            // Get the current shortcuts
            const shortcuts = window.currentSettings.shortcuts || [];
            
            // Add each shortcut
            shortcuts.forEach((shortcut, index) => {
                const shortcutDiv = document.createElement('div');
                shortcutDiv.className = 'shortcut-mock';
                shortcutDiv.innerHTML = `
                    <img src="${getFavicon(shortcut.url)}" alt="${shortcut.title}">
                    <div class="shortcut-mock-title">${shortcut.title}</div>
                `;
                
                // Add click event to edit the shortcut
                shortcutDiv.addEventListener('click', function() {
                    openShortcutEditor(index);
                });
                
                shortcutsContent.appendChild(shortcutDiv);
            });
            
            // Update width to fit content
            const shortcutCount = shortcuts.length;
            if (shortcutCount > 0) {
                // Calculate approximate width based on number of shortcuts
                // Each shortcut is approximately 90px wide (70px width + 20px gap)
                const estimatedWidth = Math.min(Math.max(shortcutCount * 90 + 40, 300), 800); // Add 40px for padding
                shortcutsMock.style.width = `${estimatedWidth}px`;
            } else {
                shortcutsMock.style.width = 'auto';
            }
        }
    }
    
    // Save the changes to storage to ensure they're available on reload
    saveShortcutsToStorage();
}

// This function is replaced by gatherShortcutsFromEditor

// Initialize editor fixes
document.addEventListener('DOMContentLoaded', function() {
    console.log('Editor utils initialized');
    console.log('getFavicon function is available:', typeof window.getFavicon === 'function');
    
    // Make sure the Edit Shortcuts button is configured to open the shortcuts editor
    document.querySelectorAll('#edit-shortcuts-btn, .edit-shortcuts-btn').forEach(btn => {
        if (btn) {
            console.log('Found Edit Shortcuts button, adding direct click handler');
            // Remove any existing listeners to avoid duplicates
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Add direct onclick attribute
            newBtn.setAttribute('onclick', 'openShortcutsEditor()');
            
            // Also add event listener as fallback
            newBtn.addEventListener('click', function() {
                console.log('Edit Shortcuts button clicked');
                openShortcutsEditor();
            });
        }
    });
    
    // Add in-page CSS fixes
    const style = document.createElement('style');
    style.textContent = `
    /* Size fix for link-grid */
    .link-grid {
        height: 70px !important; /* Match with newtab page */
    }
    
    /* Ensure grid alignment is consistent */
    .grid {
        align-items: center !important;
    }
    
    /* Make sure editor elements use translations properly */
    .editor-group {
        transform: translate(-50%, -50%) !important;
    }
    
    /* Shortcuts editor styling */
    #shortcuts-editor-popup .popup-content {
        max-width: 700px;
    }
    
    #shortcuts-list-container {
        max-height: 400px;
        overflow-y: auto;
        margin-bottom: 20px;
        margin-top: 20px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        padding: 10px;
    }
    
    .shortcut-editor {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
        padding: 10px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        background-color: var(--all-background-color);
    }
    
    .shortcut-order {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    
    .order-btn {
        width: 24px;
        height: 24px;
        padding: 0;
        border: none;
        background-color: var(--primary-color);
        color: white;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .order-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .shortcut-title,
    .shortcut-url {
        flex: 1;
        padding: 8px;
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: 4px;
    }
    
    .shortcut-preview {
        width: 24px;
        height: 24px;
        object-fit: contain;
    }
    
    .remove-shortcut-btn {
        width: 28px;
        height: 28px;
        background-color: #f44336;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    /* Make sure the mock search bar and shortcuts are visible in editor */
    #search-editor-mock, #shortcuts-editor-mock {
        background-color: var(--group-background-color);
        border-radius: 8px;
        padding: 10px;
        margin: 10px 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    #shortcuts-editor-mock {
        display: flex;
        gap: 10px;
        padding: 12px;
    }
    
    .shortcut-mock {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 60px;
        text-align: center;
    }
    
    .shortcut-mock img {
        width: 32px;
        height: 32px;
        margin-bottom: 5px;
    }
    
    .shortcut-mock-title {
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
    }
    `;
    document.head.appendChild(style);
    
    // Initialize shortcuts in the editor
    initializeEditorShortcuts();
    
    // Make shortcuts container draggable
    const shortcutsContainer = document.getElementById('shortcuts-container');
    if (shortcutsContainer && typeof window.initDraggableElement === 'function') {
        window.initDraggableElement(shortcutsContainer, 'shortcutsPosition');
    }
    
    // Remove any old shortcuts mock to avoid duplicates
    const oldShortcutsMock = document.getElementById('shortcuts-editor-mock');
    if (oldShortcutsMock) {
        oldShortcutsMock.style.display = 'none';
    }
});