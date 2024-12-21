const axios = require('axios');

// Configuration
const API_URL = "http://localhost:23333/api"; // Update if your MCSManager API runs elsewhere
const API_KEY = "f98f3a9378dc4b7791631dab626f3ab4"; // Replace with your actual API key
const INSTANCE_ID = "4829f864c97a42379e845582bafe5669"; // Replace with the instance UUID
const DAEMON_ID = "c547f21e9c0644848b0fadda43f569c0"; // Replace with your daemon ID

// Helper to make authorized API requests
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
            console.error(error.response.data);
        }
        throw error;
    }
}


// Start the server
async function startServer() {
    console.log("Starting server...");
    try {
        const response = await apiRequest("/protected_instance/open", "GET", {
        });
        console.log("Server started:", response);
    } catch (error) {
        console.error("Failed to start server:", error.message);
    }
}

// Stop the server
async function stopServer() {
    console.log("Stopping server...");
    try {
        const response = await apiRequest("/protected_instance/stop", "GET", {
        });
        console.log("Server stopped:", response);
    } catch (error) {
        console.error("Failed to stop server:", error.message);
    }
}

// Check server status
async function checkStatus() {
    console.log("Checking server status...");
    try {
        const response = await apiRequest("/instance", "GET", {
        });
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

// Get server log
async function GetLog() {
    console.log("Checking server log...");
    try {
        const response = await apiRequest("/protected_instance/outputlog", "GET", {
        });
        console.log(`Server Log: ${response.status}`);
    } catch (error) {
        console.error("Failed to get server status:", error.message);
    }
}

(async () => {
    await checkStatus();
    // await startServer();
    // await checkStatus();
    // await stopServer();
    // await checkStatus();
})();


module.exports = {
    checkStatus,
    startServer,
    stopServer
};