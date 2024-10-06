// assistant.js
const { sendMessage } = require('./websocket');

const tools = [
    {
        type: "function",
        function: {
            name: "create_rectangle",
            description: "Draws a rectangle of a given size. It takes in the values width, height, xLocation, and yLocation of the top left corner, and an RGBA value to draw the rectangle on the screen.",
            parameters: {
                type: "object",
                properties: {
                    width: {
                        type: "integer",
                        description: "Width of the rectangle in pixels.",
                    },
                    height: {
                        type: "integer",
                        description: "Height of the rectangle in pixels.",
                    },
                    xLocation: {
                        type: "integer",
                        description: "X coordinate of the top left corner of the rectangle on the canvas grid (0,0 is the top left).",
                    },
                    yLocation: {
                        type: "integer",
                        description: "Y coordinate of the top left corner of the rectangle on the canvas grid (0,0 is the top left).",
                    },
                    color: {
                        type: "object",
                        description: "Object containing the red, green, blue, and alpha values that define the rectangle color, where all components are between 0 and 1.",
                    },
                },
                required: ["width", "height", "xLocation", "yLocation", "color"],
                additionalProperties: false,
            },
        }
    }
];

function create_rectangle(width, height, xLocation, yLocation, color) {
    const command = 'createRectangle';
    const params = { width, height, xLocation, yLocation, color };
    sendMessage(command, params);
}

module.exports = { tools, create_rectangle };