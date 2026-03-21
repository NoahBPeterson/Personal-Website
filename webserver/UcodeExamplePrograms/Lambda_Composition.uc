// Function composition with lambdas
let compose = (f, g) => (x) => f(g(x));

let double = x => x * 2;
let increment = x => x + 1;
let square = x => x * x;

let doubleAndIncrement = compose(increment, double);
let squareAndDouble = compose(double, square);

printf("double(5) = %d\n", double(5));
printf("doubleAndIncrement(5) = %d\n", doubleAndIncrement(5));
printf("squareAndDouble(4) = %d\n", squareAndDouble(4));

// Pipeline: apply a list of transforms
function pipeline(value, transforms) {
    let result = value;
    for (let i = 0; i < length(transforms); i++)
        result = transforms[i](result);
    return result;
};

let result = pipeline(3, [double, increment, square]);
printf("pipeline(3, [double, inc, square]) = %d\n", result);
