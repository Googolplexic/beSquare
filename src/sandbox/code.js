import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";


// Get the document sandbox runtime.
const { runtime } = addOnSandboxSdk.instance;


function start() {

    // APIs to be exposed to the UI runtime
    // i.e., to the index.html/index.js file of this add-on.
    const sandboxApi = {

        // Function to get the current page width
        getPageWidth: () => {
            try {
                const currentPage = editor.context.currentPage;
                const pageWidth = currentPage.width;

                // Log the current page width
                console.log(`Current page width: ${pageWidth}`);

                return pageWidth;
            } catch (error) {
                console.error("Error getting page width:", error);
            }
        },

        // Function to get the current page height
        getPageHeight: () => {
            try {
                const currentPage = editor.context.currentPage;
                const pageHeight = currentPage.height;

                // Log the current page height
                console.log(`Current page height: ${pageHeight}`);

                return pageHeight;
            } catch (error) {
                console.error("Error getting page height:", error);
            }
        },

        // Function to create a rectangle
        createRectangle: (width, height, xLocation, yLocation, angle, color) => {
            try {
                // Create a new rectangle
                const rectangle = editor.createRectangle();

                // Define rectangle dimensions
                rectangle.width = width;
                rectangle.height = height;

                // Define rectangle position to center it
                rectangle.translation = { x: xLocation - width / 2, y: yLocation - height / 2 };
                rectangle.setRotationInParent(angle, { x: rectangle.width / 2, y: rectangle.height / 2 });

                // Fill the rectangle with the color passed in the `color` object
                const rectangleFill = editor.makeColorFill(color);
                rectangle.fill = rectangleFill;

                // Add the rectangle to the document
                const insertionParent = editor.context.insertionParent;
                insertionParent.children.append(rectangle);

                console.log("Rectangle created successfully.");
            } catch (error) {
                // Log any errors that occur during the creation of the rectangle
                console.error("Error creating rectangle:", error);
            }
        },

        // Function to create an ellipse
        createEllipse: (width, height, xLocation, yLocation, angle, color) => {
            try {
                // Create a new ellipse
                const ellipse = editor.createEllipse();

                // Define ellipse dimensions
                ellipse.rx = width / 2;
                ellipse.ry = height / 2;

                // Define ellipse position
                ellipse.setPositionInParent({ x: xLocation, y: yLocation }, { x: ellipse.rx, y: ellipse.ry });
                ellipse.setRotationInParent(angle, { x: ellipse.rx, y: ellipse.ry });

                // Fill the ellipse with the color
                const ellipseFill = editor.makeColorFill(color);
                ellipse.fill = ellipseFill;

                // Add the ellipse to the document
                const insertionParent = editor.context.insertionParent;
                insertionParent.children.append(ellipse);

                console.log("Ellipse created successfully.");
            } catch (error) {
                // Log any errors that occur during the creation of the ellipse
                console.error("Error creating ellipse:", error);
            }
        },

        // Function to create a line
        createLine: (xStart, yStart, xEnd, yEnd, width, color) => {
            try {
                // Create a new line
                const line = editor.createLine();

                // Define line start and end points
                line.setEndPoints(xStart, yStart, xEnd, yEnd);

                // Define line stroke
                const stroke = editor.makeStroke({ color, width: width });
                line.stroke = stroke;

                // Add the line to the document
                const insertionParent = editor.context.insertionParent;
                insertionParent.children.append(line);

                console.log("Line created successfully.");
            } catch (error) {
                // Log any errors that occur during the creation of the line
                console.error("Error creating line:", error);
            }
        },

        // Function to create a text node
        createText: (text, xLocation, yLocation, angle) => {
            try {
                // Create a new text node
                const textNode = editor.createText();

                // Set the text content
                textNode.fullContent.text = text;

                // Set the position of the text
                textNode.setPositionInParent({ x: xLocation, y: yLocation }, { x: 0, y: 0 });
                textNode.setRotationInParent(angle, { x: 0, y: 0 });

                // Add the text to the document
                const insertionParent = editor.context.insertionParent;
                insertionParent.children.append(textNode);

                console.log("Text node created successfully.");
            } catch (error) {
                // Log any errors that occur during the creation of the text node
                console.error("Error creating text node:", error);
            }
        },

        // Function to set the fill color of the selected object(s)
        setSelectedFillColor: (red, green, blue, alpha) => {
            try {
                // Ensure there is a selection
                if (editor.context.hasSelection) {
                    const selectedNodes = editor.context.selection;
                    // Loop through the selected nodes
                    selectedNodes.forEach(node => {
                        // Check if the node is fillable
                        if (node.fill !== undefined) {
                            const newFill = editor.makeColorFill({ red, green, blue, alpha });
                            // Apply the new fill to the fillable object
                            node.fill = newFill;
                            console.log(`Updated fillable object ${node.id} fill color.`);
                        } else {
                            console.log(`Node ${node.id} is not fillable.`);
                        }
                    });
                } else {
                    console.log("No nodes selected.");
                }
            } catch (error) {
                // Log any errors that occur during the fill color update
                console.error("Error setting fill color:", error);
            }
        },

        // Function to set the text content of the selected object(s)
        setSelectionTextContent: (text) => {
            try {
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
            } catch (error) {
                // Log any errors that occur during the text content update
                console.error("Error setting text content:", error);
            }
        },
        // Function to add a new page with specified width, height, and background color
        addNewPage: (pageWidth, pageHeight, color) => {
            console.log("Creating a new page with the specified width, height, and background color.");
            try {
                // Create a new page with the specified width and height
                const newPage = editor.documentRoot.pages.addPage({
                    width: pageWidth,
                    height: pageHeight
                });

                // Set the background color for the page's artboard
                const artboard = newPage.artboards.first;

                const fillColor = {
                    red: color.red,
                    green: color.green,
                    blue: color.blue,
                    alpha: color.alpha
                };

                const backgroundFill = editor.makeColorFill(fillColor);
                artboard.fill = backgroundFill; // Apply the fill color to the artboard background

                console.log(`Created page with size (${pageWidth}x${pageHeight}) and background color.`);

                return newPage; // Return the created page if needed
            } catch (error) {
                console.error("Error creating page:", error);
            }
        },


        // Function to delete all selected objects
        deleteSelectedObjects: () => {
            try {
                // Check if there is a selection
                if (editor.context.hasSelection) {
                    const selectedObjects = editor.context.selection;
                    console.log(`Deleting ${selectedObjects.length} selected objects.`);

                    selectedObjects.forEach(node => {
                        // Remove the node from its parent, effectively deleting it
                        node.removeFromParent();
                        console.log(`Deleted node with ID: ${node.id}`);
                    });
                } else {
                    console.log("No nodes selected.");
                }
            } catch (error) {
                console.error("Error deleting selected objects:", error);
            }
        },

        // Function to move all selected objects by a delta
        moveBySelectedObjects: (deltaX, deltaY) => {
            try {
                if (editor.context.hasSelection) {
                    const selectedObjects = editor.context.selection;
                    console.log(`Moving ${selectedObjects.length} selected objects by (${deltaX}, ${deltaY}).`);

                    selectedObjects.forEach(node => {
                        // Update the translation of each selected object
                        node.translation = { x: node.translation.x + deltaX, y: node.translation.y + deltaY };
                        console.log(`Moved node with ID: ${node.id} to new position (${node.translation.x}, ${node.translation.y}).`);
                    });
                } else {
                    console.log("No objects selected.");
                }
            } catch (error) {
                console.error("Error moving selected objects:", error);
            }
        },

        // Function to move all selected objects to a target position
        moveToSelectedObjects: (targetX, targetY) => {
            try {
                if (editor.context.hasSelection) {
                    const selectedObjects = editor.context.selection;
                    console.log(`Moving ${selectedObjects.length} selected objects to position (${targetX}, ${targetY}).`);

                    selectedObjects.forEach(node => {
                        // Update the translation of each selected object to the target position
                        node.translation = { x: targetX, y: targetY };
                        console.log(`Moved node with ID: ${node.id} to new position (${targetX}, ${targetY}).`);
                    });
                } else {
                    console.log("No objects selected.");
                }
            } catch (error) {
                console.error("Error moving selected objects:", error);
            }
        },

        // Function to rotate all selected objects by a specified angle
        rotateSelectedObjects: (angle) => {
            try {
                // Check if there are any selected nodes
                if (editor.context.hasSelection) {
                    const selectedObjects = editor.context.selection;

                    // Rotate each selected object
                    selectedObjects.forEach(node => {
                        // Rotate the node by the specified angle
                        node.setRotationInParent(angle, { x: node.width / 2, y: node.height / 2 }); // Rotate around the center
                        console.log(`Rotated node with ID: ${node.id} by ${angle} degrees.`);
                    });
                } else {
                    console.log("No objects selected to rotate.");
                }
            } catch (error) {
                console.error("Error rotating selected objects:", error);
            }
        }
    };
    // Expose sandboxApi to the UI runtime.
    runtime.exposeApi(sandboxApi);
}

// Start the sandbox.
start();
