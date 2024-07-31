import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const auth = getAuth();
const db = getFirestore();

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const showPasswordText = document.querySelector('.show-password');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        showPasswordText.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        showPasswordText.textContent = 'Show';
    }
}

document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            switch(userData.role) {
                case 'admin':
                    window.location.href = 'admin.html';
                    break;
                case 'staff':
                    window.location.href = 'upload.html';
                    break;
                case 'user':
                default:
                    window.location.href = 'index.html';
            }
        } else {
            alert('User not found. Please contact an administrator.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
});

window.togglePassword = togglePassword;