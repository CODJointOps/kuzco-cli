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

async function main() {
    let messages = [];

    while (true) {
        const user_input = await askQuestion("User: ");
        if (user_input.toLowerCase() === 'exit') {
            break;
        }
        messages.push({ 'role': 'user', 'content': user_input + '\n' });

        try {
            const response = await fetch(`${BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messages,
                    model: 'mistral',
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`\nKuzco (Mistral):\n\n${data.choices[0].message.content.trim()}\n`);
        } catch (error) {
            console.error(`An error occurred: ${error.message}`);
        }
    }

    rl.close();
}

main().catch(console.error);