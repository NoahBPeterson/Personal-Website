// Sorting with custom comparators

let fruits = ["banana", "apple", "cherry", "date", "elderberry"];

// Alphabetical sort
let alpha = sort([...fruits], (a, b) => (a > b) - (a < b));
printf("Alphabetical: %s\n", join(", ", alpha));

// Sort by string length
let by_length = sort([...fruits], (a, b) => length(a) - length(b));
printf("By length:    %s\n", join(", ", by_length));

// Numeric sort
let numbers = [42, 7, 13, 99, 1, 55, 23];
let ascending = sort([...numbers], (a, b) => a - b);
let descending = sort([...numbers], (a, b) => b - a);
printf("Ascending:    %s\n", join(", ", map(ascending, x => "" + x)));
printf("Descending:   %s\n", join(", ", map(descending, x => "" + x)));

// Sort objects by property
let people = [
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 },
    { name: "Charlie", age: 35 },
    { name: "Diana", age: 28 },
];

let by_age = sort([...people], (a, b) => a.age - b.age);
for (let i = 0; i < length(by_age); i++)
    printf("  %s (age %d)\n", by_age[i].name, by_age[i].age);
