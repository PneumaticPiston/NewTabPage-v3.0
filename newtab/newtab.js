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
        y: 50,
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
        let group = document.createElement('ul');
        links.forEach(async link => {
            let favicon = getFavicon(link.url);
            group.innerHTML += newLink.stack(link.title, link.url, favicon);
        });
        group.classList.add('group');
        group.classList.add('stack');
        group.style.top = y + 'px';
        group.style.left = x + 'px';
        return group;
    } 
}

const newLink = {
    stack: function(title, url, favicon) {
        return `
            <li href="${url}" class="link-stack">
                <a href="${url}"><img src="${favicon}"/>${title}</a>
            </li>
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

function getFavicon(url) {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
        return ''; // Return empty string if URL is invalid
    }
}