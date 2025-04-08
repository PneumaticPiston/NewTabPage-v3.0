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
    groupScale: 100,
    spacingScale: 100,
    highContrast: false,
    customThemes: []
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
const showShortcutsToggle = document.getElementById('show-shortcuts');
const searchEngineSelect = document.getElementById('search-engine');
const saveButton = document.getElementById('save-settings');
const resetButton = document.getElementById('reset-settings');
const resetNewtabButton = document.getElementById('reset-newtab');
const themeGrid = document.getElementById('theme-grid');

// Accessibility elements
const fontSizeSlider = document.getElementById('font-size');
const fontSizeValue = document.getElementById('font-size-value');
const groupScaleSlider = document.getElementById('group-scale');
const groupScaleValue = document.getElementById('group-scale-value');
const spacingScaleSlider = document.getElementById('spacing-scale');
const spacingScaleValue = document.getElementById('spacing-scale-value');
const highContrastToggle = document.getElementById('high-contrast');

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
spacingScaleSlider.addEventListener('input', updateSpacingScaleDisplay);

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
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            const result = await chrome.storage.sync.get(['settings']);
            currentSettings = result.settings || {...defaultSettings};
        } else {
            const savedSettings = localStorage.getItem('settings');
            currentSettings = savedSettings ? JSON.parse(savedSettings) : {...defaultSettings};
        }
        
        // Initialize custom themes if not present
        if (!currentSettings.customThemes) {
            currentSettings.customThemes = [];
        }
        
        // Apply settings to form elements
        useCustomBgToggle.checked = currentSettings.useCustomBackground === true;
        customBgInput.value = currentSettings.backgroundURL || '';
        showSearchToggle.checked = currentSettings.showSearch !== false;
        showShortcutsToggle.checked = currentSettings.showShortcuts !== false;
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
        
        spacingScaleSlider.value = currentSettings.spacingScale || 100;
        updateSpacingScaleDisplay();
        
        highContrastToggle.checked = currentSettings.highContrast === true;
        
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
        
        // Update current settings from form values
        currentSettings = {
            ...currentSettings, // Preserve custom themes
            theme: themeId,
            useCustomBackground: useCustomBgToggle.checked,
            backgroundURL: customBgInput.value,
            // backgroundImage is already set in the handleFileUpload function
            showSearch: showSearchToggle.checked,
            showShortcuts: showShortcutsToggle.checked,
            searchEngine: searchEngineSelect.value,
            searchBarPosition: currentSettings.searchBarPosition || { x: 10, y: 120 },
            fontSize: parseInt(fontSizeSlider.value),
            groupScale: parseInt(groupScaleSlider.value),
            spacingScale: parseInt(spacingScaleSlider.value),
            highContrast: highContrastToggle.checked
        };
        
        // Save to Chrome storage or localStorage as fallback
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            await chrome.storage.sync.set({ settings: currentSettings });
        } else {
            localStorage.setItem('settings', JSON.stringify(currentSettings));
        }
        
        // Show success message
        saveButton.textContent = 'Saved!';
        setTimeout(() => {
            saveButton.textContent = 'Save Settings';
        }, 2000);
        
        console.log('Settings saved:', currentSettings);
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Error saving settings. Please try again.');
    }
}

// Function to reset settings to defaults
function resetSettings() {
    // Reset form to default values
    currentSettings = {...defaultSettings};
    
    useCustomBgToggle.checked = defaultSettings.useCustomBackground;
    customBgInput.value = defaultSettings.backgroundURL;
    bgPreviewImg.style.display = 'none';
    bgPreviewImg.src = '';
    fileNameDisplay.textContent = 'No file chosen';
    toggleBackgroundInputs();
    
    showSearchToggle.checked = defaultSettings.showSearch;
    showShortcutsToggle.checked = defaultSettings.showShortcuts;
    searchEngineSelect.value = defaultSettings.searchEngine;
    
    // Reset accessibility settings
    fontSizeSlider.value = defaultSettings.fontSize;
    updateFontSizeDisplay();
    
    groupScaleSlider.value = defaultSettings.groupScale;
    updateGroupScaleDisplay();
    
    spacingScaleSlider.value = defaultSettings.spacingScale;
    updateSpacingScaleDisplay();
    
    highContrastToggle.checked = defaultSettings.highContrast;
    
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
    } else {
        // Use CSS variables for base themes
        document.documentElement.style.setProperty('--primary-color', `var(--${themeId}-primary)`);
        document.documentElement.style.setProperty('--secondary-color', `var(--${themeId}-secondary)`);
        document.documentElement.style.setProperty('--accent-color', `var(--${themeId}-accent)`);
        document.documentElement.style.setProperty('--text-color', `var(--${themeId}-text)`);
        document.documentElement.style.setProperty('--background-color', `var(--${themeId}-background)`);
    }
    
    // Apply high contrast if enabled
    if (currentSettings.highContrast) {
        document.documentElement.style.setProperty('--text-color', '#000000');
        document.documentElement.style.setProperty('--accent-color', '#FF0000');
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

// Update group scale display
function updateGroupScaleDisplay() {
    const value = groupScaleSlider.value;
    groupScaleValue.textContent = `${value}%`;
    // Apply change to the page for preview
    document.documentElement.style.setProperty('--group-scale', value / 100);
    // Apply to all elements' transform scale
    document.documentElement.style.setProperty('--element-scale', value / 100);
}

// Update spacing scale display
function updateSpacingScaleDisplay() {
    const value = spacingScaleSlider.value;
    spacingScaleValue.textContent = `${value}%`;
    // Apply change to the page for preview
    document.documentElement.style.setProperty('--spacing-scale', value / 100);
    // Apply to all margins and paddings
    document.documentElement.style.setProperty('--spacing-multiplier', value / 100);
}