import { getAuth, updateProfile } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

document.getElementById('user-settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const username = document.getElementById('username').value;
    const bio = document.getElementById('bio').value;
    const profilePic = document.getElementById('profile-pic').files[0];

    try {
        let photoURL = user.photoURL;
        if (profilePic) {
            const storageRef = ref(storage, `profile-pics/${user.uid}`);
            await uploadBytes(storageRef, profilePic);
            photoURL = await getDownloadURL(storageRef);
        }

        await updateProfile(user, { displayName: username, photoURL });
        await updateDoc(doc(db, 'users', user.uid), { username, bio, photoURL });
        alert('Profile updated successfully!');
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
    }
});