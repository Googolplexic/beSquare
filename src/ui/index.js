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
        console.log("sajdjasdjadsjajdsjdasjdas");
    });
    // Enable the button only when:
    // 1. addOnUISdk is ready,
    // 2. scriptApi is available, and
    // 3. click event listener is registered.
    createRectangleButton.disabled = false;
    gptTranscript.disabled = false;
});
