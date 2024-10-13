// functions/index.js
const { onRequest } = require("firebase-functions/v2/https");

require('dotenv').config();
exports.matchMentors = onRequest((req, res) => {
    async function loadModules() {
        const match = await import('./match.mjs');
        const { matchMentorsAndMentees } = match; // Destructure to get the function

        // Call the function
        await matchMentorsAndMentees();
        
        res.status(200).send("Matching process completed.");
    }
    loadModules().catch(err => {
        console.error(err);
        res.status(500).send("Error loading modules.");
    });
});
