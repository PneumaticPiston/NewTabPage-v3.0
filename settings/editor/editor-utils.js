// Ensure toggleGridSettings is available in global scope
window.toggleGridSettings = function() {
    const groupType = document.getElementById('new-group-type').value;
    const gridSettings = document.getElementById('grid-settings');
    gridSettings.style.display = groupType === 'grid' ? 'block' : 'none';
};

// Fix the add-options functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get the buttons
    const newGroupBtn = document.getElementById('new-group-btn');
    const addOptions = document.getElementById('add-options');
    
    // Handle new group button
    if (newGroupBtn && addOptions) {
        newGroupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Toggle the add options menu
            if (addOptions.style.display === 'flex') {
                addOptions.style.display = 'none';
            } else {
                addOptions.style.display = 'flex';
            }
        });
    }
    
    // Handle add group button
    const addGroupButton = document.getElementById('add-group-button');
    if (addGroupButton) {
        addGroupButton.addEventListener('click', function(e) {
            e.preventDefault();
            // Show the new group popup
            const newGroupPopup = document.getElementById('new-group-popup');
            if (newGroupPopup) {
                newGroupPopup.style.display = 'flex';
                // Reset form
                document.getElementById('new-group-title').value = '';
                document.getElementById('new-group-type').value = 'stack';
                document.getElementById('grid-rows').value = '1';
                document.getElementById('grid-columns').value = '1';
                
                // Initialize grid settings visibility
                toggleGridSettings();
                
                // Clear links
                const linksContainer = document.getElementById('new-group-links');
                if (linksContainer) {
                    linksContainer.innerHTML = '';
                    // Add initial link
                    if (typeof createLinkInputs === 'function') {
                        createLinkInputs(linksContainer);
                    }
                }
                
                // Hide the add options menu
                addOptions.style.display = 'none';
            }
        });
    }
    
    // Handle click outside of menus
    document.addEventListener('click', function(event) {
        if (addOptions && addOptions.style.display === 'flex') {
            // If click is outside the add options menu and not on the new group button
            if (!addOptions.contains(event.target) && !newGroupBtn.contains(event.target)) {
                addOptions.style.display = 'none';
            }
        }
    });
});