// check-models.js
const https = require('https');

// ⚠️ REPLACE THIS WITH YOUR REAL KEY ⚠️
const API_KEY = "AIzaSyBdPn3P9aKCF9MxxU-DLfak_wKw0mZ-tks"; 

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      
      if (json.error) {
        console.error("❌ API ERROR:", JSON.stringify(json.error, null, 2));
      } else if (json.models) {
        console.log("✅ SUCCESS! Available Models:");
        json.models.forEach(m => {
            // Filter to show only Gemini models
            if(m.name.includes("gemini")) console.log(` - ${m.name}`);
        });
      } else {
        console.log("⚠️ Unexpected response:", json);
      }
    } catch (e) {
      console.error("Failed to parse response:", e);
    }
  });
}).on('error', (err) => {
  console.error("Network Error:", err.message);
});