chrome.runtime.onInstalled.addListener(async (details) => {
    // Only run initialization on fresh install, not on update
    if (details.reason === 'install') {
        // Check if settings already exist
        const { settings, groups } = await chrome.storage.sync.get(['settings', 'groups']);
        const hasSettings = settings && Object.keys(settings).length > 0;
        const hasGroups = groups && groups.length > 0;
        
        if (!hasSettings) {
            // Set default settings
            const defaultSettings = {
                searchBarPosition: {
                    x: '50%',
                    y: '50%'
                },
                headerLinks: [
                    { name: 'Gmail', url: 'https://mail.google.com' },
                    { name: 'Photos', url: 'https://photos.google.com' },
                    { name: 'Search Labs', url: 'https://labs.google.com' }
                ]
            };
            await chrome.storage.sync.set({ settings: defaultSettings });
        }
        
        if (!hasGroups) {
            const defaultGroup = {
                type: 'stack',
                title: 'Google Apps',
                x: '10%',
                y: '10%',
                links: [
                    { title: 'Gmail', url: 'https://mail.google.com' },
                    { title: 'Google Docs', url: 'https://docs.google.com' },
                    { title: 'Google Drive', url: 'https://drive.google.com' },
                    { title: 'Google Calendar', url: 'https://calendar.google.com' }
                ]
            };
            await chrome.storage.local.set({ groups: [defaultGroup] });
            await chrome.storage.sync.set({ groupsLocation: 'local' });
        }
        
        // Open the new tab page only for fresh installs
        chrome.tabs.create({
            url: chrome.runtime.getURL('/newtab/newtab.html?newInstall=true')
        });
    }
});