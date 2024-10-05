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
        await scriptApi.createRectangle();
    });
    // Request microphone access.
    const microphoneButton = document.getElementById('request-mic');
    microphoneButton.addEventListener('click', async event => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone access granted', stream);
        } catch (error) {
            console.error('Microphone access denied', error);
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
    startButton.disabled = false;
    stopButton.disabled = false;
});
