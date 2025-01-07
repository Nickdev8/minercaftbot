const { Client, GatewayIntentBits } = require('discord.js');
const { token, clientId } = require('./config.json');
const server = require('./mcserver_control.js');
const fs = require('fs');
const path = require('path');

// Create a new client instance with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// Validate configuration
function validateConfig(config) {
    const requiredFields = ['token', 'clientId', 'guildId', 'API_URL', 'API_KEY', 'INSTANCE_ID', 'DAEMON_ID'];
    for (const field of requiredFields) {
        if (!config[field]) {
            throw new Error(`Missing required config field: ${field}`);
        }
    }
}

try {
    validateConfig(require('./config.json'));
} catch (error) {
    console.error(`Configuration error: ${error.message}`);
    process.exit(1);
}

// Add these variables to store server info and preferences
let serverIP = ''; // Replace with your actual server IP
let mentionPreferences = new Map();
let statusMessage = null;

// Load preferences from file if it exists
try {
    const prefsPath = path.join(__dirname, 'preferences.json');
    if (fs.existsSync(prefsPath)) {
        const data = JSON.parse(fs.readFileSync(prefsPath));
        serverIP = data.serverIP || '';
        mentionPreferences = new Map(Object.entries(data.mentions || {}));
    }
} catch (error) {
    console.error('Error loading preferences:', error);
}

// Save preferences to file
function savePreferences() {
    const prefsPath = path.join(__dirname, 'preferences.json');
    const data = {
        serverIP,
        mentions: Object.fromEntries(mentionPreferences)
    };
    fs.writeFileSync(prefsPath, JSON.stringify(data, null, 2));
}

// Update status message
async function updateStatusMessage(channel) {
    try {
        const status = await server.checkStatus();
        const playerCount = await server.getPlayerCount();
        const statusEmoji = status === 3 ? '🟢' : '🔴';
        const content = `
${statusEmoji} **Minecraft Server Status**
IP: ${serverIP || 'Not set'}
Status: ${status === 3 ? 'Online' : 'Offline'}
Players: ${playerCount.online}/${playerCount.max}
        `.trim();

        if (statusMessage) {
            await statusMessage.edit(content);
        } else if (channel) {
            statusMessage = await channel.send(content);
        }
    } catch (error) {
        console.error('Error updating status message:', error);
    }
}

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    // Find or create status channel
    const guild = client.guilds.cache.first();
    let statusChannel = guild.channels.cache.find(c => c.name === 'minecraft-status');
    if (!statusChannel) {
        statusChannel = await guild.channels.create({
            name: 'minecraft-status',
            type: 0 // TEXT channel
        });
    }

    // Start status update loop
    setInterval(() => updateStatusMessage(statusChannel), 60000); // Update every minute
    updateStatusMessage(statusChannel);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'start' || commandName === 'begin') {
        try {
            console.log('Received start command');
            await interaction.deferReply(); // Defer the reply to give more time
            const response = await server.checkStatus();
            console.log(`Server status: ${response}`);
            if (response != 0) {
                const statusMessage = {
                    "-1": "Busy",
                    "0": "Stopped",
                    "1": "Stopping",
                    "2": "Starting",
                    "3": "Running",
                }[response] || "Unknown";

                await interaction.editReply(`An error occurred: The server is currently not stopped. The server is currently: ${statusMessage}`);
            } else {
                console.log('Starting server...');
                await server.startServer();
                await interaction.editReply('Started server');
                console.log('Server started');
            }
        } catch (error) {
            console.error(`Error in start command: ${error.message}`);
            await interaction.editReply(`An error occurred: ${error.message}`);
        }
    } else if (commandName === 'stop') {
        try {
            await interaction.deferReply(); // Defer the reply to give more time
            const response = await server.checkStatus();
            if (response != 3) {
                const statusMessage = {
                    "-1": "Busy",
                    "0": "Stopped",
                    "1": "Stopping",
                    "2": "Starting",
                    "3": "Running",
                }[response] || "Unknown";

                await interaction.editReply(`An error occurred: The server is currently not running. The server is currently: ${statusMessage}`);
            } else {
                await server.stopServer();
                await interaction.editReply('Stopped server');
            }
        } catch (error) {
            await interaction.editReply(`An error occurred: ${error.message}`);
        }
    } else if (commandName === 'status') {
        try {
            await interaction.deferReply(); // Defer the reply to give more time
            const response = await server.checkStatus();
            const statusMessage = {
                "-1": "Busy",
                "0": "Stopped",
                "1": "Stopping",
                "2": "Starting",
                "3": "Running",
            }[response] || "Unknown";
            await interaction.editReply(`The server is currently: ${statusMessage}`);
        } catch (error) {
            await interaction.editReply(`An error occurred: ${error.message}`);
        }
    } else if (commandName === 'restart') {
        try {
            console.log('Received restart command');
            await interaction.deferReply(); // Defer the reply to give more time
            const response = await server.checkStatus();
            console.log(`Server status: ${response}`);
            if (response != 3) {
                const statusMessage = {
                    "-1": "Busy",
                    "0": "Stopped",
                    "1": "Stopping",
                    "2": "Starting",
                    "3": "Running",
                }[response] || "Unknown";

                await interaction.editReply(`An error occurred: The server is currently not running. The server is currently: ${statusMessage}`);
            } else {
                console.log('Restarting server...');
                await server.restartServer();
                await interaction.editReply('Restarted server');
                console.log('Server restarted');
            }
        } catch (error) {
            console.error(`Error in restart command: ${error.message}`);
            await interaction.editReply(`An error occurred: ${error.message}`);
        }
    } else if (commandName === 'giveerror') {
        try {
            console.log('Received giveError command');
            throw new Error('This is a simulated error.');
        } catch (error) {
            console.error(`Simulated error: ${error.message}`);
            await interaction.reply(`An error occurred: ${error.message}`);
        }
    } else if (commandName === 'setip') {
        const ip = interaction.options.getString('ip');
        serverIP = ip;
        savePreferences();
        await interaction.reply(`Server IP has been set to: ${ip}`);
        await updateStatusMessage();
    } else if (commandName === 'togglementions') {
        const userId = interaction.user.id;
        const currentValue = mentionPreferences.get(userId) || false;
        mentionPreferences.set(userId, !currentValue);
        savePreferences();
        await interaction.reply(
            `You will ${!currentValue ? 'now' : 'no longer'} be mentioned when the server starts or players join.`
        );
    } else if (commandName === 'getip') {
        await interaction.reply(`Server IP: ${SERVER_IP}`);
    }
});

// Add server start notification
const originalStartServer = server.startServer;
server.startServer = async function() {
    await originalStartServer.apply(this, arguments);
    const mentions = [...mentionPreferences.entries()]
        .filter(([, value]) => value)
        .map(([userId]) => `<@${userId}>`)
        .join(' ');
    if (mentions) {
        const channel = client.channels.cache.find(c => c.name === 'minecraft-status');
        if (channel) {
            await channel.send(`${mentions} The Minecraft server is starting!`);
        }
    }
};

// Log the bot in
client.login(token);