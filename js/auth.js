import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyBwU5BhPXKaEvb7YdVYbrTou7kHfaGjWF8",
    authDomain: "beamleaksv3.firebaseapp.com",
    projectId: "beamleaksv3",
    storageBucket: "beamleaksv3.appspot.com",
    messagingSenderId: "657885182981",
    appId: "1:657885182981:web:d113473377db33d9edf06c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === 'staff' || userData.role === 'admin') {
                document.getElementById('admin-content').style.display = 'block';
            } else {
                window.location.href = 'login.html';
            }
        } else {
            window.location.href = 'login.html';
        }
    } else {
        window.location.href = 'login.html';
    }
});
