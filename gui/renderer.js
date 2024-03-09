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
    const sendButton = document.getElementById('sendButton');

    if (chatForm && promptInput) {
        chatForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const userInput = promptInput.value;
            promptInput.value = '';

            sendButton.disabled = true;
            promptInput.disabled = true;

            displayMessage(userInput, 'user');

            const typingIndicator = displayTypingIndicator();

            try {
                const response = await window.electronAPI.sendPrompt(userInput);
                const assistantMessage = response.choices[0].message.content.trim();
                displayMessage(assistantMessage, 'assistant');
            } catch (error) {
                console.error(`Error sending prompt: ${error.message}`);
                displayMessage(`Error: ${error.message}`, 'assistant');
            } finally {
                typingIndicator.remove();

                sendButton.disabled = false;
                promptInput.disabled = false;
                promptInput.focus();
            }
        });
    } else {
        console.error('chatForm or promptInput elements not found!');
    }
});

function displayTypingIndicator() {
    const chatHistory = document.getElementById('chatHistory');
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'assistantMessage', 'ellipsis');
    typingIndicator.textContent = 'Processing';
    chatHistory.appendChild(typingIndicator);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return typingIndicator;
}