function displayMessage(message, sender) {
    const chatHistory = document.getElementById('chatHistory');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    const parts = message.split('```');
    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
            const textPart = document.createElement('span');
            textPart.textContent = parts[i];
            messageDiv.appendChild(textPart);
        } else {
            const codeBlock = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = parts[i];
            codeBlock.appendChild(code);
            messageDiv.appendChild(codeBlock);
        }
    }

    if (sender === 'user') {
        messageDiv.classList.add('userMessage');
    } else {
        messageDiv.classList.add('assistantMessage');
    }

    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chatForm');
    const promptInput = document.getElementById('promptInput');
    const modelSelect = document.getElementById('modelSelect');
    const sendButton = document.getElementById('sendButton');
    const stopButton = document.getElementById('stopButton');
    const modelSelectionContainer = document.getElementById('modelSelectionContainer');

    if (chatForm && promptInput && modelSelect) {
        chatForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const userInput = promptInput.value;
            const selectedModel = modelSelect.value;
            promptInput.value = '';
            modelSelectionContainer.style.display = 'none';

            sendButton.disabled = true;
            promptInput.disabled = true;
            stopButton.disabled = false;

            displayMessage(userInput, 'user');

            const typingIndicator = displayTypingIndicator();

            try {
                const response = await window.electronAPI.sendPrompt(userInput, selectedModel);
                if (response.error) {
                    throw new Error(response.error);
                }
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
                stopButton.disabled = true;
            }
        });
    } else {
        console.error('chatForm or promptInput elements not found!');
    }
});

document.getElementById('stopButton').addEventListener('click', () => {
    window.electronAPI.abortPrompt();
    document.getElementById('stopButton').disabled = true;
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

document.addEventListener('keydown', (e) => {
  if (e.key === 'F11') {
    e.preventDefault();
    ipcRenderer.send('toggle-fullscreen');
  }
});