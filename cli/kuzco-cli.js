const readline = require('readline');
const fetch = require('node-fetch');

const fs = require('fs');
const path = require('path');
const prompt = require('prompt-sync')({ sigint: true });
const os = require('os');

const configDir = path.join(os.homedir(), '.kuzco-cli');
const configFile = path.join(configDir, 'config.json');

const BASE_URL = 'https://relay.kuzco.xyz/v1';

let API_KEY = '';

try {
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir);
    }

    let foundAPIKey = false;

    if (fs.existsSync(configFile)) {
        const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        if (config.API_KEY) {
            API_KEY = config.API_KEY;
            console.log("API key loaded from config file.");
            foundAPIKey = true;
        }
    }

    if (!foundAPIKey) {
        console.log('API key not found.');
        API_KEY = prompt('Please enter your API key: ');

        const config = { API_KEY };
        fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf8');
        console.log(`API key saved to ${configFile}`);
    }
} catch (error) {
    console.error(`An error occurred: ${error}`);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => {
    return new Promise(resolve => rl.question(query, ans => {
        resolve(ans);
    }));
};

const fetchWithTimeout = (url, options, timeout = 3000) => {
    const timeoutPromise = new Promise((_, reject) => {
        const id = setTimeout(() => {
            clearTimeout(id);
            reject(new Error('Request timed out'));
        }, timeout);
    });

    return Promise.race([
        fetch(url, options),
        timeoutPromise
    ]);
};

async function main() {
    let messages = [];

    console.log("Please choose a model: 1 for Mistral, 2 for Llama2");
    const modelChoice = prompt('Enter your choice (1 or 2): ');
    const model = modelChoice === '2' ? 'llama2' : 'mistral';

    while (true) {
        const user_input = await askQuestion("User: ");
        if (user_input.toLowerCase() === 'exit') {
            break;
        }
        messages.push({ 'role': 'user', 'content': user_input + '\n' });

        try {
            const response = await fetchWithTimeout(`${BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messages,
                    model: model
                })
            }, 15000);;

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`\nKuzco (${model}):\n\n${data.choices[0].message.content.trim()}\n`);
        } catch (error) {
            console.error(`An error occurred: ${error.message}`);
        }
    }

    rl.close();
}

main().catch(console.error);