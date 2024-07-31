import { sendMessage, listenToMessages } from './dm.js';

let activeChatContainer = null;

function createChatUI(recipientId, recipientName) {
    if (activeChatContainer) {
        activeChatContainer.remove();
    }

    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';
    chatContainer.innerHTML = `
        <div class="chat-header">
            <h3>Chat with ${recipientName}</h3>
            <button class="close-chat">Close</button>
        </div>
        <div class="chat-messages"></div>
        <form class="chat-form">
            <input type="text" placeholder="Type a message..." required>
            <button type="submit">Send</button>
        </form>
    `;

    const closeButton = chatContainer.querySelector('.close-chat');
    closeButton.addEventListener('click', () => chatContainer.remove());

    const form = chatContainer.querySelector('.chat-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input');
        const message = input.value.trim();
        if (message) {
            sendMessage(recipientId, message);
            input.value = '';
        }
    });

    const messagesContainer = chatContainer.querySelector('.chat-messages');
    listenToMessages(auth.currentUser.uid, (messages) => {
        messagesContainer.innerHTML = messages.map(msg => `
            <div class="message ${msg.senderId === auth.currentUser.uid ? 'sent' : 'received'}">
                <p>${msg.message}</p>
                <small>${new Date(msg.timestamp.toDate()).toLocaleString()}</small>
            </div>
        `).join('');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });

    activeChatContainer = chatContainer;
    document.body.appendChild(chatContainer);
}

export { createChatUI };