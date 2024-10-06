import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";


// import fs from "fs";
//import OpenAI from "openai";
// Get the document sandbox runtime.




const { runtime } = addOnSandboxSdk.instance;
function start() {
    // APIs to be exposed to the UI runtime
    // i.e., to the index.html file of this add-on.
    const sandboxApi = {
        createRectangle: () => {
            const rectangle = editor.createRectangle();
            // Define rectangle dimensions.
            rectangle.width = 240;
            rectangle.height = 180;
            // Define rectangle position.
            rectangle.translation = { x: 10, y: 10 };
            // Define rectangle color.
            const color = { red: 0.32, green: 0.34, blue: 0.89, alpha: 1 };
            // Fill the rectangle with the color.
            const rectangleFill = editor.makeColorFill(color);
            rectangle.fill = rectangleFill;
            // Add the rectangle to the document.
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(rectangle);
        },
        // poop: () => {
        //     const openai = new OpenAI();

        //     async function main() {
        //         const transcription = await openai.audio.transcriptions.create({
        //         file: a,
        //         model: "whisper-1",
        //         response_format: "text",
        //         });
            
        //         console.log(transcription.text);
        //     }
        //     main();

        // },
        // filered: () => {
        //     const file = event.target.files[0];
        //     const reader = new FileReader();

        //     reader.onload = (e) => {
        //         // e.target.result contains the file's content as a string
        //         console.log(e.target.result);
        //     };

        //     reader.readAsText(file); // Read the file as text
        // }
        

    };
    // Expose sandboxApi to the UI runtime.
    runtime.exposeApi(sandboxApi);
}


start();
