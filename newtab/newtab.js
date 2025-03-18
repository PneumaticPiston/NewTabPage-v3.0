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
const container = document.getElementById('stacks-container');

// const linkGroup = {
//     create: function(type, posx, posy, linksArray) {
//         return {
//             type: type,
//             posx: posx,
//             posy: posy,
//             linksArray: linksArray
//         };
//     }
// };

// var groups = [
//     new linkGroup('stack', 0, 0, ["https://www.google.com", "https://www.youtube.com", "https://www.reddit.com"]),
//     new linkGroup('row', 0, 0, ["https://www.google.com", "https://www.youtube.com", "https://www.reddit.com"]),
// ];


document.getElementById('settings-button').addEventListener('click', function() {
    window.location.href = '../settings/settings.html';
});