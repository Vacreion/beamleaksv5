import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { createChatUI } from './dm-ui.js';

const auth = getAuth();
const db = getFirestore();

async function loadDMList() {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const dmListElement = document.getElementById('dm-list');
    
    const q = query(
        collection(db, 'messages'),
        where('recipientId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(20)
    );

    const querySnapshot = await getDocs(q);
    const conversations = {};

    querySnapshot.forEach((doc) => {
        const message = doc.data();
        if (!conversations[message.senderId]) {
            conversations[message.senderId] = message;
        }
    });

    for (const [senderId, lastMessage] of Object.entries(conversations)) {
        const senderDoc = await getDocs(doc(db, 'users', senderId));
        const senderData = senderDoc.data();
        
        const conversationElement = document.createElement('div');
        conversationElement.className = 'conversation-item';
        conversationElement.innerHTML = `
            <img src="${senderData.photoURL || 'default-profile-pic.jpg'}" alt="${senderData.username}'s profile picture">
            <div>
                <h3>${senderData.username}</h3>
                <p>${lastMessage.message.substring(0, 50)}${lastMessage.message.length > 50 ? '...' : ''}</p>
            </div>
        `;
        
        conversationElement.addEventListener('click', () => {
            createChatUI(senderId, senderData.username);
        });

        dmListElement.appendChild(conversationElement);
    }
}

loadDMList();
