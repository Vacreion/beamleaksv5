// mod_request.js

// This function handles form submission and sends data to Discord webhook
async function submitModRequest(event) {
    event.preventDefault();

    // Get form values
    const modName = document.getElementById('modName').value;
    const modAuthor = document.getElementById('modAuthor').value;
    const modLink = document.getElementById('modLink').value;
    const discordUser = document.getElementById('discordUser').value;

    // Construct the message to send to Discord
    const message = {
        content: `**New Mod Request**\n\n` +
                 `**Mod Name:** ${modName}\n` +
                 `**Mod Author:** ${modAuthor}\n` +
                 `**Link to Mod:** ${modLink}\n` +
                 `**Discord User:** ${discordUser || 'Not provided'}`
    };

    // Replace with your Discord webhook URL
    const webhookURL = 'https://discord.com/api/webhooks/1266450034522591283/AA2WvNlxFhO7qw0P2tL9qYkNviRUOmMACTIakjDJc3QU-zzDNOT-WigB672slXkAJyAI';

    try {
        const response = await fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        });

        if (response.ok) {
            alert('Mod request submitted successfully!');
            document.getElementById('mod-request-form').reset();
        } else {
            alert('Failed to submit mod request. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting mod request:', error);
        alert('An error occurred. Please try again.');
    }
}

// Wait for the DOM to be fully loaded before attaching the event listener
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('mod-request-form');
    if (form) {
        form.addEventListener('submit', submitModRequest);
    } else {
        console.error('Form with id "mod-request-form" not found');
    }
});