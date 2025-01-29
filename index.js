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

// Variables to store server info and preferences
const SERVER_IP = 'play.yourserver.com'; // Replace with your actual server IP
let mentionPreferences = new Map();
let statusMessage = null;

// Load preferences from file if it exists
try {
    const prefsPath = path.join(__dirname, 'preferences.json');
    if (fs.existsSync(prefsPath)) {
        const data = JSON.parse(fs.readFileSync(prefsPath));
        mentionPreferences = new Map(Object.entries(data.mentions || {}));
    }
} catch (error) {
    console.error('Error loading preferences:', error);
}

// Save preferences to file
function savePreferences() {
    const prefsPath = path.join(__dirname, 'preferences.json');
    const data = {
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
IP: ${SERVER_IP}
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

// Event: Bot is ready
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

// Event: Interaction create (command received)
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'start' || commandName === 'begin') {
        await handleStartCommand(interaction);
    } else if (commandName === 'stop') {
        await handleStopCommand(interaction);
    } else if (commandName === 'status') {
        await handleStatusCommand(interaction);
    } else if (commandName === 'restart') {
        await handleRestartCommand(interaction);
    } else if (commandName === 'giveerror') {
        await handleGiveErrorCommand(interaction);
    } else if (commandName === 'togglementions') {
        await handleToggleMentionsCommand(interaction);
    } else if (commandName === 'getip') {
        await handleGetIpCommand(interaction);
    }
});

// Command handlers
async function handleStartCommand(interaction) {
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
}

async function handleStopCommand(interaction) {
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
}

async function handleStatusCommand(interaction) {
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
}

async function handleRestartCommand(interaction) {
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
}

async function handleGiveErrorCommand(interaction) {
    try {
        console.log('Received giveError command');
        throw new Error('This is a simulated error.');
    } catch (error) {
        console.error(`Simulated error: ${error.message}`);
        await interaction.reply(`An error occurred: ${error.message}`);
    }
}

async function handleToggleMentionsCommand(interaction) {
    const userId = interaction.user.id;
    const currentValue = mentionPreferences.get(userId) || false;
    mentionPreferences.set(userId, !currentValue);
    savePreferences();
    await interaction.reply(
        `You will ${!currentValue ? 'now' : 'no longer'} be mentioned when the server starts or players join.`
    );
}

async function handleGetIpCommand(interaction) {
    await interaction.reply(`Server IP: ${SERVER_IP}`);
}

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