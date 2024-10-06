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
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); // Create blob from audio chunks
                    const audioUrl = URL.createObjectURL(audioBlob); // Create URL for audio blob
                    audioOutput.src = audioUrl; // Set audio element source to the recorded audio
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


        // Voice Command Activation
        const startButton = document.getElementById('startBtn');
        startButton.addEventListener('click', async event => {
            await scriptApi.startAudioRecording();
        });

        // Voice Command Deactivation
        const stopButton = document.getElementById('stopBtn');
        stopButton.addEventListener('click', async event => {
            await scriptApi.stopAudioRecording();
        });

    });
    // Enable the button only when:
    // 1. addOnUISdk is ready,
    // 2. scriptApi is available, and
    // 3. click event listener is registered.
    createRectangleButton.disabled = false;
    microphoneButton.disabled = false;
});
