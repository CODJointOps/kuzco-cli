const fs = require('fs');
const path = require('path');
const os = require('os');

const fetch = require('node-fetch');

async function fetchData(url, options = {}) {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(url, options);
    return response;
}

class KuzcoCore {
    constructor() {
        this.API_KEY = this.loadApiKey();
    }

    loadApiKey() {
        const configPath = path.join(os.homedir(), '.kuzco-cli', 'config.json');
        try {
            const configFile = fs.readFileSync(configPath);
            const config = JSON.parse(configFile);
            return config.API_KEY;
        } catch (error) {
            console.error(`An error occurred while reading the API key: ${error.message}`);
            return '';
        }
    }

    async sendPrompt(prompt) {
        try {
            const response = await fetch('https://relay.kuzco.xyz/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', 'content': prompt + '\n' }],
                    model: 'mistral',
                    stream: false,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`An error occurred: ${error.message}`);
            return { error: error.message };
        }
    }
}

module.exports = KuzcoCore;
