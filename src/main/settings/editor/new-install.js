// Add this at the beginning of your settings.js file
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isNewInstall = urlParams.get('newInstall') === 'true';
    
    if (isNewInstall) {
        console.log('New installation detected');
        newInstall();
    }
});

function newInstall() {
    document.getElementById('settings-button').href = '/settings/settings.html?newInstall=true';
    // Create and show a welcome message
    const header = document.getElementById('bottom-controls').parentElement;
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'new-install';
    welcomeDiv.innerHTML = `
        <h3>Use the '+' button to add new elements</h3>
        <h3>Click on the '⫝̸' icon to move elements around</h3>
        <h3>Click the '💾' icon to save changes</h3>
    `;
    header.insertAdjacentElement('afterend', welcomeDiv);
}