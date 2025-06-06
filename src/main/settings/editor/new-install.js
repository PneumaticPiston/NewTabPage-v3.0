document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('newInstall') === 'true') {
        console.log('New installation detected');
        const newMessage = document.createElement('div');
        newMessage.className = 'welcome-message';
        newMessage.innerHTML = `
            <div class="welcome-content">
                <h2>Controls:</h2>
                <p>Add link groups or widgets:</p>
                <p>Toggle the drag anchor to move things around:</p>
                <p>Don't forget to save your settings before you leave!</p>
            </div>
        `;
        document.body.appendChild(newMessage);

        newMessage.addEventListener('click', () => {
            document.body.removeChild(newMessage);
            // Optionally, you can redirect to the settings page or perform other actions
            // window.location.href = 'settings.html'; // Uncomment to redirect
        });
    }
});