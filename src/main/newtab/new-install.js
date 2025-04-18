// Add this at the beginning of your settings.js file
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isNewInstall = urlParams.get('newInstall') === 'true';
    
    if (isNewInstall) {
        console.log('New installation detected');
        showWelcomeMessage();
    }
});

function showWelcomeMessage() {
    document.getElementById('settings-button').href = '/settings/settings.html?newInstall=true';
    // Create and show a welcome message
    const header = document.querySelector('header');
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-message';
    welcomeDiv.innerHTML = `
        <h3>Let's get started by customizing your new tab experience!</h3>
    `;
    header.insertAdjacentElement('afterend', welcomeDiv);
}