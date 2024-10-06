export const tools = [
    {
        type: "function",
        function: {
            name: "create_rectangle",
            description: "Draws a rectangle of a given size, it takes in the values width, height, xlocation, and ylocation of the top left corner, and an RGBA value. and draws the rectangle on the screen",
            parameters: {
                type: "object",
                properties: {
                    width: {
                        type: "int",
                        description: "width of the rectangle in pixels",
                    },
                    height: {
                        type: "int",
                        description: "height of the rectangle in pixels",
                    },
                    xLocation: {
                        type: "int",
                        description: "x coordinate of the top right corner of the rectangle on the canvas grid where (0,0) is the top left corner",
                    },
                    yLocation: {
                        type: "int",
                        description: "y coordinate of the top right corner of the rectangle on the canvas grid where (0,0) is the top left corner",
                    },
                    color: {
                        type: "array",
                        description: "array containing the red, green, blue, alpha values that define a color and opacity in the form [red, green, blue, alpha]",
                    },
                },
                required: ["order_id"],
                additionalProperties: false,
            },
        }
    }
];

export const create_rectangle = async (width, height, xLocation, yLocation) => {
    
};