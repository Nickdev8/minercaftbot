const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');

// Define the commands to be deployed
const commands = [
    {
        name: 'start',
        description: 'Start the Minecraft server',
    },
    {
        name: 'begin',
        description: 'Alias for start command',
    },
    {
        name: 'stop',
        description: 'Stop the Minecraft server',
    },
    {
        name: 'status',
        description: 'Get the status of the Minecraft server',
    },
    {
        name: 'restart',
        description: 'Restart the Minecraft server',
    },
    {
        name: 'giveerror',
        description: 'Simulate an error',
    },
    {
        name: 'getip',
        description: 'Get the Minecraft server IP address'
    },
    {
        name: 'togglementions',
        description: 'Toggle whether you want to be mentioned when the server starts or players join'
    }
];

// Create a new REST instance and set the token
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        // Deploy the commands to the specified guild
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();