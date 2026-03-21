// Welcome to ucode!
// A lightweight scripting language for embedded systems

let greet = (name) => printf("Hello, %s!\n", name);

greet("ucode");
greet("world");

// ucode supports arrow functions, closures,
// modules, regex, and more.
let features = [
    "Arrow functions",
    "Closures",
    "Module system",
    "Regular expressions",
    "Object literals",
    "Variadic functions",
];

printf("\nLanguage features:\n");
for (let i = 0; i < length(features); i++)
    printf("  • %s\n", features[i]);
