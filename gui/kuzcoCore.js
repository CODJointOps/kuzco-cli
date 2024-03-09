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
        this.configPath = path.join(os.homedir(), '.kuzco-cli', 'config.json');
        this.API_KEY = this.loadApiKey();
    }

    loadApiKey() {
        try {
            if (fs.existsSync(this.configPath)) {
                const configFile = fs.readFileSync(this.configPath);
                const config = JSON.parse(configFile);
                return config.API_KEY;
            } else {
                console.log('API Key config file does not exist. Please set up your API Key.');
                return '';
            }
        } catch (error) {
            console.error(`An error occurred while reading the API key: ${error.message}`);
            return '';
        }
    }

    apiKeyExists() {
        return fs.existsSync(this.configPath) && this.API_KEY !== '';
    }

    async sendPrompt(prompt, model) {
        console.log("Model received in sendPrompt:", model)
        const controller = new AbortController();
        const signal = controller.signal;

        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch('https://relay.kuzco.xyz/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', 'content': prompt + '\n' }],
                    model: model,
                    stream: false,
                }),
                signal: signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.error('Request was aborted due to timeout.');
                return { error: 'Request timed out. Please try again.' };
            } else {
                console.error(`An error occurred: ${error.message}`);
                return { error: error.message };
            }
        }
    }
}

module.exports = KuzcoCore;
