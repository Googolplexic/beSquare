tools= [
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
                        type: "array",
                        items: { type: "integer" },
                        description: "Array containing the red, green, blue, and alpha values that define the rectangle color in the format [red, green, blue, alpha] where all componenets are between 0 and 1.",
                    },
                },
                required: ["width", "height", "xLocation", "yLocation", "color"],
                additionalProperties: false,
            },
        }
    }
]



const create_rectangle = async (width, height, xLocation, yLocation, color) => {
    // Your implementation here
};

// Export the function using CommonJS
module.exports = { create_rectangle, tools };