import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { createChatUI } from './dm-ui.js';

const auth = getAuth();
const db = getFirestore();

async function loadUserProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (!userId) {
        document.getElementById('user-profile').innerHTML = 'User not found.';
        return;
    }

    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            document.getElementById('user-profile').innerHTML = `
                <img src="${userData.photoURL || 'default-profile-pic.jpg'}" alt="${userData.username}'s profile picture">
                <h2>${userData.username}</h2>
                <p>${userData.bio || 'No bio available.'}</p>
            `;

            // Show DM button if it's not the current user's profile
            if (auth.currentUser && auth.currentUser.uid !== userId) {
                document.getElementById('send-dm-btn').style.display = 'block';
                document.getElementById('send-dm-btn').addEventListener('click', () => {
                    const recipientId = userId;
                    const recipientName = userData.username;
                    createChatUI(recipientId, recipientName);
                });
            }
        } else {
            document.getElementById('user-profile').innerHTML = 'User not found.';
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        document.getElementById('user-profile').innerHTML = 'Error loading profile. Please try again.';
    }
}

loadUserProfile();