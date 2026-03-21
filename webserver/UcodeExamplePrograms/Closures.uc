// Closures and higher-order functions

// Counter with closure
function make_counter(start) {
    let n = start;
    return {
        next: () => n++,
        peek: () => n,
        reset: () => { n = start; },
    };
};

let c = make_counter(1);
printf("Counter: %d, %d, %d\n", c.next(), c.next(), c.next());
printf("Peek: %d\n", c.peek());
c.reset();
printf("After reset: %d\n", c.next());

// Memoize — generic caching wrapper
function memoize(fn) {
    let cache = {};
    return function(x) {
        let key = "" + x;
        if (!exists(cache, key))
            cache[key] = fn(x);
        return cache[key];
    };
};

let slow_square = memoize(function(x) {
    printf("  Computing %d²...\n", x);
    return x * x;
});

printf("\nMemoized calls:\n");
printf("square(5) = %d\n", slow_square(5));
printf("square(5) = %d (cached)\n", slow_square(5));
printf("square(3) = %d\n", slow_square(3));

// Partial application
function partial(fn, a) {
    return (b) => fn(a, b);
};

let add = (a, b) => a + b;
let add10 = partial(add, 10);
printf("\nadd10(5) = %d\n", add10(5));
printf("add10(20) = %d\n", add10(20));
