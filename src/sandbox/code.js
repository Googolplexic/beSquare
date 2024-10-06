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
        getPageWidth: () => {
            try {
                // Get the current page
                const currentPage = editor.context.currentPage;

                // Get the width of the current page
                const pageWidth = currentPage.width;

                console.log(`Current page width: ${pageWidth}`);

                return pageWidth;
            } catch (error) {
                console.error("Error getting page width:", error);
            }
        },
        getPageHeight: () => {
            try {
                // Get the current page
                const currentPage = editor.context.currentPage;

                // Get the height of the current page
                const pageHeight = currentPage.height;

                console.log(`Current page height: ${pageHeight}`);

                return pageHeight;
            } catch (error) {
                console.error("Error getting page height:", error);
            }
        },
        createRectangle: (width, height, xLocation, yLocation, color) => {
            console.log("Creating rectangle");
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
            ellipse.rx = width / 2;
            ellipse.ry = height / 2;
            // Define ellipse position.
            ellipse.setPositionInParent({x:xLocation, y:yLocation}, {x:ellipse.rx, y:ellipse.ry});
            // Fill the ellipse with the color.
            const ellipseFill = editor.makeColorFill(color);
            ellipse.fill = ellipseFill;
            // Add the ellipse to the document.
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(ellipse);
        },
        createLine: (xStart, yStart, xEnd, yEnd, width, color) => {
            const line = editor.createLine();
            // Define line start and end points.
            line.setEndPoints(xStart, yStart, xEnd, yEnd);
            // Define line stroke.
            const stroke = editor.makeStroke({ color, width: width });
            line.stroke = stroke;
            // Add the line to the document.
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(line);
        },
        createText: (text, xLocation, yLocation, color, size) => {
            const textNode = editor.createText();

            // Set the text content
            textNode.fullContent.text = text;

            // Set the position of the text
            textNode.setPositionInParent({ x: xLocation, y: yLocation }, { x: 0, y: 0 });

            // Set the font size
            textNode.characterStyles.fontSize = size;

            textNode.characterStyles.color = color;
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
