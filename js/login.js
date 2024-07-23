import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                switch(userData.role) {
                    case 'admin':
                        window.location.href = 'admin.html';
                        break;
                    case 'staff':
                    case 'admin':
                        window.location.href = 'upload.html';
                        break;
                    default:
                        window.location.href = 'index.html';
                }
            } else {
                loginMessage.textContent = 'User not found. Please contact an administrator.';
            }
        } catch (error) {
            console.error('Error:', error);
            loginMessage.textContent = 'Invalid login. Please try again.';
        }
    });
});