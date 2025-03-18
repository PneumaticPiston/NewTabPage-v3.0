/***
 * newtab.js
 * @todo: 
 * Make different types of link groups:
 *  - stack: a simple stack of links, displays the title of the link, favicon on the left side?
 *  - grid: a grid of links, similar to the current new tab page, can be a grid or row
 *  - single: a single link, similar to the current new tab page shortcuts
 *  - row: a simple row of links, 
 * Search bar: dropdown to select search engine, search bar, and search button
 * Settings: button to open settings page at the bottom right corner
 * google account management: button to open google account management at the top right corner to the left of the app drawer
 * App drawer: button to open app drawer at the top right corner similar to the current new tab page
 *  - Allows the user to add and remove apps
 * 
 * Create a bar at the middle that containes a list of quick links
 * 
 * linkGroup: 
 *  - Configurable label at the top
 *  - Configurable x and y position
 *  - Configurable number of rows and columns
 *  - Configurable link size
 * 
 * link:
 *  - in the settings page, allow the user to click a button to remove the link
 *  - allow the user to change the title
 *  - allow the user to change the url
 * 
 * functions: 
 * getFavicon(url): returns the cached favicon of the url
 * 
 */
const container = document.getElementById('groups-container');

const GROUPS = [// link groups
    {// link group
        type: 'stack',
        x: 0,
        y: 0,
        title: 'Search',
        links: [
            {
                title: 'Google',
                url: 'https://www.google.com'
            },
            {
                title: 'Youtube',
                url: 'https://www.youtube.com'
            }
        ]
    }
];

const newGroup = {
    stack: function(links, x, y) {
        let group = document.createElement('div');
        links.forEach(async link => {
            const favicon = await getFavicon(link.url);
            group.innerHTML += newLink.stack(link.title, link.url, favicon);
        });
        group.classList.add('link-stack');
        group.style.top = y + 'px';
        group.style.left = x + 'px';
        return group;
    } 
}

const newLink = {
    stack: function(title, url, favicon) {
        return `
            <a href="${url}">
                <img src="${favicon || ''}" alt="${title}"/>
                <p>${title}</p>
            </a>
        `;
    },
    grid: function(title, url) {
        return `
            <div class="link-grid" href="${url}">
                <p>${title}</p>

            </div>
        `
    }
};

container.appendChild(newGroup.stack(GROUPS[0].links, GROUPS[0].x, GROUPS[0].y));

async function getFavicon(url) {
    try {
        const domain = new URL(url).hostname;
        const cachedIcon = localStorage.getItem(`favicon_${domain}`);
        
        if (cachedIcon) {
            return cachedIcon;
        }

        const response = await fetch(`https://www.google.com/s2/favicons?domain=${domain}`);
        const blob = await response.blob();
        const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });

        localStorage.setItem(`favicon_${domain}`, base64);
        return base64;
    } catch (error) {
        console.error('Error fetching favicon:' + url + " ", error);
        return null;
    }
}