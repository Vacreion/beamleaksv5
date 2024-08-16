import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use the environment variable
const webhookURL = process.env.DISCORD_WEBHOOK_URL;

document.addEventListener('DOMContentLoaded', () => {
    const modRequestForm = document.getElementById('mod-request-form');
    const statusMessage = document.getElementById('status-message');

    modRequestForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const modName = document.getElementById('mod-name').value;
        const modDescription = document.getElementById('mod-description').value;

        const message = {
            content: 'New Mod Request',
            embeds: [{
                title: 'Mod Request Details',
                fields: [
                    { name: 'Mod Name', value: modName },
                    { name: 'Description', value: modDescription }
                ]
            }]
        };

        try {
            const response = await fetch(webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            });

            if (response.ok) {
                statusMessage.textContent = 'Mod request submitted successfully!';
                modRequestForm.reset();
            } else {
                throw new Error('Failed to submit mod request');
            }
        } catch (error) {
            console.error('Error:', error);
            statusMessage.textContent = 'Failed to submit mod request. Please try again.';
        }
    });
});