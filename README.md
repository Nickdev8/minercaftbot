## Minecraft Server Control Bot

### What does this do?
This Discord bot allows you to control your Minecraft server on MCSManager via the MCSManager API. You can start, stop, restart, and check the status of your server directly from Discord commands.

### Why I made it
I created this bot to simplify the management of my Minecraft server. Managing a server can be cumbersome, especially when you have to switch between different interfaces. By integrating server controls into Discord, I can easily manage my server while chatting with friends. This project aims to streamline server management and make it more accessible for everyone.

### How to use

#### Prerequisites
- Node.js installed on your machine
- A Discord bot token
- MCSManager API credentials

#### Setup

1. Clone the repository:
    ```sh
    git clone https://github.com/Nickdev8/minercaftbot.git
    cd minercaftbot
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a [config.json](https://github.com/Nickdev8/minercaftbot/blob/main/config.json) file in the root directory with the following content:
    ```json
    {
        "": "This is the configuration for the Discord bot api",
        "token": "your-discord-bot-token",
        "clientId": "your-discord-client-id",
        "guildId": "your-discord-guild-id",

        "": "This is the configuration for the mcsManager api",
        "API_URL": "http://localhost:23333/api",
        "API_KEY": "your-mcsmanager-api-key",
        "INSTANCE_ID": "your-instance-id",
        "DAEMON_ID": "your-daemon-id",

        "": "This is the configuration for the Minecraft server",
        "SERVER_IP": "your-minecraft-server-ip"
    }
    ```

4. Deploy the commands to your Discord server:
    ```sh
    node deploy-commands.js
    ```

5. Run the bot:
    ```sh
    node --watch index.js
    ```

#### Commands
- `/start` - Start the Minecraft server
- `/begin` - Alias for start command
- `/stop` - Stop the Minecraft server
- `/status` - Get the status of the Minecraft server
- `/restart` - Restart the Minecraft server
- `/giveerror` - Simulate an error
- `/getip` - Get the Minecraft server IP address
- `/togglementions` - Toggle whether you want to be mentioned when the server starts or players join

### Example Usage
1. Open your Discord server and type `/start` to start the server.
2. Use `/status` to check if the server is running.
3. Use `/getip` to get the server IP address.
4. Use `/togglementions` to enable/disable notifications.
5. Type `/stop` to stop the server when you are done.
6. Type `/giveerror` to simulate an error and see how the bot handles it.

### Contributing
Feel free to fork this project and submit pull requests. Any contributions are welcome!

### License
This project is licensed under the MIT License.