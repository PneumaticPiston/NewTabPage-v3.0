document.getElementById('settings-button').addEventListener('click', function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('newInstall') === 'true') {
        window.location.href = '../settings/settings.html?newInstall=true';
        return;
    }
    window.location.href = '../settings/settings.html';
});

