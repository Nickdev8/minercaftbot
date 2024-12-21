const axios = require("axios");

const API_URL = "http://iotservice.nl:23333"; // Update if your MCSManager API runs elsewhere
const API_KEY = "f98f3a9378dc4b7791631dab626f3ab4"; // Replace with your actual API key
const API_UUID = "4829f864c97a42379e845582bafe5669"; // Instance ID
const API_daemonId = "c547f21e9c0644848b0fadda43f569c0"; // daemonId


async function getDaemons() {
  try {
    const response = await axios({
      method: "GET",
      url: `${API_URL}/api/protected_instance/outputlog?apikey=${API_KEY}&uuid=${API_UUID}&daemonId=${API_daemonId}`,
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/json; charset=utf-8",
      },
    });
    console.log("Daemon data retrieved successfully:", response.data);
  } catch (error) {
    console.error("Error fetching daemon data:", error.message);
    if (error.response) {
      console.error("Response Data:", error.response.data);
      console.error("Response Status:", error.response.status);
    }
  }
}

getDaemons();
