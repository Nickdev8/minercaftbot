const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const server = require('./mcserver_control.js');

// Create a new client instance with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'start') {
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
    }
});

// Log the bot in
client.login(token);