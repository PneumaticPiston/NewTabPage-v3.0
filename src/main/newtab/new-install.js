document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('newInstall') === 'true') {
        console.log('New installation detected');
        const newMessage = document.createElement('div');
        newMessage.className = 'welcome-message';
        newMessage.innerHTML = `
            <div class="welcome-content">
                <h2>Settings <b>▼</b></h2>
            </div>
        `;
        document.body.appendChild(newMessage);

        const toSettings = document.createElementByID('settings-button');

        toSettings.href += '?newInstall=true';

        newMessage.addEventListener('click', () => {
            document.body.removeChild(newMessage);
        });
    }
});