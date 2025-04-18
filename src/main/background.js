// Basic service worker setup
self.addEventListener('install', (event) => {
    chrome.tabs.create({
        url: chrome.runtime.getURL('/newtab/newtab.html?newInstall=true')
    });
});