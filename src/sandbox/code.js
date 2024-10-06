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
        },
        createEllipse: (width, height, xLocation, yLocation, {red, green, blue, alpha }) => {
            const ellipse = editor.createEllipse();
            // Define ellipse dimensions.
            ellipse.radiusX = width / 2;
            ellipse.radiusY = height / 2;
            // Define ellipse position.
            ellipse.translation = { x: xLocation, y: yLocation };
            // Fill the ellipse with the color.
            const ellipseFill = editor.makeColorFill({red, green, blue, alpha});
            ellipse.fill = ellipseFill;
            // Add the ellipse to the document.
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(ellipse);
        },  
        createLine: (xStart, yStart, xEnd, yEnd, {red, green, blue, alpha }) => {
            const line = editor.createLine();
            // Define line start and end points.
            line.start = { x: xStart, y: yStart };
            line.end = { x: xEnd, y: yEnd };
            // Define line stroke.
            const stroke = editor.makeStroke({ color: {red, green, blue, alpha}, width: 2 });
            line.stroke = stroke;
            // Add the line to the document.
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(line);
        },
        createText: (text, xLocation, yLocation, {red, green, blue, alpha }) => {
            const textNode = editor.createText();
            // Set the text content.
            textNode.text = text;
            // Define text position.
            textNode.translation = { x: xLocation, y: yLocation };
            // Set the text color.
            const textColor = editor.makeColorFill({red, green, blue, alpha});
            textNode.fill = textColor;
            // Add the text to the document.
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(textNode);
        },

        setObjectFillColor: (object, {red, green, blue, alpha }) => {
            const fill = editor.makeColorFill({red, green, blue, alpha});
            object.fill = fill;
        },
        setTextContent: (textNode, text) => {
            textNode.text = text;
        },
        setTextFillColor: (textNode, {red, green, blue, alpha }) => {
            const fill = editor.makeColorFill({red, green, blue, alpha});
            textNode.fill = fill;
        },
        setFontSize: (textNode, size) => {
            textNode.characterStyle.fontSize = size;
        },
        setFont: (textNode, font) => {
            textNode.characterStyle.font = font;
        },  
        setObjectStroke: (object, {red, green, blue, alpha }) => {
            const stroke = editor.makeStroke({ color: {red, green, blue, alpha}, width: 2 });
            object.stroke = stroke;
        },
        getCurrentSelection: () => {
            const selectedObjects = editor.context.selection;
            return selectedObjects;
        },
        setObjectAsSelected: (object) => {
            editor.context.selection = object;
        },
        addNewPage(width, height) {
            const newArtboard = editor.documentRoot.pages.addPage({ width: width, height: height });
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(newArtboard);
        }
    };
    // Expose sandboxApi to the UI runtime.
    runtime.exposeApi(sandboxApi);
}
start();
