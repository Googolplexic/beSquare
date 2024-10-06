const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'ui')));

// Serve static files from the ui directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

// Example endpoint for gptSoundToText functionality
app.post('/api/convert-sound-to-text', async (req, res) => {
    try {
        // Import your existing gptSoundToText logic
        const gptSoundToText = require('./sandbox/gptSoundToText');
        
        // Handle the conversion
        // This is a placeholder - adjust according to your actual gptSoundToText implementation
        const result = await gptSoundToText(req.body);
        
        res.json({ success: true, text: result });
    } catch (error) {
        console.error('Error in sound to text conversion:', error);
        res.status(500).json({ error: 'Conversion failed' });
    }
});


app.get('/api/function-caller', async (req, rel) => {

});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Access the application at http://localhost:${port}`);
});
