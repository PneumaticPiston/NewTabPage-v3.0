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
    // Create and show a welcome message
    // Wait for bottom-controls to be available
    const checkElement = setInterval(() => {
        const header = document.getElementById('bottom-controls');
        if (header) {
            clearInterval(checkElement);
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'new-install';
            welcomeDiv.innerHTML = `
                <h3>Use the '+' button to add new elements</h3>
                <h3>Click on the '⫝̸' icon to move elements around</h3>
                <h3>Click the '💾' icon to save changes</h3>
            `;
            header.appendChild(welcomeDiv);
        }
    }, 100);
}