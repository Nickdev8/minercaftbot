// Import necessary classes from discord.js
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
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

client.on("messageCreate", (message) => {
    if (message.author.bot) return; // Ignore bot messages
    if (message.content.includes("@here") || message.content.includes("@everyone") || message.type === "REPLY") return;

    if (message.mentions.has(client.user.id) && message.content.toLowerCase().includes("start")) {
        (async () => {
            try {
                response = await server.checkStatus();
                if (response != 0){
                    const statusMessage = {
                        "-1": "Busy",
                        "0": "Stopped",
                        "1": "Stopping",
                        "2": "Starting",
                        "3": "Running",
                    }[response] || "Unknown";
                    
                    message.channel.send("An error occurred: The server is currently not stopped");
                    message.channel.send("The server is currently: " + statusMessage)
                }
                else{
                    await server.startServer();
                    message.channel.send("Started server")
                }
            } catch (error) {
                message.channel.send("An error occurred:", error);
            }
        })();
    }
    else if (message.mentions.has(client.user.id) && message.content.toLowerCase().includes("stop")) {
        (async () => {
            try {
                response = await server.checkStatus();
                if (response != 3){
                    const statusMessage = {
                        "-1": "Busy",
                        "0": "Stopped",
                        "1": "Stopping",
                        "2": "Starting",
                        "3": "Running",
                    }[response] || "Unknown";

                    message.channel.send("An error occurred: The server is currently not Running");
                    message.channel.send("The server is currently: " + statusMessage)
                }
                else{
                    await server.stopServer();
                    message.channel.send("Stopped server")
                }
            } catch (error) {
                message.channel.send("An error occurred:", error);
            }
        })();
    }
    // Check if the bot is mentioned
    else if (message.mentions.has(client.user.id)) {
        (async () => {
            try {
                response = await server.checkStatus();
                const statusMessage = {
                    "-1": "Busy",
                    "0": "Stopped",
                    "1": "Stopping",
                    "2": "Starting",
                    "3": "Running",
                }[response] || "Unknown";
                message.channel.send("The server is currently: " + statusMessage)
            } catch (error) {
                message.channel.send("An error occurred:", error);
            }
        })();
    }
});


// Log the bot in
client.login(token);
