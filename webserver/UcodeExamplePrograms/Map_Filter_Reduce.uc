// Functional programming with map, filter, and a custom reduce

function reduce(arr, fn, init) {
    let acc = init;
    for (let i = 0; i < length(arr); i++)
        acc = fn(acc, arr[i]);
    return acc;
};

let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Square all numbers
let squares = map(numbers, x => x * x);
printf("Squares: %s\n", join(", ", map(squares, x => "" + x)));

// Filter to evens only
let evens = filter(numbers, x => x % 2 == 0);
printf("Evens: %s\n", join(", ", map(evens, x => "" + x)));

// Sum with reduce
let sum = reduce(numbers, (acc, x) => acc + x, 0);
printf("Sum of 1..10: %d\n", sum);

// Product with reduce
let product = reduce(numbers, (acc, x) => acc * x, 1);
printf("Product of 1..10: %d\n", product);

// Chain: sum of squares of even numbers
let result = reduce(
    map(
        filter(numbers, x => x % 2 == 0),
        x => x * x
    ),
    (acc, x) => acc + x,
    0
);
printf("Sum of squares of evens: %d\n", result);
