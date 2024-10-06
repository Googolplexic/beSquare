const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { tools } = require('./assistant');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 3001;    // Port for HTTP server
const portWs = process.env.PORTWS || 5001; // Port for WebSocket server

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize OpenAI with your API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Store the assistant ID after creation
let ASSISTANT_ID;

// Initialize the assistant
async function initializeAssistant() {
    try {
        // Create a new assistant if ASSISTANT_ID is not provided in env
        if (!process.env.ASSISTANT_ID) {
            const assistant = await openai.beta.assistants.create({
                name: "Adobe Express Helper",
                instructions: "You are a helpful assistant integrated with Adobe Express. You help users with their creative tasks and queries.",
                model: "gpt-4o-mini",
                tools: tools
            });
            ASSISTANT_ID = assistant.id;
            console.log('Created new assistant with ID:', ASSISTANT_ID);
        } else {
            ASSISTANT_ID = process.env.ASSISTANT_ID;
            console.log('Using existing assistant ID:', ASSISTANT_ID);
        }
    } catch (error) {
        console.error('Error initializing assistant:', error);
        throw error;
    }
}

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.ADDON_ORIGIN || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Create a new thread
app.post('/api/thread', async (req, res) => {
    try {
        const thread = await openai.beta.threads.create();
        res.json({
            success: true,
            threadId: thread.id
        });
    } catch (error) {
        console.error('Error creating thread:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Send a message and get response
app.post('/api/chat', async (req, res) => {
    try {
        const { threadId, message } = req.body;

        if (!threadId || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing threadId or message in request body'
            });
        }

        // Add the user's message to the thread
        await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: message
        });

        // Create a run
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: ASSISTANT_ID
        });

        // Poll for the run completion
        let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);

        // Wait for the run to complete (with timeout)
        const startTime = Date.now();
        const timeout = 30000; // 30 seconds timeout

        while (runStatus.status !== 'completed' && runStatus.status !== 'failed') {
            if (Date.now() - startTime > timeout) {
                throw new Error('Request timeout');
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
        }

        if (runStatus.status === 'failed') {
            throw new Error('Assistant run failed');
        }

        // Get the messages (including the assistant's response)
        const messages = await openai.beta.threads.messages.list(threadId);

        // Get the latest assistant message
        const assistantMessage = messages.data
            .filter(msg => msg.role === 'assistant')
            .shift();

        if (!assistantMessage) {
            throw new Error('No assistant response found');
        }

        res.json({
            success: true,
            response: assistantMessage.content[0].text.value
        });

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// English language transcription
// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads';
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept only webm files
        if (file.mimetype === 'audio/webm') {
            cb(null, true);
        } else {
            cb(new Error('Only WebM files are allowed'));
        }
    },
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB limit (Whisper's limit)
    }
});

// New endpoint for audio transcription
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No audio file provided'
            });
        }

        const filePath = req.file.path;

        // Create a read stream for the file
        const audioFile = fs.createReadStream(filePath);

        // Call Whisper API
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: 'en', // English specified
            response_format: 'json',
        });

        // Clean up: Delete the temporary file
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
        });

        res.json({
            success: true,
            transcription: transcription.text
        });

    } catch (error) {
        console.error('Transcription error:', error);

        // Clean up on error
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


function sendMessage(command, params) {
    const message = (JSON.stringify({
        message: 'invokeFunction',
        functionName: command,
        params: params
    }));
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Array to hold all connected clients
let clients = [];

// Function to register a new client
function registerClient(ws) {
    clients.push(ws);
}

// Function to remove a client when they disconnect
function unregisterClient(ws) {
    clients = clients.filter(client => client !== ws);
}

// Initialize the assistant and WebSocket server, then start the HTTP server
initializeAssistant()
    .then(() => {
        // Only call listen once after everything is initialized
        app.listen(port, () => {
            console.log(`HTTP server running on port ${port}`);
        });

        // Start WebSocket server on `portWs`
        const wss = new WebSocket.Server({ port: portWs });

        wss.on('connection', (ws) => {
            registerClient(ws);
            console.log('Client connected');

            ws.on('message', (message) => {
                console.log(`Received message from client: ${message}`);
            });
        });
        wss.on('close', () => {
            console.log('Client disconnected');
            unregisterClient(ws); // Unregister the client
        });

        console.log(`WebSocket server running on port ${portWs}`);
    })
    .catch(error => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
