// Default settings
const defaultSettings = {
    theme: 'light',
    useCustomBackground: false,
    backgroundURL: '',
    backgroundImage: null, // Base64 encoded image
    showSearch: true,
    showShortcuts: true,
    searchEngine: 'google',
    searchBarPosition: { x: 10, y: 120 },
    fontSize: 16,
    groupScale: 100, // Global scaling factor
    useGlassBackground: true, // Default to true for glass background effect
    customThemes: [],
    shortcuts: [
        {
            title: 'Google',
            url: 'https://www.google.com'
        },
        {
            title: 'Youtube',
            url: 'https://www.youtube.com'
        },
        {
            title: 'Gmail',
            url: 'https://mail.google.com'
        },
        {
            title: 'Drive',
            url: 'https://drive.google.com'
        },
        {
            title: 'Maps',
            url: 'https://maps.google.com'
        }
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
let currentSettings = {};

// Elements
const customBgInput = document.getElementById('custom-bg');
const bgFileInput = document.getElementById('bg-file');
const bgFileButton = document.getElementById('bg-file-button');
const fileNameDisplay = document.getElementById('file-name');
const bgPreviewImg = document.getElementById('bg-preview-img');
const useCustomBgToggle = document.getElementById('use-custom-bg');
const bgInputContainer = document.getElementById('bg-input-container');
const showSearchToggle = document.getElementById('show-search');
// Handle missing showShortcutsToggle element
const showShortcutsToggle = document.getElementById('show-shortcuts') || { checked: true };
const searchEngineSelect = document.getElementById('search-engine');
const saveButton = document.getElementById('save-settings');
const resetButton = document.getElementById('reset-settings');
const resetNewtabButton = document.getElementById('reset-newtab');
const themeGrid = document.getElementById('theme-grid');
const glassBackgroundToggle = document.getElementById('glass-background');

// Accessibility elements
const fontSizeSlider = document.getElementById('font-size');
const fontSizeValue = document.getElementById('font-size-value');
const groupScaleSlider = document.getElementById('group-scale');
const groupScaleValue = document.getElementById('group-scale-value');

// Custom theme elements
const customThemeName = document.getElementById('custom-theme-name');
const customPrimary = document.getElementById('custom-primary');
const customSecondary = document.getElementById('custom-secondary');
const customAccent = document.getElementById('custom-accent');
const customText = document.getElementById('custom-text');
const customBackground = document.getElementById('custom-background');
const saveCustomThemeBtn = document.getElementById('save-custom-theme');

// Base themes
const baseThemes = [
    { id: 'light', name: 'Light Minimal' },
    { id: 'dark', name: 'Modern Dark' },
    { id: 'forest', name: 'Forest' },
    { id: 'ocean', name: 'Ocean' },
    { id: 'sunset', name: 'Sunset' },
    { id: 'cyber', name: 'Cyberpunk' },
    { id: 'midnight', name: 'Midnight Blue' },
    { id: 'emerald', name: 'Emerald Dark' },
    { id: 'slate', name: 'Slate Blue' },
    { id: 'deep', name: 'Deep Purple' },
    { id: 'nord', name: 'Nord' },
    { id: 'rose', name: 'Rose Gold' },
    { id: 'neon', name: 'Neon Night' },
    { id: 'autumn', name: 'Autumn' },
    { id: 'pastel', name: 'Pastel' },
    { id: 'mono', name: 'Monochrome' },
    { id: 'custom', name: 'Custom Theme' }
];

// Load settings on page load
document.addEventListener('DOMContentLoaded', loadSettings);

// Event listeners
saveButton.addEventListener('click', saveSettings);
resetButton.addEventListener('click', resetSettings);
resetNewtabButton.addEventListener('click', resetNewTab);

// Background image handling
useCustomBgToggle.addEventListener('change', toggleBackgroundInputs);
bgFileButton.addEventListener('click', () => bgFileInput.click());
bgFileInput.addEventListener('change', handleFileUpload);
customBgInput.addEventListener('input', updateBackgroundPreview);

// Accessibility sliders
fontSizeSlider.addEventListener('input', updateFontSizeDisplay);
groupScaleSlider.addEventListener('input', updateGroupScaleDisplay);

// Custom theme
saveCustomThemeBtn.addEventListener('click', saveCustomTheme);

// Initialize color pickers with default values
customPrimary.value = '#457b9d';
customSecondary.value = '#a8dadc';
customAccent.value = '#e63946';
customText.value = '#1d3557';
customBackground.value = '#f1faee';

// Handle file upload
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Update the file name display
    fileNameDisplay.textContent = file.name;
    
    // Read the file as data URL
    const reader = new FileReader();
    reader.onload = function(event) {
        const base64Image = event.target.result;
        
        // Update preview
        bgPreviewImg.src = base64Image;
        bgPreviewImg.style.display = 'block';
        
        // Store the image in settings
        currentSettings.backgroundImage = base64Image;
        
        // Clear the URL input since we're using a file
        customBgInput.value = '';
    };
    
    reader.readAsDataURL(file);
}

// Update background preview from URL
function updateBackgroundPreview() {
    const url = customBgInput.value.trim();
    if (url) {
        // Update preview
        bgPreviewImg.src = url;
        bgPreviewImg.style.display = 'block';
        
        // Store the URL in settings
        currentSettings.backgroundURL = url;
        // Clear any stored image data
        currentSettings.backgroundImage = null;
    }
}

// Toggle background inputs visibility
function toggleBackgroundInputs() {
    const isChecked = useCustomBgToggle.checked;
    bgInputContainer.style.display = isChecked ? 'block' : 'none';
    
    // Update settings
    currentSettings.useCustomBackground = isChecked;
}

// Function to load settings
async function loadSettings() {
    try {
        // Try to load from Chrome storage or use localStorage as fallback
        if (typeof chrome !== 'undefined' && chrome.storage) {
            // Load main settings from sync storage
            const syncResult = await chrome.storage.sync.get(['settings']);
            currentSettings = syncResult.settings || {...defaultSettings};
            
            // Load background image from local storage if available
            try {
                const localResult = await chrome.storage.local.get(['backgroundImage']);
                if (localResult.backgroundImage) {
                    currentSettings.backgroundImage = localResult.backgroundImage;
                    console.log('Background image loaded from Chrome local storage');
                }
            } catch (localError) {
                console.warn('Error loading background image from local storage:', localError);
            }
        } else {
            // Load settings from localStorage
            const savedSettings = localStorage.getItem('settings');
            currentSettings = savedSettings ? JSON.parse(savedSettings) : {...defaultSettings};
            
            // Load background image separately
            try {
                const backgroundImage = localStorage.getItem('backgroundImage');
                if (backgroundImage) {
                    currentSettings.backgroundImage = backgroundImage;
                }
            } catch (localError) {
                console.warn('Error loading background image from localStorage:', localError);
            }
        }
        
        // Initialize custom themes if not present
        if (!currentSettings.customThemes) {
            currentSettings.customThemes = [];
        }
        
        // Apply settings to form elements
        useCustomBgToggle.checked = currentSettings.useCustomBackground === true;
        customBgInput.value = currentSettings.backgroundURL || '';
        showSearchToggle.checked = currentSettings.showSearch !== false;
        
        // Only set checked property if the element exists
        if (showShortcutsToggle && 'checked' in showShortcutsToggle) {
            showShortcutsToggle.checked = currentSettings.showShortcuts !== false;
        }
        
        // Set glass background toggle
        glassBackgroundToggle.checked = currentSettings.useGlassBackground !== false;
        
        searchEngineSelect.value = currentSettings.searchEngine || 'google';
        
        // Set up background preview
        if (currentSettings.backgroundImage) {
            bgPreviewImg.src = currentSettings.backgroundImage;
            bgPreviewImg.style.display = 'block';
        } else if (currentSettings.backgroundURL) {
            bgPreviewImg.src = currentSettings.backgroundURL;
            bgPreviewImg.style.display = 'block';
        } else {
            bgPreviewImg.style.display = 'none';
        }
        
        // Show/hide background inputs based on toggle
        toggleBackgroundInputs();
        
        // Apply accessibility settings
        fontSizeSlider.value = currentSettings.fontSize || 16;
        updateFontSizeDisplay();
        
        groupScaleSlider.value = currentSettings.groupScale || 100;
        updateGroupScaleDisplay();
        
        
        // Generate theme grid
        generateThemeGrid();
        
        // Apply theme
        applyThemeToPage(currentSettings.theme || 'light');
        
        console.log('Settings loaded:', currentSettings);
    } catch (error) {
        console.error('Error loading settings:', error);
        currentSettings = {...defaultSettings};
        generateThemeGrid();
    }
}

// Function to save settings
async function saveSettings() {
    try {
        // Get the active theme from the grid
        const activeThemeCard = document.querySelector('.theme-card.active');
        const themeId = activeThemeCard ? activeThemeCard.dataset.themeId : 'light';
        
        // Make a deep copy of currentSettings to avoid reference issues
        const settingsCopy = JSON.parse(JSON.stringify(currentSettings));
        
        // Update current settings from form values
        const updatedSettings = {
            ...settingsCopy, // Preserve custom themes and other settings
            theme: themeId,
            useCustomBackground: useCustomBgToggle.checked,
            backgroundURL: customBgInput.value,
            // Make sure backgroundImage is properly carried over or set to null
            backgroundImage: currentSettings.backgroundImage || null,
            showSearch: showSearchToggle.checked,
            // Handle potentially missing element by preserving existing value or defaulting to true
            showShortcuts: showShortcutsToggle && 'checked' in showShortcutsToggle ? 
                showShortcutsToggle.checked : (currentSettings.showShortcuts !== false),
            searchEngine: searchEngineSelect.value,
            searchBarPosition: settingsCopy.searchBarPosition || { x: 10, y: 120 },
            fontSize: parseInt(fontSizeSlider.value) || 16,
            groupScale: parseInt(groupScaleSlider.value) || 100,
            useGlassBackground: glassBackgroundToggle.checked
        };
        
        // Ensure critical properties exist
        if (!updatedSettings.customThemes) {
            updatedSettings.customThemes = [];
        }
        
        if (!updatedSettings.headerLinks) {
            updatedSettings.headerLinks = defaultSettings.headerLinks;
        }
        
        if (!updatedSettings.apps) {
            updatedSettings.apps = defaultSettings.apps;
        }
        
        // Update the current settings
        currentSettings = updatedSettings;
        
        // Extract backgroundImage for separate storage to avoid exceeding quota limits
        const backgroundImage = currentSettings.backgroundImage;
        const settingsWithoutImage = { ...currentSettings, backgroundImage: null };
        
        // Save to Chrome storage or localStorage as fallback
        if (typeof chrome !== 'undefined' && chrome.storage) {
            try {
                // Save main settings to sync storage without the image
                await chrome.storage.sync.set({ settings: settingsWithoutImage });
                console.log('Settings saved to Chrome sync storage');
                
                // If we have a background image, save it separately to local storage
                if (backgroundImage) {
                    await chrome.storage.local.set({ backgroundImage: backgroundImage });
                    console.log('Background image saved to Chrome local storage');
                } else {
                    // Clear any existing background image if none is set
                    await chrome.storage.local.remove('backgroundImage');
                }
            } catch (chromeError) {
                console.error('Error saving to Chrome storage:', chromeError);
                // Try localStorage as fallback
                localStorage.setItem('settings', JSON.stringify(settingsWithoutImage));
                if (backgroundImage) {
                    localStorage.setItem('backgroundImage', backgroundImage);
                } else {
                    localStorage.removeItem('backgroundImage');
                }
                console.log('Settings saved to localStorage (fallback)');
            }
        } else {
            localStorage.setItem('settings', JSON.stringify(settingsWithoutImage));
            if (backgroundImage) {
                localStorage.setItem('backgroundImage', backgroundImage);
            } else {
                localStorage.removeItem('backgroundImage');
            }
            console.log('Settings saved to localStorage');
        }
        
        // Show success message
        saveButton.textContent = 'Saved!';
        setTimeout(() => {
            saveButton.textContent = 'Save Settings';
        }, 2000);
        window.location.reload();
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Your image file is too large. Try decreasing the resolution and try again.');
        saveButton.textContent = 'Save Settings';
    }
}

// Function to reset settings to defaults
function resetSettings() {
    // Reset form to default values
    currentSettings = {...defaultSettings};
    
    useCustomBgToggle.checked = defaultSettings.useCustomBackground;
    customBgInput.value = defaultSettings.backgroundURL;
    currentSettings.backgroundImage = null; // Explicitly clear background image
    bgPreviewImg.style.display = 'none';
    bgPreviewImg.src = '';
    fileNameDisplay.textContent = 'No file chosen';
    toggleBackgroundInputs();
    
    showSearchToggle.checked = defaultSettings.showSearch;
    
    // Only set if element exists
    if (showShortcutsToggle && 'checked' in showShortcutsToggle) {
        showShortcutsToggle.checked = defaultSettings.showShortcuts;
    }
    
    // Reset glass background toggle
    glassBackgroundToggle.checked = defaultSettings.useGlassBackground;
    
    searchEngineSelect.value = defaultSettings.searchEngine;
    
    // Reset accessibility settings
    fontSizeSlider.value = defaultSettings.fontSize;
    updateFontSizeDisplay();
    
    groupScaleSlider.value = defaultSettings.groupScale;
    updateGroupScaleDisplay();
    
    // Empty custom themes
    currentSettings.customThemes = [];
    
    // Regenerate theme grid and select default theme
    generateThemeGrid();
    
    // Apply default theme
    applyThemeToPage(defaultSettings.theme);
    
    // Don't save to storage until user clicks "Save Settings"
    console.log('Settings reset to defaults (not saved yet)');
}

// Function to reset the new tab page
async function resetNewTab() {
    if (!confirm('This will remove all your link groups and reset the new tab page layout. Are you sure?')) {
        return;
    }
    
    try {
        // Reset groups to default layout
        const defaultGroups = [
            {
                type: 'grid',
                title: '',
                links: [
                    { title: 'Google', url: 'https://www.google.com' },
                    { title: 'YouTube', url: 'https://www.youtube.com' },
                    { title: 'Maps', url: 'https://maps.google.com' },
                    { title: 'Gmail', url: 'https://mail.google.com' },
                    { title: 'Drive', url: 'https://drive.google.com' }
                ],
                x: '50%',
                y: 200,
                rows: 1,
                columns: 5
            }
        ];
        
        // Reset search bar to center
        currentSettings.searchBarPosition = { x: '50%', y: 120 };
        
        // Save changes
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            await chrome.storage.sync.set({ 
                groups: defaultGroups,
                settings: currentSettings 
            });
        } else {
            localStorage.setItem('groups', JSON.stringify(defaultGroups));
            localStorage.setItem('settings', JSON.stringify(currentSettings));
        }
        
        // Show success message
        resetNewtabButton.textContent = 'Reset Complete!';
        setTimeout(() => {
            resetNewtabButton.textContent = 'Reset New Tab Page';
        }, 2000);
        
    } catch (error) {
        console.error('Error resetting new tab page:', error);
        alert('Error resetting new tab page. Please try again.');
    }
}

// Generate the theme grid with selectable theme cards
function generateThemeGrid() {
    themeGrid.innerHTML = '';
    
    // Combine base themes with custom themes
    const allThemes = [
        ...baseThemes,
        ...(currentSettings.customThemes || [])
    ];
    
    // Hide custom theme section initially
    document.querySelector('.custom-theme-section').style.display = 'none';

    // Create theme cards
    allThemes.forEach(theme => {
        const card = document.createElement('div');
        card.className = 'theme-card';
        card.dataset.themeId = theme.id;
        
        // Mark active theme
        if (theme.id === currentSettings.theme) {
            card.classList.add('active');
            // Show custom theme section if custom theme is active
            if (theme.id === 'custom' || theme.id.startsWith('custom-')) {
                document.querySelector('.custom-theme-section').style.display = 'block';
            }
        }
        
        // Create pie chart for theme colors
        const pie = document.createElement('div');
        pie.className = 'theme-pie';
        
        // Add color slices to the pie
        const colorTypes = ['primary', 'secondary', 'accent', 'text', 'background'];
        colorTypes.forEach((type, index) => {
            const slice = document.createElement('div');
            slice.className = 'pie-slice';
            
            // Calculate rotation for even distribution
            const rotation = (index * 72) % 360; // 360 / 5 = 72 degrees per slice
            slice.style.transform = `rotate(${rotation}deg)`;
            
            // Set color based on theme
            if (theme.id.startsWith('custom-')) {
                // For custom themes, use the stored colors
                slice.style.backgroundColor = theme[type];
            } else if (theme.id === 'custom') {
                // For base custom theme, use current color picker values
                const customColors = {
                    primary: customPrimary.value,
                    secondary: customSecondary.value,
                    accent: customAccent.value,
                    text: customText.value,
                    background: customBackground.value
                };
                slice.style.backgroundColor = customColors[type];
            } else {
                // For base themes, use CSS variables
                slice.style.backgroundColor = `var(--${theme.id}-${type})`;
            }
            
            pie.appendChild(slice);
        });
        
        // Add theme name
        const name = document.createElement('div');
        name.className = 'theme-name';
        name.textContent = theme.name;
        
        // Add click handler to select theme
        card.addEventListener('click', () => {
            // Remove active class from all cards
            document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
            // Add active class to this card
            card.classList.add('active');
            
            // Show/hide custom theme section
            if (theme.id === 'custom' || theme.id.startsWith('custom-')) {
                document.querySelector('.custom-theme-section').style.display = 'block';
            } else {
                document.querySelector('.custom-theme-section').style.display = 'none';
            }
            
            // Apply the theme
            applyThemeToPage(theme.id);
        });
        
        card.appendChild(pie);
        card.appendChild(name);
        themeGrid.appendChild(card);
    });
}

// Save custom theme
function saveCustomTheme() {
    const name = customThemeName.value.trim() || 'Custom Theme';
    
    // Generate a unique ID for the custom theme
    const id = 'custom-' + Date.now();
    
    // Create custom theme object
    const customTheme = {
        id,
        name,
        primary: customPrimary.value,
        secondary: customSecondary.value,
        accent: customAccent.value,
        text: customText.value,
        background: customBackground.value
    };
    
    // Add to custom themes
    if (!currentSettings.customThemes) {
        currentSettings.customThemes = [];
    }
    
    currentSettings.customThemes.push(customTheme);
    
    // Regenerate theme grid
    generateThemeGrid();
    
    // Reset the form
    customThemeName.value = '';
    
    // Show success message
    saveCustomThemeBtn.textContent = 'Theme Added!';
    setTimeout(() => {
        saveCustomThemeBtn.textContent = 'Save Custom Theme';
    }, 2000);
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

// Apply theme to the settings page
function applyThemeToPage(themeId) {
    // Check if it's a custom theme
    const isCustomTheme = themeId.startsWith('custom-');
    let themeColors = {};
    
    if (isCustomTheme) {
        // Find the custom theme in settings
        const customTheme = currentSettings.customThemes.find(t => t.id === themeId);
        if (customTheme) {
            themeColors = {
                primary: customTheme.primary,
                secondary: customTheme.secondary,
                accent: customTheme.accent,
                text: customTheme.text,
                background: customTheme.background
            };
        }
    }
    
    // Set CSS variables based on theme
    if (isCustomTheme) {
        // Directly set color values for custom themes
        document.documentElement.style.setProperty('--primary-color', themeColors.primary);
        document.documentElement.style.setProperty('--secondary-color', themeColors.secondary);
        document.documentElement.style.setProperty('--accent-color', themeColors.accent);
        document.documentElement.style.setProperty('--text-color', themeColors.text);
        document.documentElement.style.setProperty('--background-color', themeColors.background);
        
        // Set contrast text color - white for dark themes, black for light themes
        const isDarkBackground = isColorDark(themeColors.primary);
        document.documentElement.style.setProperty('--contrast-text-color', isDarkBackground ? '#ffffff' : '#000000');
    } else {
        // Use CSS variables for base themes
        document.documentElement.style.setProperty('--primary-color', `var(--${themeId}-primary)`);
        document.documentElement.style.setProperty('--secondary-color', `var(--${themeId}-secondary)`);
        document.documentElement.style.setProperty('--accent-color', `var(--${themeId}-accent)`);
        document.documentElement.style.setProperty('--text-color', `var(--${themeId}-text)`);
        document.documentElement.style.setProperty('--background-color', `var(--${themeId}-background)`);
        
        // Set contrast text color appropriately based on theme
        let isDarkTheme = false;
        if (themeId === 'dark' || themeId === 'midnight' || themeId === 'emerald' || 
            themeId === 'slate' || themeId === 'deep' || themeId === 'nord' || themeId === 'cyber') {
            isDarkTheme = true;
        }
        document.documentElement.style.setProperty('--contrast-text-color', isDarkTheme ? '#ffffff' : '#000000');
    }
    
    // Set body background color while preserving inline style attribute
    document.body.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--background-color');
    
    // Apply custom background if enabled
    if (currentSettings.useCustomBackground) {
        // Prefer stored image over URL
        if (currentSettings.backgroundImage) {
            // Set both the CSS variable and inline style
            document.documentElement.style.setProperty('--background-image', `url("${currentSettings.backgroundImage}")`);
            document.body.style.backgroundImage = `url("${currentSettings.backgroundImage}")`;
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.classList.add('bg-loaded');
        } else if (currentSettings.backgroundURL) {
            document.documentElement.style.setProperty('--background-image', `url("${currentSettings.backgroundURL}")`);
            document.body.style.backgroundImage = `url("${currentSettings.backgroundURL}")`;
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.classList.add('bg-loaded');
        } else {
            document.documentElement.style.setProperty('--background-image', 'none');
            document.body.style.backgroundImage = '';
        }
    } else {
        document.documentElement.style.setProperty('--background-image', 'none');
        document.body.style.backgroundImage = '';
    }
    
    // Add theme class to body for additional CSS rules
    document.body.className = '';
    document.body.classList.add(`theme-${themeId.split('-')[0]}`);
}

// Update font size display
function updateFontSizeDisplay() {
    const value = fontSizeSlider.value;
    fontSizeValue.textContent = `${value}px`;
    // Apply change to the page for preview - now relative to base
    document.documentElement.style.setProperty('--base-font-size', `${value}px`);
    // Apply scaling to all text elements
    document.documentElement.style.setProperty('--text-scale', value / 16);
    document.documentElement.style.fontSize = `${value}px`;
}

// Update global scale display
function updateGroupScaleDisplay() {
    const value = groupScaleSlider.value;
    groupScaleValue.textContent = `${value}%`;
    
    // Apply change to all scalable elements
    document.documentElement.style.setProperty('--group-scale', value / 100);
    document.documentElement.style.setProperty('--element-scale', value / 100);
    
    // Apply scale to the entire interface for preview
    document.documentElement.style.transform = `scale(${value / 100})`;
    document.documentElement.style.transformOrigin = 'center top';
    
    // Adjust some spacing to account for scaling
    document.documentElement.style.setProperty('--spacing-multiplier', value / 100);
}

