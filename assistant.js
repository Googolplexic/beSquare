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
                        type: "object",
                        items: { red, green, blue, alpha },
                        description: "Array containing the red, green, blue, and alpha values that define the rectangle color in the format [red, green, blue, alpha] where all componenets are between 0 and 1.",
                    },
                },
                required: ["width", "height", "xLocation", "yLocation", "color"],
                additionalProperties: false,
            },
        }
    }
]

// trigger.js modified

const messageSender = require('./server');

// Example function to simulate an event that triggers a message
function create_rectangle(width, height, xLocation, yLocation, color) {
    // For demonstration, let's send an "add" command with random numbers
    const command = 'create_rectangle';
    const params = {width, height, xLocation, yLocation, color};
    
    // Call the sendMessage function in the messageSender module
    messageSender.sendMessage(command, params);
}



// const create_rectangle = async (width, height, xLocation, yLocation, color) => {
    
// };

// Export the function using CommonJS
module.exports = { create_rectangle, tools };