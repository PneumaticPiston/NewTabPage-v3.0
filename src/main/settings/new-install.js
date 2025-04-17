// Add this at the beginning of your settings.js file
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isNewInstall = urlParams.get('newInstall') === 'true';
    
    if (isNewInstall) {
        // Run your first-time setup code here
        console.log('New installation detected');
        // Example: Show a welcome message
        showWelcomeMessage();
    }
});

function showWelcomeMessage() {
    // Create and show a welcome message
    const header = document.querySelector('header');
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-message';
    welcomeDiv.innerHTML = `
        <div class="alert">
            <h3>Welcome to Custom New Tab Page!</h3>
            <p>Let's get started by customizing your new tab experience.</p>
        </div>
    `;
    header.insertAdjacentElement('afterend', welcomeDiv);
}