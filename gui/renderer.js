function displayMessage(message, sender) {
    const chatHistory = document.getElementById('chatHistory');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    if (sender === 'user') {
        messageDiv.classList.add('userMessage');
    } else if (sender === 'assistant') {
        messageDiv.classList.add('assistantMessage');
    }

    messageDiv.textContent = message;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chatForm');
    const promptInput = document.getElementById('promptInput');

    if (chatForm && promptInput) {
        chatForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const userInput = promptInput.value;
            promptInput.value = '';

            displayMessage(userInput, 'user');

            try {
                const response = await window.electronAPI.sendPrompt(userInput);
                const assistantMessage = response.choices[0].message.content.trim();
                displayMessage(assistantMessage, 'assistant');
            } catch (error) {
                console.error(`Error sending prompt: ${error.message}`);
                displayMessage(`Error: ${error.message}`, 'assistant');
            }
        });
    } else {
        console.error('chatForm or promptInput elements not found!');
    }
});
