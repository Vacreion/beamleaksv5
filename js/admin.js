import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, limit, startAfter, orderBy } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const auth = getAuth();
const db = getFirestore();

document.addEventListener('DOMContentLoaded', () => {
    const addUserBtn = document.getElementById('add-user-btn');
    const manageUsersBtn = document.getElementById('manage-users-btn');
    const manageModsBtn = document.getElementById('manage-mods-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const exportUsersBtn = document.getElementById('export-users-btn');
    const exportModsBtn = document.getElementById('export-mods-btn');

    addUserBtn.addEventListener('click', showAddUserForm);
    manageUsersBtn.addEventListener('click', showUsersList);
    manageModsBtn.addEventListener('click', showModsList);
    uploadBtn.addEventListener('click', () => {
        window.location.href = 'upload.html';
    });
    exportUsersBtn.addEventListener('click', exportUsers);
    exportModsBtn.addEventListener('click', exportMods);
});

function showAddUserForm() {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
        <h3>Add New User</h3>
        <form id="add-user-form">
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Password" required>
            <select id="role">
                <option value="user">User</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
            </select>
            <button type="submit">Add User</button>
        </form>
    `;
    const addUserForm = document.getElementById('add-user-form');
    addUserForm.addEventListener('submit', addUser);
}

async function addUser(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
            email: email,
            role: role
        });
        alert('User added successfully');
        showUsersList();
    } catch (error) {
        console.error('Error adding user:', error);
        alert('Failed to add user: ' + error.message);
    }
}

async function showUsersList(lastVisible = null, searchTerm = '') {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
        <h3>Manage Users</h3>
        <input type="text" id="user-search" placeholder="Search users...">
        <div id="users-list"></div>
        <button id="load-more-users">Load More</button>
    `;

    const usersList = document.getElementById('users-list');
    const loadMoreBtn = document.getElementById('load-more-users');
    const searchInput = document.getElementById('user-search');

    searchInput.addEventListener('input', debounce(() => showUsersList(null, searchInput.value), 300));

    try {
        let q = query(collection(db, 'users'), orderBy('email'), limit(10));

        if (searchTerm) {
            q = query(q, where('email', '>=', searchTerm), where('email', '<=', searchTerm + '\uf8ff'));
        }

        if (lastVisible) {
            q = query(q, startAfter(lastVisible));
        }

        const usersSnapshot = await getDocs(q);
        
        if (usersSnapshot.empty) {
            usersList.innerHTML += '<p>No users found.</p>';
            loadMoreBtn.style.display = 'none';
        } else {
            usersSnapshot.forEach((doc) => {
                const user = doc.data();
                usersList.innerHTML += `
                    <div>
                        <p>Email: ${user.email} | Role: ${user.role}</p>
                        <button onclick="changeUserRole('${doc.id}', '${user.role}')">Change Role</button>
                        <button onclick="deleteUser('${doc.id}')">Delete User</button>
                    </div>
                `;
            });

            const lastVisibleUser = usersSnapshot.docs[usersSnapshot.docs.length - 1];
            loadMoreBtn.onclick = () => showUsersList(lastVisibleUser, searchTerm);
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        usersList.innerHTML += '<p>Error loading users. Please try again.</p>';
    }
}

window.changeUserRole = async function(userId, currentRole) {
    const newRole = prompt('Enter new role (user, staff, or admin):', currentRole);
    if (newRole && ['user', 'staff', 'admin'].includes(newRole)) {
        try {
            await updateDoc(doc(db, 'users', userId), { role: newRole });
            alert('User role updated successfully');
            showUsersList();
        } catch (error) {
            console.error('Error updating user role:', error);
            alert('Failed to update user role: ' + error.message);
        }
    } else {
        alert('Invalid role. No changes made.');
    }
}

window.deleteUser = async function(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            await deleteDoc(doc(db, 'users', userId));
            alert('User deleted successfully');
            showUsersList();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user: ' + error.message);
        }
    }
}

async function showModsList(lastVisible = null, searchTerm = '') {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
        <h3>Manage Mods</h3>
        <input type="text" id="mod-search" placeholder="Search mods...">
        <div id="mods-list"></div>
        <button id="load-more-mods">Load More</button>
    `;

    const modsList = document.getElementById('mods-list');
    const loadMoreBtn = document.getElementById('load-more-mods');
    const searchInput = document.getElementById('mod-search');

    searchInput.addEventListener('input', debounce(() => showModsList(null, searchInput.value), 300));

    try {
        let q = query(collection(db, 'mods'), orderBy('title'), limit(10));

        if (searchTerm) {
            q = query(q, where('title', '>=', searchTerm), where('title', '<=', searchTerm + '\uf8ff'));
        }

        if (lastVisible) {
            q = query(q, startAfter(lastVisible));
        }

        const modsSnapshot = await getDocs(q);
        
        if (modsSnapshot.empty) {
            modsList.innerHTML += '<p>No mods found.</p>';
            loadMoreBtn.style.display = 'none';
        } else {
            modsSnapshot.forEach((doc) => {
                const mod = doc.data();
                modsList.innerHTML += `
                    <div>
                        <h4>${mod.title}</h4>
                        <p>Author: ${mod.author}</p>
                        <p>Description: ${mod.description}</p>
                        <button onclick="editMod('${doc.id}')">Edit</button>
                        <button onclick="deleteMod('${doc.id}')">Delete</button>
                    </div>
                `;
            });

            const lastVisibleMod = modsSnapshot.docs[modsSnapshot.docs.length - 1];
            loadMoreBtn.onclick = () => showModsList(lastVisibleMod, searchTerm);
        }
    } catch (error) {
        console.error('Error fetching mods:', error);
        modsList.innerHTML += '<p>Error loading mods. Please try again.</p>';
    }
}

window.editMod = async function(modId) {
    const modDoc = await getDoc(doc(db, 'mods', modId));
    const mod = modDoc.data();

    const content = document.getElementById('admin-content');
    content.innerHTML = `
        <h3>Edit Mod</h3>
        <form id="edit-mod-form">
            <input type="text" id="title" value="${mod.title}" required>
            <input type="text" id="author" value="${mod.author}" required>
            <textarea id="description" required>${mod.description}</textarea>
            <button type="submit">Update Mod</button>
        </form>
    `;

    const editModForm = document.getElementById('edit-mod-form');
    editModForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedMod = {
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            description: document.getElementById('description').value,
        };

        try {
            await updateDoc(doc(db, 'mods', modId), updatedMod);
            alert('Mod updated successfully');
            showModsList();
        } catch (error) {
            console.error('Error updating mod:', error);
            alert('Failed to update mod: ' + error.message);
        }
    });
}

window.deleteMod = async function(modId) {
    if (confirm('Are you sure you want to delete this mod?')) {
        try {
            await deleteDoc(doc(db, 'mods', modId));
            alert('Mod deleted successfully');
            showModsList();
        } catch (error) {
            console.error('Error deleting mod:', error);
            alert('Failed to delete mod: ' + error.message);
        }
    }
}

async function exportUsers() {
    try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => doc.data());
        const csv = convertToCSV(usersData);
        downloadCSV(csv, 'users_export.csv');
    } catch (error) {
        console.error('Error exporting users:', error);
        alert('Failed to export users: ' + error.message);
    }
}

async function exportMods() {
    try {
        const modsSnapshot = await getDocs(collection(db, 'mods'));
        const modsData = modsSnapshot.docs.map(doc => doc.data());
        const csv = convertToCSV(modsData);
        downloadCSV(csv, 'mods_export.csv');
    } catch (error) {
        console.error('Error exporting mods:', error);
        alert('Failed to export mods: ' + error.message);
    }
}

function convertToCSV(arr) {
    const array = [Object.keys(arr[0])].concat(arr);
    return array.map(row => Object.values(row).map(String).join(',')).join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}