chrome.runtime.onInstalled.addListener(async (details) => {

    chrome.runtime.setUninstallURL('https://forms.gle/ENonKhwExQMowTuG8');
    
    // Handle extension updates - migrate from sync to local storage
    if (details.reason === 'update') {
        console.log('Extension updated, checking for migration needs');
        
        // Get all data from sync storage
        const syncData = await chrome.storage.sync.get(null);
        
        // Check if there's data in sync storage that needs migration
        if (syncData && Object.keys(syncData).length > 0) {
            console.log('Migrating data from sync to local storage');
            
            // Migrate all sync data to local storage
            await chrome.storage.local.set(syncData);
            
            // Optional: Clear sync storage after successful migration
            // Uncomment the next line if you want to clean up sync storage
            // await chrome.storage.sync.clear();
            
            console.log('Migration completed successfully');
        } else {
            console.log('No data found in sync storage to migrate');
        }
        
        return; // Exit early for updates, don't run install logic
    }
    
    // Check if settings already exist, regardless of install reason
    const { settings, groups } = await chrome.storage.sync.get(['settings', 'groups']);
    const hasSettings = settings && Object.keys(settings).length > 0;
    const hasGroups = groups && groups.length > 0;
    
    // If this is a fresh install OR if no settings exist, apply defaults
    if (details.reason === 'install' && !hasSettings) {
        // Set enhanced default settings if they don't exist
        if (!hasSettings) {
            const defaultSettings = {
                theme: 'light',
                useCustomBackground: false,
                backgroundURL: '',
                backgroundImage: null,
                showSearch: true,
                searchEngine: 'google',
                searchBarPosition: { x: '50%', y: '50%' }, // Assumes that the display is at least 1080x720
                useGlassBackground: true, // Default to true for glass background effect
                fontSize: 16,
                groupScale: 100, // Global scaling factor
                headerLinks: [
                    { name: 'Gmail', url: 'https://mail.google.com' },
                    { name: 'Photos', url: 'https://photos.google.com' },
                    { name: 'Search Labs', url: 'https://labs.google.com' }
                ],
                apps: [
                    {
                        name: 'Account',
                        icon: 'https://www.gstatic.com/images/branding/product/1x/avatar_square_blue_32dp.png',
                        url: 'https://myaccount.google.com/'
                    },
                    {
                        name: 'Search',
                        icon: 'https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png',
                        url: 'https://www.google.com/'
                    },
                    {
                        name: 'Maps',
                        icon: 'https://maps.gstatic.com/mapfiles/maps_lite/favicon_maps.ico',
                        url: 'https://maps.google.com/'
                    },
                    {
                        name: 'YouTube',
                        icon: 'https://www.youtube.com/s/desktop/1c3bfd26/img/favicon_32x32.png',
                        url: 'https://youtube.com/'
                    },
                    {
                        name: 'Play',
                        icon: 'https://www.gstatic.com/images/branding/product/1x/play_round_32dp.png',
                        url: 'https://play.google.com/'
                    },
                    {
                        name: 'Gmail',
                        icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
                        url: 'https://mail.google.com/'
                    },
                    {
                        name: 'Drive',
                        icon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_32dp.png',
                        url: 'https://drive.google.com/'
                    },
                    {
                        name: 'Calendar',
                        icon: 'https://ssl.gstatic.com/calendar/images/favicon_v2021_32.ico',
                        url: 'https://calendar.google.com/'
                    },
                    {
                        name: 'Photos',
                        icon: 'https://ssl.gstatic.com/images/branding/product/1x/photos_32dp.png',
                        url: 'https://photos.google.com/'
                    }
                ]
            };
            console.log('Applying default settings');
            await chrome.storage.sync.set({ settings: defaultSettings });
        }
        
        // Set default groups if they don't exist
        if (!hasGroups) {
            const defaultGroup = {
                type: 'grid',
                rows: 1,
                columns: 4,
                title: 'Google Apps',
                x: '50%',
                y: '60%',
                links: [
                    { title: 'Gmail', url: 'https://mail.google.com' },
                    { title: 'Google Docs', url: 'https://docs.google.com' },
                    { title: 'Google Drive', url: 'https://drive.google.com' },
                    { title: 'Google Calendar', url: 'https://calendar.google.com' }
                ]
            };
            console.log('Applying default groups');
            await chrome.storage.local.set({ groups: [defaultGroup] });
            await chrome.storage.sync.set({ groupsLocation: 'local' });
        }
        
        // Only open new tab on fresh install
        if (details.reason === 'install') {
            chrome.tabs.create({
                url: chrome.runtime.getURL('/newtab/newtab.html?newInstall=true')
            });
        }
    }
});