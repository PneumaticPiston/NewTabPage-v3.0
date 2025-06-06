// Add this at the beginning of your settings.js file
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('newInstall') === 'true') {
        console.log('New installation detected');
        document.getElementById('editor-link').href += '?newInstall=true';
    }
});