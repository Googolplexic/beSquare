const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { tools, create_rectangle } = require('./assistant');
const { initWebSocket } = require('./websocket');
const { create } = require('lodash');

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
                instructions: "You are a helpful assistant integrated with Adobe Express. You help users with their creative tasks and queries. Use tools available to you to accomplish task",
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

        // Add the user's message to the thread
        await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: message
        });

        // Create a run
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: ASSISTANT_ID
        });

        // Poll for the run completion with exponential backoff
        const maxRetries = 10;
        let retryCount = 0;
        let runStatus;

        while (retryCount < maxRetries) {
            runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);

            if (runStatus.status === 'completed') {
                break;
            } else if (runStatus.status === 'failed') {
                throw new Error(`Assistant run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
            } else if (runStatus.status === 'requires_action') {
                const requiredAction = runStatus.required_action;
                if (requiredAction.type === 'submit_tool_outputs') {
                    const toolCalls = requiredAction.submit_tool_outputs.tool_calls;
                    const toolOutputs = await processToolCalls(toolCalls);
                    await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
                        tool_outputs: toolOutputs
                    });
                }
            }


            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay));
            retryCount++;
        }

        if (retryCount === maxRetries) {
            throw new Error('Max retries reached, request timed out');
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

        // Check if it's an OpenAI API error
        if (error.response && error.response.data) {
            console.error('OpenAI API Error:', error.response.data);
        }

        res.status(error.status || 500).json({
            success: false,
            error: error.message,
            details: error.response?.data || 'No additional details available'
        });
    }
});

async function processToolCalls(toolCalls) {
    return await Promise.all(toolCalls.map(async (toolCall) => {
        const { name, arguments: args } = toolCall.function;
        let output;

        try {
            const parsedArgs = JSON.parse(args);

            switch (name) {
                case 'create_rectangle':
                    const { width, height, xLocation, yLocation, color } = parsedArgs;
                    output = await create_rectangle(width, height, xLocation, yLocation, color);
                    break;
                // Add cases for other functions as needed
                default:
                    output = `Function ${name} not implemented`;
            }
        } catch (error) {
            console.error(`Error processing tool call for ${name}:`, error);
            output = `Error: ${error.message}`;
        }

        // Ensure output is always a string
        return {
            tool_call_id: toolCall.id,
            output: typeof output === 'string' ? output : JSON.stringify(output)
        };
    }));
}

async function waitForRunCompletion(threadId, runId) {
    let runStatus;
    do {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
        runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

        if (runStatus.status === 'requires_action') {
            const requiredAction = runStatus.required_action;
            if (requiredAction.type === 'submit_tool_outputs') {
                const toolCalls = requiredAction.submit_tool_outputs.tool_calls;
                const toolOutputs = await processToolCalls(toolCalls);

                console.log('Submitting tool outputs:', toolOutputs); // Log for debugging

                try {
                    await openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
                        tool_outputs: toolOutputs
                    });
                } catch (error) {
                    console.error('Error submitting tool outputs:', error);
                    throw error; // Rethrow to be caught in the main error handler
                }
            }
        }

    } while (['in_progress', 'queued', 'requires_action'].includes(runStatus.status));

    if (runStatus.status === 'failed') {
        throw new Error(`Run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
    }

    return runStatus;
}


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
    const message = JSON.stringify({
        message: 'invokeFunction',
        functionName: command,
        params: params
    });
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
};

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
        app.listen(port, () => {
            console.log(`HTTP server running on port ${port}`);
        });

        // Initialize WebSocket server with a callback function
        initWebSocket(portWs, () => {
            // This function will be called when a client connects
            console.log('Client connected, now it\'s safe to call create_rectangle');
            // Example usage of create_rectangle
            // create_rectangle(100, 100, 100, 100, { red: 1, green: 0, blue: 0, alpha: 1 });
        });
    })
    .catch(error => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
