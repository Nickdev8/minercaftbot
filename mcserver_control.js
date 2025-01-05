const axios = require('axios');
const { API_URL, API_KEY, INSTANCE_ID, DAEMON_ID } = require('./config.json');

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
            console.error("Response Data:", error.response.data);
            console.error("Response Status:", error.response.status);
        }
        throw error;
    }
}

// Start the server
async function startServer() {
    console.log("Starting server...");
    try {
        const response = await apiRequest("/protected_instance/open", "GET", {});
        console.log("Server started:", response);
    } catch (error) {
        console.error("Failed to start server:", error.message);
    }
}

// Stop the server
async function stopServer() {
    console.log("Stopping server...");
    try {
        const response = await apiRequest("/protected_instance/stop", "GET", {});
        console.log("Server stopped:", response);
    } catch (error) {
        console.error("Failed to stop server:", error.message);
    }
}

// Check server status
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

// Restart the server
async function restartServer() {
    console.log("Restarting server...");
    try {
        const response = await apiRequest("/protected_instance/restart", "GET", {});
        console.log("Server restarted:", response);
    } catch (error) {
        console.error("Failed to restart server:", error.message);
    }
}

// Get server log
async function getLog() {
    console.log("Checking server log...");
    try {
        const response = await apiRequest("/protected_instance/outputlog", "GET", {});
        console.log(`Server Log: ${response.status}`);
    } catch (error) {
        console.error("Failed to get server log:", error.message);
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
    stopServer,
    restartServer,
    getLog
};