import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";


addOnUISdk.ready.then(async () => {
    console.log("addOnUISdk is ready for use.");
    // Get the UI runtime.
    const { runtime } = addOnUISdk.instance;
    // Get the proxy object, which is required
    // to call the APIs defined in the Script runtime
    // i.e., in the code.js file of this add-on.
    const scriptApi = await runtime.apiProxy("script");
    
    const createRectangleButton = document.getElementById("createRectangle");
    createRectangleButton.addEventListener("click", async event => {
        scriptApi.setSelectionObjectColorFill({ red: 1, green: 0, blue: 1, alpha: 1 });
    });
    // Request microphone access.
    const microphoneButton = document.getElementById('request-mic');
    const audioOutput = document.getElementById('audio-output');
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

    const gptTranscript = document.getElementById("initAssistant");
    let globalcurrentThreadID = "";
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
    gptsubmit.addEventListener("click", async event => {
        await chatWithAssistant(getValue(),globalcurrentThreadID);
        console.log("sent value = " + getValue());
        console.log("current thread = " + globalcurrentThreadID);
        inputElement.value = "";
    });

    
    // Select the file input and audio player elements
    const fileInput = document.getElementById('fileInput');
    const audioPlayer = document.getElementById('audioPlayer');

    // Listen for changes on the file input
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0]; // Get the first selected file
        if (file && file.type == "audio/mpeg") { // Ensure the file is an MP3
            console.log(file.type);
            const fileURL = URL.createObjectURL(file); // Create a URL for the file
            audioPlayer.src = fileURL; // Set the audio player source to the file
        } else {
            alert('Please upload a valid MP3 file.');
        }
    });

    async function initializeThread() {
        const response = await fetch('http://localhost:3000/api/thread', {
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
        const response = await fetch('http://localhost:3000/api/chat', {
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
    
    // Example usage:
    async function chatWithAssistant(inputm,threadid) {
        try {

            const resp = await sendMessage(threadid,inputm);
            console.log('Assistant: ', resp);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async function transcribeAudio(webmFile) {
        try {
            // Create FormData and append the file
            const formData = new FormData();
            formData.append('audio', webmFile);
    
            // Send the request
            const response = await fetch('http://localhost:3000/api/transcribe', {
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
    // Enable the button only when:
    // 1. addOnUISdk is ready,
    // 2. scriptApi is available, and
    // 3. click event listener is registered.
    createRectangleButton.disabled = false;
    gptTranscript.disabled = false;
    microphoneButton.disabled = false;
});
