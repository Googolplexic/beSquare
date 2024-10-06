// assistant.js
const { sendMessage } = require('./websocket');

const tools = [
{
    "type": "function",
    "function": {
        "name": "create_rectangle",
        "description": "Draws a rectangle of a given size and color on the screen. It takes the width and height of the rectangle in pixels, the x and y coordinates for the top left corner, and an RGBA color value.",
        "parameters": {
            "type": "object",
            "properties": {
                "width": {
                    "type": "integer",
                    "description": "Width of the rectangle in pixels."
                },
                "height": {
                    "type": "integer",
                    "description": "Height of the rectangle in pixels."
                },
                "xLocation": {
                    "type": "integer",
                    "description": "X coordinate of the top left corner of the rectangle on the canvas grid (0,0 is the top left)."
                },
                "yLocation": {
                    "type": "integer",
                    "description": "Y coordinate of the top left corner of the rectangle on the canvas grid (0,0 is the top left)."
                },
                "color": {
                    "type": "object",
                    "properties": {
                        "red": {
                            "type": "number",
                            "description": "Red component of the color (0 to 1)."
                        },
                        "green": {
                            "type": "number",
                            "description": "Green component of the color (0 to 1)."
                        },
                        "blue": {
                            "type": "number",
                            "description": "Blue component of the color (0 to 1)."
                        },
                        "alpha": {
                            "type": "number",
                            "description": "Alpha component of the color (0 for transparent to 1 for opaque)."
                        }
                    },
                    "required": ["red", "green", "blue", "alpha"],
                    "additionalProperties": false
                }
            },
            "required": ["width", "height", "xLocation", "yLocation", "color"],
            "additionalProperties": false
        }
    }
},

{
    "type": "function",
    "function": {
        "name": "create_ellipse",
        "description": "Draws a ELLIPSE or circle of a given size and color on the screen. It takes the width and height of the ellipse in pixels, the x and y coordinates for the top left corner, and an RGBA color value.",
        "parameters": {
            "type": "object",
            "properties": {
                "width": {
                    "type": "integer",
                    "description": "Width of the ellipse in pixels."
                },
                "height": {
                    "type": "integer",
                    "description": "Height of the ellipse in pixels."
                },
                "xLocation": {
                    "type": "integer",
                    "description": "X coordinate of the top left corner of the ellipse on the canvas grid (0,0 is the top left)."
                },
                "yLocation": {
                    "type": "integer",
                    "description": "Y coordinate of the top left corner of the ellipse on the canvas grid (0,0 is the top left)."
                },
                "color": {
                    "type": "object",
                    "properties": {
                        "red": {
                            "type": "number",
                            "description": "Red component of the color (0 to 1)."
                        },
                        "green": {
                            "type": "number",
                            "description": "Green component of the color (0 to 1)."
                        },
                        "blue": {
                            "type": "number",
                            "description": "Blue component of the color (0 to 1)."
                        },
                        "alpha": {
                            "type": "number",
                            "description": "Alpha component of the color (0 for transparent to 1 for opaque)."
                        }
                    },
                    "required": ["red", "green", "blue", "alpha"],
                    "additionalProperties": false
                }
            },
            "required": ["width", "height", "xLocation", "yLocation", "color"],
            "additionalProperties": false
        }
    }
}
];

function create_rectangle(width, height, xLocation, yLocation, color) {
    const command = 'createRectangle';
    const params = { width, height, xLocation, yLocation, color };
    sendMessage(command, params);
    return `Created a rectangle with dimensions ${width}x${height} at position (${xLocation}, ${yLocation}) with color RGBA(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})`;
}


function create_ellipse(width, height, xLocation, yLocation, color) {
    const command = 'createEllipse';
    const params = { width, height, xLocation, yLocation, color };
    sendMessage(command, params);
    return `Created a ellipse with dimensions ${width}x${height} at position (${xLocation}, ${yLocation}) with color RGBA(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})`;
}

module.exports = { tools, create_rectangle, create_ellipse };