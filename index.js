const axios = require('axios');
const https = require('https');

// Define the six endpoints for each light
const lightIds = [
    '70f54ec8-7799-43a8-a958-f5f74af9ce49',
    '03fb185f-93d8-44ef-9745-44412c9ccc40',
    'f2166b44-7491-4558-bbae-d9e22dbc7eb7',
    '215c7ffe-c080-42c3-a9f8-2ef6bdb201cf',
    '3a866a2a-3e76-458d-bbf7-2e9a75e231d0',
    '0af8fdb9-f901-4ed4-b9ca-212b27718ab5',
];

const lightEndpoint = "https://192.168.0.48/clip/v2/resource/light/";

// List of 'rainbow-colors' based on Philip's color-scheme pattern
const rainbowColors = [
    { x: 0.700, y: 0.298 },  // Red
    { x: 0.640, y: 0.330 },  // Red-Orange
    { x: 0.580, y: 0.390 },  // Orange
    { x: 0.530, y: 0.440 },  // Yellow-Orange
    { x: 0.444, y: 0.515 },  // Yellow
    { x: 0.380, y: 0.550 },  // Yellow-Green
    { x: 0.280, y: 0.595 },  // Green
    { x: 0.220, y: 0.590 },  // Green-Cyan
    { x: 0.160, y: 0.530 },  // Cyan
    { x: 0.150, y: 0.450 },  // Cyan-Blue
    { x: 0.160, y: 0.130 },  // Blue
    { x: 0.170, y: 0.090 },  // Blue-Indigo
    { x: 0.170, y: 0.040 },  // Indigo
    { x: 0.250, y: 0.170 },  // Indigo-Violet
    { x: 0.380, y: 0.170 }   // Violet
];

// Define a function to set the light with a specified brightness and color
async function setLight(endpoint, brightness, color) {
    try {
        const response = await axios.put(endpoint, {
            dimming: { brightness },
            color: { xy: color },
            dynamics: {
                duration: 8000
            }
        },
        { headers: {
            'hue-application-key': '###'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });
        // console.log(`Light at ${endpoint} set to brightness ${brightness} with color [${color.x}, ${color.y}]`);
    } catch (error) {
        console.error(`Failed to set light at ${endpoint}: ${error}`);
    }
}

function getPosition(currentPosition, move, totalSize) {
    // Calculate the new position
    let newPosition = (currentPosition + move) % totalSize;

    // Handle negative wrap-around
    if (newPosition < 0) {
        newPosition += totalSize;
    }

    return newPosition;
}


async function setLightList(index = null, brightness = 0, colors = {x:0.2,y:0.2}) {
    console.log(`Light:\t${index ?? 'all'}\tupdated to: ${JSON.stringify(colors)} \t ${brightness}.`)
    if (index === null) {
        for (lightId of lightIds) {
            await setLight(lightEndpoint + lightId, brightness, colors);
        }
    } else {
        await setLight(lightEndpoint + lightIds[index], brightness, colors);
    }
}

// Function to loop through lights and update them
async function updateLights() {
    await setLightList(getPosition(interator, 0, lightIds.length), 100, rainbowColors[getPosition(interator, 0, rainbowColors.length)]);
    await setLightList(getPosition(interator, -2, lightIds.length), 0, rainbowColors[getPosition(interator, -2, rainbowColors.length)]);
    interator++;
}

let interator = 0;
(async () => {
    await setLightList();
})();
// // Run the updateLights function every few seconds
setInterval(updateLights, 4000); // Updates every 3 seconds

// // Initially update lights when script starts
updateLights();