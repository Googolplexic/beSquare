import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";


addOnUISdk.ready.then(async () => {
    console.log("addOnUISdk is ready for use.");
    // Get the UI runtime.
    const { runtime } = addOnUISdk.instance;
    // Get the proxy object, which is required
    // to call the APIs defined in the Script runtime
    // i.e., in the code.js file of this add-on.
    const scriptApi = await runtime.apiProxy("script");

    // Request microphone access.
    const microphoneButton = document.getElementById('request-mic');
    let mediaRecorder; // To record audio
    let audioChunks = []; // To store audio chunks
    let stream; // Variable to hold the audio stream

    microphoneButton.addEventListener('click', async event => {
        const isOn = microphoneButton.getAttribute("isOn") === "true"; // Corrected comparison

        if (!isOn) { // Microphone is off, enable it
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                console.log('Microphone access granted', stream);
                microphoneButton.setAttribute("isOn", "true");
                microphoneButton.textContent = "Process Voice";

                // Start recording
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();

                // Store the audio data when available
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };

                // When recording stops, process the audio
                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); // Create blob from audio chunks
                    const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' }); // Convert blob to file
                    audioChunks = []; // Reset chunks for next recording
                    const inputElement = document.getElementById('userInput');
                    let transcbd = await transcribeAudio(file);
                    inputElement.value = transcbd;

                };
            } catch (error) {
                console.error('Microphone access denied', error);
            }
        } else { // Microphone is on, disable it
            try {
                if (stream) {
                    mediaRecorder.stop(); // Stop the recording
                    stream.getTracks().forEach(track => track.stop()); // Stop the media tracks
                    console.log('Microphone access deactivated');
                }
                microphoneButton.setAttribute("isOn", "false");
                microphoneButton.textContent = "Voice Command";

            } catch (error) {
                console.error('Microphone access cannot be turned off', error);
            }
        }

    });
    microphoneButton.disabled = false;



    const ws = new WebSocket('ws://localhost:5001');

    // WebSocket message handler
    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.message === 'invokeFunction') {
            const { functionName, params } = data;
            console.log(`Invoking function ${functionName} with params:`);
            // Check if the function exists in scriptApi and invoke it
            if (typeof scriptApi[functionName] === 'function') {
                console.log("Match found");
                console.log(params);
                scriptApi[functionName](...Object.values(params));
            } else {
                console.error(`Function ${functionName} does not exist on scriptApi`);
            }
        }
    };

    ws.onopen = () => {
        console.log('Connected to WebSocket server');
    };

    ws.onclose = () => {
        console.log('Disconnected from WebSocket server');
    };

    // Define the function to be called with parameters
    function myClientFunction(num, str) {
        console.log(`Client function invoked! Params: num=${num}, str=${str}`);
    }


    const readly = document.getElementById("readOnly");



    const gptTranscript = document.getElementById("initThread");
    //make thread

    let globalcurrentThreadID = "";
    globalcurrentThreadID = initializeThread();

    gptTranscript.addEventListener("click", async event => {
        const threadID = await initializeThread();
        console.log(threadID);
        globalcurrentThreadID = threadID;
    });

    //gets value of userInput
    const getValue = () => {
        const inputElement = document.getElementById('userInput');
        return inputElement.value;
    };

    //listen for changes in userInput
    const inputElement = document.getElementById('userInput');
    inputElement.addEventListener('input', (event) => {
        const currentValue = event.target.value;
        console.log('Input value:', currentValue);
    });

    const gptsubmit = document.getElementById("sendButton");
    let isWaitingForResponse = false;

    gptsubmit.addEventListener("click", async event => {
        if (isWaitingForResponse) return; // Prevent multiple clicks while waiting

        try {
            isWaitingForResponse = true;
            gptsubmit.disabled = true; // Disable the button
            gptsubmit.textContent = "Sending..."; // Optional: update button text

            await chatWithAssistant(getValue(), globalcurrentThreadID);
            console.log("sent value = " + getValue());
            console.log("current thread = " + globalcurrentThreadID);
            inputElement.value = "";
        } catch (error) {
            console.error("Error in chat:", error);
            // Optionally display error to user
        } finally {
            isWaitingForResponse = false;
            gptsubmit.disabled = false;
            gptsubmit.textContent = "Send"; // Reset button text
        }
    });

    async function chatWithAssistant(inputm, threadid) {
        try {
            const response = await sendMessage(threadid, inputm);
            console.log('Assistant: ', response);
            // Update UI with response
            readly.textContent = response;
        } catch (error) {
            console.error("Error:", error);
            throw error; // Rethrow to be caught in the click handler
        }
    }

    const cancelsel = document.getElementById("discardCommand");
    cancelsel.addEventListener("click", async event => {
        inputElement.value = "";
    });


    async function initializeThread() {
        const response = await fetch('http://localhost:3001/api/thread', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.threadId;
    }

    async function sendMessage(threadId, message) {
        const response = await fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                threadId,
                message
            })
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.response;
    }


    async function transcribeAudio(webmFile) {
        try {
            // Create FormData and append the file
            const formData = new FormData();
            formData.append('audio', webmFile);

            // Send the request
            const response = await fetch('http://localhost:3001/api/transcribe', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            return data.transcription;

        } catch (error) {
            console.error('Transcription failed:', error);
            throw error;
        }
    }

    //usage in adobe express add-on:
    async function handleAudioTranscription(webmBlob) {
        try {
            // Create a File object from the Blob if needed
            const webmFile = new File([webmBlob], 'audio.webm', {
                type: 'audio/webm'
            });

            const transcription = await transcribeAudio(webmFile);
            console.log('Transcription:', transcription);

            // Do something with the transcription...

        } catch (error) {
            console.error('Error:', error);
        }
    }


});
