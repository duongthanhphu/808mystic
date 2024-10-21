// Define the type of the colors object explicitly
const colors: Record<'gray' | 'red' | 'pink' | 'grape' | 'violet' | 'indigo' | 'cyan' | 'green' | 'lime' | 'yellow' | 'orange', string> = {
    red: "red",
    pink: "pink",
    grape: "grape",
    violet: "violet",
    indigo: "indigo",
    cyan: "cyan",
    green: "green",
    lime: "lime",
    yellow: "yellow",
    orange: "orange"
};

// Function to pick a random color from the colors object
const getRandomColor = (): keyof typeof colors => {
    const colorKeys = Object.keys(colors) as (keyof typeof colors)[];
    const randomIndex = Math.floor(Math.random() * colorKeys.length);
    return colorKeys[randomIndex];
};


export {
    getRandomColor
}