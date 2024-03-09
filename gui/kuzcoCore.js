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
        this.controller = new AbortController();
        this.isAborted = false;
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

    abortFetch() {
        this.isAborted = true;
        this.controller.abort();
    }

    async sendPrompt(prompt, model) {
        console.log("Model received in sendPrompt:", model)
        this.controller = new AbortController();
        const signal = this.controller.signal;

        const timeoutId = setTimeout(() => this.controller.abort(), 25000);

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
            const errorMessage = this.isAborted
                ? 'Request aborted by the user. Please try again.'
                : 'Request timed out. Please try again.';

            this.isAborted = false;
            this.controller = new AbortController();

            return error.name === 'AbortError'
                ? { error: errorMessage }
                : { error: error.message };
        }
    }
}

module.exports = KuzcoCore;
