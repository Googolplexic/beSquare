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

    const gptTranscript = document.getElementById("gpttranslate");
    gptTranscript.addEventListener("click", async event => {
        //await scriptApi.poop();
        const repon = await callOpenAI("how's the weather?");
        console.log(repon);
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

    async function callOpenAI(userPrompt) {
        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    prompt: userPrompt 
                })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Unknown error occurred');
            }
            
            return data.response;
        } catch (error) {
            console.error('Error calling OpenAI:', error);
            throw error;
        }
    }
    
    // // Example usage:
    // try {
    //     const response = await callOpenAI("Tell me a joke about programming");
    //     console.log(response);
    // } catch (error) {
    //     console.error("Failed to get response:", error);
    // }
    // Enable the button only when:
    // 1. addOnUISdk is ready,
    // 2. scriptApi is available, and
    // 3. click event listener is registered.
    createRectangleButton.disabled = false;
    gptTranscript.disabled = false;

});
