// assistant.js
const { create } = require('lodash');
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
            "name": "create_line",
            "description": "Creates a line from a starting point to an ending point with a specified stroke width and color",
            "parameters": {
                "type": "object",
                "properties": {
                    "xStart": {
                        "type": "number",
                        "description": "The x-coordinate of the starting point"
                    },
                    "yStart": {
                        "type": "number",
                        "description": "The y-coordinate of the starting point"
                    },
                    "xEnd": {
                        "type": "number",
                        "description": "The x-coordinate of the ending point"
                    },
                    "yEnd": {
                        "type": "number",
                        "description": "The y-coordinate of the ending point"
                    },
                    "width": {
                        "type": "number",
                        "description": "The stroke width of the line"
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
                "required": ["xStart", "yStart", "xEnd", "yEnd", "width","color"]
            }
        }
    },


    {
        "type": "function",
        "function": {
            "name": "create_ellipse",
            "description": "Draws a ELLIPSE or circle of a given size and color on the screen. It takes the width and height of the ellipse in pixels, the x and y coordinates, and an RGBA color value. If only one size value is given, then assume circle and have same width and height. Top left is (0,0) circles placed in 'top left' be offset so circle is fully visible",
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
                        "description": "X coordinate of the center the ellipse on the canvas grid (0,0 is the top left)."
                    },
                    "yLocation": {
                        "type": "integer",
                        "description": "Y coordinate of the center of the ellipse on the canvas grid (0,0 is the top left)."
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
            "name": "create_text",
            "description": "creates a text element on the page at a certain location, and of a certain color",
            "parameters": {
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "content of the text element to be displayed"
                    },
                    "xLocation": {
                        "type": "integer",
                        "description": "X coordinate of the top left of the text (0,0 is the top left of the canvas grid)."
                    },
                    "yLocation": {
                        "type": "integer",
                        "description": "Y coordinate of the top left of the text (0,0 is the top left of the canvas grid)."
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
                    },
                    "size": {
                        "type": "integer",
                        "description": "size of the text in pt"
                    }
                },
                "required": ["text", "size", "xLocation", "yLocation", "color"],
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

function create_text(text, xLocation, yLocation, color, size) {
    const command = 'createText';
    const params = { text, xLocation, yLocation, color, size };
    sendMessage(command, params);
    return `Created text with content "$${text}" at position (${xLocation}, ${yLocation}) with color RGBA(${color.red}, ${color.green}, ${color.blue}, ${color.alpha}) and size ${size}`;
}

function create_line(xStart, yStart, xEnd, yEnd, width, color) {
    const command = 'createLine';
    const params = { xStart, yStart, xEnd, yEnd, width, color };
    sendMessage(command, params);
    return `Created a line from (${xStart}, ${yStart}) to (${xEnd}, ${yEnd}) with a stroke width of ${width} and color RGBA(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})`;
}
module.exports = { tools, create_rectangle, create_line, create_ellipse, create_text };
