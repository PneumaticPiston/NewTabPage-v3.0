self.addEventListener("install",(e=>{chrome.tabs.create({url:chrome.runtime.getURL("/newtab/newtab.html?newInstall=true")})}));