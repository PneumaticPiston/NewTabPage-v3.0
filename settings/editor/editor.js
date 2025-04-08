const groupsContainer = document.getElementById('groups-editor-container');
const newGroupBtn = document.getElementById('new-group-btn');
const saveChangesBtn = document.getElementById('save-changes-btn');
const toggleDragBtn = document.getElementById('toggle-drag-btn');
const editPopup = document.getElementById('edit-group-popup');
const newGroupPopup = document.getElementById('new-group-popup');
const linksEditor = document.getElementById('group-links-editor');
const newGroupLinks = document.getElementById('new-group-links');

let currentGroups = [];
let editingGroupIndex = -1;
let dragEnabled = false;
let activeGroup = null;
let initialX = 0;
let initialY = 0;
let offsetX = 0;
let offsetY = 0;

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
    div.dataset.index = index;
    
    // Set position if available
    if (group.x !== undefined && group.y !== undefined) {
        div.style.position = dragEnabled ? 'absolute' : 'relative';
        div.style.top = dragEnabled ? `${group.y}px` : 'auto';
        div.style.left = dragEnabled ? `${group.x}px` : 'auto';
    }
    
    // Add draggable attributes when drag is enabled
    if (dragEnabled) {
        div.classList.add('draggable');
        div.draggable = true;
        
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragend', handleDragEnd);
        div.addEventListener('mousedown', handleMouseDown);
        div.addEventListener('mouseup', handleMouseUp);
        div.addEventListener('mousemove', handleMouseMove);
    }

    const header = document.createElement('div');
    header.className = 'group-header';
    
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = group.title;
    titleInput.className = 'group-title';
    titleInput.onchange = (e) => updateGroupTitle(index, e.target.value);
    
    const controls = document.createElement('div');
    controls.className = 'group-controls';
    
    // Create edit and delete buttons with unicode icons
    const editBtn = document.createElement('button');
    editBtn.className = 'icon-button edit-group-btn';
    editBtn.innerHTML = '✎'; // pencil icon
    editBtn.onclick = () => openEditPopup(index);
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'icon-button remove-group-btn';
    removeBtn.innerHTML = '✕'; // x icon
    removeBtn.onclick = () => removeGroup(index);

    controls.appendChild(editBtn);
    controls.appendChild(removeBtn);

    header.appendChild(titleInput);
    header.appendChild(controls);
    div.appendChild(header);

    // Add preview of links based on group type
    const linksPreview = document.createElement('div');
    linksPreview.className = group.type === 'grid' ? 'grid' : 'stack';
    
    group.links.forEach(link => {
        const favicon = getFavicon(link.url);
        if (group.type === 'stack') {
            linksPreview.innerHTML += `
                <div class="link-stack">
                    <img src="${favicon}" alt="${link.title}"/>
                    <span>${link.title}</span>
                </div>
            `;
        } else {
            linksPreview.innerHTML += `
                <div class="link-grid">
                    <img src="${favicon}" alt="${link.title}"/>
                    <span>${link.title}</span>
                </div>
            `;
        }
    });
    
    div.appendChild(linksPreview);
    return div;
}

function updateGroupTitle(index, title) {
    currentGroups[index].title = title;
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
    document.getElementById('new-group-popup').style.display = 'flex';
    document.getElementById('new-group-title').value = '';
    document.getElementById('new-group-type').value = 'stack';
    newGroupLinks.innerHTML = '';
    createLinkInputs(newGroupLinks);
    
    // Reset create button
    const createBtn = document.getElementById('create-new-group-btn');
    createBtn.textContent = 'Create Group';
    createBtn.onclick = createNewGroup;
});

document.getElementById('add-new-group-link-btn').addEventListener('click', () => {
    createLinkInputs(newGroupLinks);
});

document.getElementById('cancel-new-group-btn').addEventListener('click', () => {
    newGroupPopup.style.display = 'none';
});

document.getElementById('create-new-group-btn').addEventListener('click', createNewGroup);

function createNewGroup() {
    const title = document.getElementById('new-group-title').value;
    const type = document.getElementById('new-group-type').value;
    
    const links = Array.from(newGroupLinks.querySelectorAll('.link-editor')).map(editor => ({
        title: editor.querySelector('.link-title').value,
        url: editor.querySelector('.link-url').value
    })).filter(link => link.title && link.url);

    // Calculate a reasonable position for the new group
    // Try to place it in a spot that's not already occupied
    let x = 10;
    let y = 10;
    
    // Find available space
    const existingPositions = currentGroups.map(g => ({ x: g.x, y: g.y }));
    if (existingPositions.length > 0) {
        // Increment y by 100 until we find a position that's not occupied
        while (existingPositions.some(p => Math.abs(p.x - x) < 50 && Math.abs(p.y - y) < 50)) {
            y += 100;
        }
    }

    currentGroups.push({
        type,
        title,
        links,
        x: x,
        y: y
    });

    renderGroups();
    document.getElementById('new-group-popup').style.display = 'none';
}

function openEditPopup(index) {
    editingGroupIndex = index;
    const group = currentGroups[index];
    
    // Reuse new group popup for editing
    document.getElementById('new-group-popup').style.display = 'flex';
    document.getElementById('new-group-title').value = group.title;
    document.getElementById('new-group-type').value = group.type;
    
    // Clear and populate links
    newGroupLinks.innerHTML = '';
    group.links.forEach(link => createLinkInputs(newGroupLinks, link));
    
    // Change button text and handler for editing
    const createBtn = document.getElementById('create-new-group-btn');
    createBtn.textContent = 'Save Changes';
    createBtn.onclick = saveGroupChanges;
}

function saveGroupChanges() {
    const title = document.getElementById('new-group-title').value;
    const type = document.getElementById('new-group-type').value;
    
    const links = Array.from(newGroupLinks.querySelectorAll('.link-editor')).map(editor => ({
        title: editor.querySelector('.link-title').value,
        url: editor.querySelector('.link-url').value
    })).filter(link => link.title && link.url);

    // Get the existing position
    const currentX = currentGroups[editingGroupIndex].x || 10;
    const currentY = currentGroups[editingGroupIndex].y || 10;

    // Update existing group while preserving position
    currentGroups[editingGroupIndex] = {
        ...currentGroups[editingGroupIndex],
        type,
        title,
        links,
        x: currentX,
        y: currentY
    };

    renderGroups();
    document.getElementById('new-group-popup').style.display = 'none';
    
    // Reset create button
    const createBtn = document.getElementById('create-new-group-btn');
    createBtn.textContent = 'Create Group';
    createBtn.onclick = createNewGroup;
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

saveChangesBtn.addEventListener('click', async () => {
    await chrome.storage.sync.set({ groups: currentGroups });
});

// Toggle drag mode
toggleDragBtn.addEventListener('click', () => {
    dragEnabled = !dragEnabled;
    toggleDragBtn.textContent = dragEnabled ? 'Disable Drag' : 'Toggle Drag';
    toggleDragBtn.classList.toggle('active', dragEnabled);
    
    // Refresh to apply drag mode
    renderGroups();
});

// Drag and drop event handlers
function handleDragStart(e) {
    activeGroup = e.target;
    activeGroup.classList.add('dragging');
    
    // Store initial position
    initialX = e.clientX;
    initialY = e.clientY;
}

function handleDragEnd(e) {
    if (!activeGroup) return;
    
    activeGroup.classList.remove('dragging');
    
    // Calculate new position
    const index = parseInt(activeGroup.dataset.index);
    if (index >= 0 && index < currentGroups.length) {
        updateGroupPosition(index, activeGroup.offsetLeft, activeGroup.offsetTop);
    }
    
    activeGroup = null;
}

function handleMouseDown(e) {
    if (!dragEnabled) return;
    
    activeGroup = e.currentTarget;
    initialX = e.clientX;
    initialY = e.clientY;
    offsetX = activeGroup.offsetLeft;
    offsetY = activeGroup.offsetTop;
    
    activeGroup.classList.add('dragging');
    e.preventDefault();
}

function handleMouseUp(e) {
    if (!activeGroup) return;
    
    activeGroup.classList.remove('dragging');
    
    // Update position in data
    const index = parseInt(activeGroup.dataset.index);
    if (index >= 0 && index < currentGroups.length) {
        updateGroupPosition(index, activeGroup.style.left.replace('px', ''), 
                                    activeGroup.style.top.replace('px', ''));
    }
    
    activeGroup = null;
}

function handleMouseMove(e) {
    if (!activeGroup) return;
    
    e.preventDefault();
    
    const dx = e.clientX - initialX;
    const dy = e.clientY - initialY;
    
    activeGroup.style.left = `${offsetX + dx}px`;
    activeGroup.style.top = `${offsetY + dy}px`;
}

function updateGroupPosition(index, x, y) {
    // Parse values to ensure they're numeric
    const numX = parseInt(x, 10);
    const numY = parseInt(y, 10);
    
    // Update the group's position
    currentGroups[index].x = numX;
    currentGroups[index].y = numY;
}

function getFavicon(url) {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
        return ''; // Return empty string if URL is invalid
    }
}