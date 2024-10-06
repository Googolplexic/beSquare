import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";
// Get the document sandbox runtime.
const { runtime } = addOnSandboxSdk.instance;

function start() {
    // APIs to be exposed to the UI runtime
    // i.e., to the index.html file of this add-on.

    const sandboxApi = {
        createRectangle: (width, height, xLocation, yLocation, {red, green, blue, alpha }) => {
            const rectangle = editor.createRectangle();
            // Define rectangle dimensions.
            rectangle.width = width;
            rectangle.height = height;
            // Define rectangle position.
            rectangle.translation = { x: xLocation, y: yLocation };
            // Fill the rectangle with the color.
            const rectangleFill = editor.makeColorFill({red, green, blue, alpha});
            rectangle.fill = rectangleFill;
            // Add the rectangle to the document.
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(rectangle);
        }

        
    };
    // Expose sandboxApi to the UI runtime.
    runtime.exposeApi(sandboxApi);
}
start();
