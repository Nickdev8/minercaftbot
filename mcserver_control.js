const axios = require('axios');
const { API_URL, API_KEY, INSTANCE_ID, DAEMON_ID, SERVERIP } = require('./config.json');

// Helper function to make authorized API requests
async function apiRequest(endpoint, method = "GET", params = {}, data = null) {
    try {
        const response = await axios({
            method: method,
            url: `${API_URL}${endpoint}?apikey=${API_KEY}&uuid=${INSTANCE_ID}&daemonId=${DAEMON_ID}`,
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "Content-Type": "application/json; charset=utf-8",
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error in API Request: ${error.message}`);
        if (error.response) {
            console.error(`Response data: ${JSON.stringify(error.response.data)}`);
        }
        throw error;
    }
}

// Function to start the Minecraft server
async function startServer() {
    console.log("Starting server...");
    try {
        const response = await apiRequest("/protected_instance/open", "GET", {});
        console.log("Server started:", response);
    } catch (error) {
        console.error("Failed to start server:", error.message);
    }
}

// Function to stop the Minecraft server
async function stopServer() {
    console.log("Stopping server...");
    try {
        const response = await apiRequest("/protected_instance/stop", "GET", {});
        console.log("Server stopped:", response);
    } catch (error) {
        console.error("Failed to stop server:", error.message);
    }
}

// Function to check the status of the Minecraft server
async function checkStatus() {
    console.log("Checking server status...");
    try {
        const response = await apiRequest("/instance", "GET", {});
        const status = response.data.status;
        const statusMessage = {
            "-1": "Busy",
            "0": "Stopped",
            "1": "Stopping",
            "2": "Starting",
            "3": "Running",
        }[status] || "Unknown";
        console.log(`Server status: ${statusMessage}`);
        return response.data.status;
    } catch (error) {
        console.error("Failed to get server status:", error.message);
    }
}

// Function to restart the Minecraft server
async function restartServer() {
    console.log("Restarting server...");
    try {
        const response = await apiRequest("/protected_instance/restart", "GET", {});
        console.log("Server restarted:", response);
    } catch (error) {
        console.error("Failed to restart server:", error.message);
    }
}

// Function to get the server log
async function getLog() {
    console.log("Checking server log...");
    try {
        const response = await apiRequest("/protected_instance/outputlog", "GET", {});
        console.log("Server log:", response);
    } catch (error) {
        console.error("Failed to get server log:", error.message);
    }
}

// Function to get the player count on the Minecraft server
async function getPlayerCount() {
    try {
        const response = await apiRequest("/instance", "GET", {});
        // Parse player count from instance data
        return {
            online: response.data.info.currentPlayers || 0,
            max: response.data.info.maxPlayers || 0
        };
    } catch (error) {
        console.error("Failed to get player count:", error.message);
        return { online: 0, max: 0 };
    }
}

// Export the functions to be used in other modules
module.exports = {
    checkStatus,
    startServer,
    stopServer,
    restartServer,
    getLog,
    getPlayerCount
};