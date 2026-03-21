// Fibonacci: iterative and recursive with memoization

// Iterative
function fib_iter(n) {
    let a = 0, b = 1;
    for (let i = 0; i < n; i++) {
        let temp = b;
        b = a + b;
        a = temp;
    }
    return a;
};

printf("Iterative Fibonacci:\n");
for (let i = 0; i <= 15; i++)
    printf("  fib(%2d) = %d\n", i, fib_iter(i));

// Recursive with memoization via closure
function make_memo_fib() {
    let cache = {};
    let fib;
    fib = function(n) {
        if (n <= 1) return n;
        if (exists(cache, "" + n)) return cache["" + n];
        let result = fib(n - 1) + fib(n - 2);
        cache["" + n] = result;
        return result;
    };
    return fib;
};

let memo_fib = make_memo_fib();
printf("\nMemoized Fibonacci:\n");
printf("  fib(30) = %d\n", memo_fib(30));
printf("  fib(40) = %d\n", memo_fib(40));
