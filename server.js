const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

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

// Initialize the assistant and start the server
initializeAssistant()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch(error => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });