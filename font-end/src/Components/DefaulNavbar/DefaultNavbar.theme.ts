// theme.js
import { createTheme, MantineColorsTuple } from '@mantine/core';

const myColor: MantineColorsTuple = [
  "#ebf6ff",
  "#d5eafa",
  "#a6d4f7",
  "#74bdf6",
  "#52a9f5",
  "#409df5",
  "#3697f6",
  "#2a83db",
  "#1f75c4",
  "#0064ad"
]

const theme = createTheme({
    colors: {
        myColor,
    },
});

export default theme;
