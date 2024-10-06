import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";
// Get the document sandbox runtime.
const { runtime } = addOnSandboxSdk.instance;


function start() {
    // APIs to be exposed to the UI runtime
    // i.e., to the index.html file of this add-on.

    const sandboxApi = {
        createRectangle: (width, height, xLocation, yLocation, color) => {
            const rectangle = editor.createRectangle();
            
            // Define rectangle dimensions.
            rectangle.width = width;
            rectangle.height = height;
            
            // Define rectangle position.
            rectangle.translation = { x: xLocation, y: yLocation };
            
            // Fill the rectangle with the color passed in the `color` object.
            const rectangleFill = editor.makeColorFill(color);
            rectangle.fill = rectangleFill;
            
            // Add the rectangle to the document.
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(rectangle);
        },
        createEllipse: (width, height, xLocation, yLocation, color) => {
            const ellipse = editor.createEllipse();
            // Define ellipse dimensions.
            ellipse.radiusX = width / 2;
            ellipse.radiusY = height / 2;
            // Define ellipse position.
            ellipse.translation = { x: xLocation, y: yLocation };
            // Fill the ellipse with the color.
            const ellipseFill = editor.makeColorFill(color);
            ellipse.fill = ellipseFill;
            // Add the ellipse to the document.
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(ellipse);
        },  
        createLine: (xStart, yStart, xEnd, yEnd, color) => {
            const line = editor.createLine();
            // Define line start and end points.
            line.start = { x: xStart, y: yStart };
            line.end = { x: xEnd, y: yEnd };
            // Define line stroke.
            const stroke = editor.makeStroke({ color, width: 2 });
            line.stroke = stroke;
            // Add the line to the document.
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(line);
        },
        createText: (text, xLocation, yLocation, color) => {
            const textNode = editor.createText();
            // Set the text content.
            textNode.text = text;
            // Define text position.
            textNode.translation = { x: xLocation, y: yLocation };
            // Set the text color.
            const textColor = editor.makeColorFill(color);
            textNode.fill = textColor;
            // Add the text to the document.
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(textNode);
        },
        setSelectionObjectColorFill: ({ red, green, blue, alpha }) => {
            // Ensure there is a selection
            if (editor.context.hasSelection) {
                const selectedNodes = editor.context.selection;
                // Loop through the selected nodes
                selectedNodes.forEach(node => {
                    // Check if the node is a rectangle
                    console.log("Good so far??");
                    if (node.type) {
                        console.log("Good so far");
                        // Create a new color (e.g., red)
                        console.log("Good so far");
                        const newFill = editor.makeColorFill({ red, green, blue, alpha });
                        console.log("Good so far");
                        // Create a fill with the new color

                        // Apply the new fill to the rectangle
                        node.fill = newFill;

                        console.log(`Updated rectangle ${node.id} fill to red.`);
                    } else {
                        console.log("Good so far??");
                        console.log(`Node ${node.id} is not a rectangle.`);
                    }
                });
            } else {
                console.log("No nodes selected.");
            }
        },
        setSelectionTextContent: (text) => {
            if (editor.context.hasSelection) {
                const selectedNodes = editor.context.selection;
                selectedNodes.forEach(node => {
                    if (node.type === "Text") {
                        node.text = text;
                        console.log(`Updated text ${node.id} content to ${text}.`);
                    } else {
                        console.log(`Node ${node.id} is not a text node.`);
                    }
                });
            } else {
                console.log("No nodes selected.");
            }
        },
        setFontSize: (textNode, size) => {
            textNode.characterStyle.fontSize = size;
        },
        setFont: (textNode, font) => {
            textNode.characterStyle.font = font;
        },  
        setObjectStroke: (object, color) => {
            const stroke = editor.makeStroke({ color, width: 2 });
            object.stroke = stroke;
        },

        setObjectAsSelected: (object) => {
            editor.context.selection = object;
        },
        addNewPage: (width, height) => {
            const newArtboard = editor.documentRoot.pages.addPage({ width: width, height: height });
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(newArtboard);
        }

    };
    // Expose sandboxApi to the UI runtime.
    runtime.exposeApi(sandboxApi);
}
start();
