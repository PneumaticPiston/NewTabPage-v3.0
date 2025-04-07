const groupsContainer = document.getElementById('groups-editor-container');
const newGroupBtn = document.getElementById('new-group-btn');
const saveChangesBtn = document.getElementById('save-changes-btn');
const editPopup = document.getElementById('edit-group-popup');
const newGroupPopup = document.getElementById('new-group-popup');
const linksEditor = document.getElementById('group-links-editor');
const newGroupLinks = document.getElementById('new-group-links');

let currentGroups = [];
let editingGroupIndex = -1;

// Load groups when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const result = await chrome.storage.sync.get(['groups']);
        currentGroups = result.groups || [];
        renderGroups();
    } catch (error) {
        console.error('Error loading groups:', error);
        currentGroups = [];
    }
});

function renderGroups() {
    groupsContainer.innerHTML = '';
    currentGroups.forEach((group, index) => {
        const groupElement = createGroupElement(group, index);
        groupsContainer.appendChild(groupElement);
    });
}

function createGroupElement(group, index) {
    const div = document.createElement('div');
    div.className = 'editor-group';
    div.innerHTML = `
        <div class="group-header">
            <input type="text" value="${group.title}" class="group-title" 
                   onchange="updateGroupTitle(${index}, this.value)">
            <div class="group-controls">
                <button class="edit-group-btn" onclick="openEditPopup(${index})">Edit Links</button>
                <button class="remove-group-btn" onclick="removeGroup(${index})">Remove</button>
            </div>
        </div>
        <div class="position-controls">
            <label>X: <input type="number" value="${group.x}" onchange="updateGroupPosition(${index}, 'x', this.value)"></label>
            <label>Y: <input type="number" value="${group.y}" onchange="updateGroupPosition(${index}, 'y', this.value)"></label>
        </div>
    `;
    return div;
}

function updateGroupTitle(index, title) {
    currentGroups[index].title = title;
}

function updateGroupPosition(index, axis, value) {
    currentGroups[index][axis] = parseInt(value);
}

function removeGroup(index) {
    currentGroups.splice(index, 1);
    renderGroups();
}

function createLinkInputs(container, link = { title: '', url: '' }) {
    const div = document.createElement('div');
    div.className = 'link-editor';
    div.innerHTML = `
        <input type="text" class="link-title" placeholder="Link Title" value="${link.title || ''}">
        <input type="url" class="link-url" placeholder="Link URL" value="${link.url || ''}">
        <button class="remove-link-btn">Remove</button>
    `;
    
    div.querySelector('.remove-link-btn').addEventListener('click', () => div.remove());
    container.appendChild(div);
}

// New group popup handlers
newGroupBtn.addEventListener('click', () => {
    newGroupPopup.style.display = 'flex';
    // Add first link input
    newGroupLinks.innerHTML = '';
    createLinkInputs(newGroupLinks);
});

document.getElementById('add-new-group-link-btn').addEventListener('click', () => {
    createLinkInputs(newGroupLinks);
});

document.getElementById('cancel-new-group-btn').addEventListener('click', () => {
    newGroupPopup.style.display = 'none';
});

document.getElementById('create-new-group-btn').addEventListener('click', () => {
    const title = document.getElementById('new-group-title').value;
    const x = parseInt(document.getElementById('new-group-x').value);
    const y = parseInt(document.getElementById('new-group-y').value);
    const type = document.getElementById('new-group-type').value;
    
    const links = Array.from(newGroupLinks.querySelectorAll('.link-editor')).map(editor => ({
        title: editor.querySelector('.link-title').value,
        url: editor.querySelector('.link-url').value
    })).filter(link => link.title && link.url);

    currentGroups.push({
        type,
        x,
        y,
        title,
        links
    });

    renderGroups();
    newGroupPopup.style.display = 'none';
});

// Edit group popup handlers
function openEditPopup(index) {
    editingGroupIndex = index;
    const group = currentGroups[index];
    linksEditor.innerHTML = '';
    group.links.forEach(link => createLinkInputs(linksEditor, link));
    editPopup.style.display = 'flex';
}

document.getElementById('add-link-btn').addEventListener('click', () => {
    createLinkInputs(linksEditor);
});

document.getElementById('save-group-btn').addEventListener('click', () => {
    const links = Array.from(linksEditor.querySelectorAll('.link-editor')).map(editor => ({
        title: editor.querySelector('.link-title').value,
        url: editor.querySelector('.link-url').value
    })).filter(link => link.title && link.url);

    currentGroups[editingGroupIndex].links = links;
    renderGroups();
    editPopup.style.display = 'none';
});

document.getElementById('close-popup-btn').addEventListener('click', () => {
    editPopup.style.display = 'none';
});

function renderLinkEditors(links) {
    linksEditor.innerHTML = '';
    links.forEach((link, index) => {
        const linkEditor = createLinkEditor(link, index);
        linksEditor.appendChild(linkEditor);
    });
}

function createLinkEditor(link, index) {
    const div = document.createElement('div');
    div.className = 'link-editor';
    div.innerHTML = `
        <input type="text" placeholder="Title" value="${link.title}" 
               onchange="updateLink(${index}, 'title', this.value)">
        <input type="url" placeholder="URL" value="${link.url}" 
               onchange="updateLink(${index}, 'url', this.value)">
        <button onclick="removeLink(${index})">Remove</button>
    `;
    return div;
}

function updateLink(index, field, value) {
    currentGroups[editingGroupIndex].links[index][field] = value;
}

function removeLink(index) {
    currentGroups[editingGroupIndex].links.splice(index, 1);
    renderLinkEditors(currentGroups[editingGroupIndex].links);
}

addLinkBtn.addEventListener('click', () => {
    currentGroups[editingGroupIndex].links.push({
        title: 'New Link',
        url: 'https://'
    });
    renderLinkEditors(currentGroups[editingGroupIndex].links);
});

saveGroupBtn.addEventListener('click', () => {
    editPopup.style.display = 'none';
});

closePopupBtn.addEventListener('click', () => {
    editPopup.style.display = 'none';
});

saveChangesBtn.addEventListener('click', async () => {
    // Save to chrome.storage.sync
    // This will be implemented when we add storage functionality
    await chrome.storage.sync.set({ groups: currentGroups });
});