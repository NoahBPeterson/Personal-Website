// Approximate integrals using Simpson's rule

function integrate(f, a, b, n) {
    let h = (b - a) / n;
    let sum = f(a) + f(b);

    for (let i = 1; i < n; i++) {
        let x = a + i * h;
        if (i % 2 == 0)
            sum += 2 * f(x);
        else
            sum += 4 * f(x);
    }

    return sum * h / 3;
};

// Approximate pi using integral of 4/(1+x²) from 0 to 1
let pi = integrate(x => 4.0 / (1.0 + x * x), 0.0, 1.0, 1000);
printf("π ≈ %.10f\n", pi);

// Integral of x² from 0 to 1 (exact: 1/3)
let x_sq = integrate(x => x * x, 0.0, 1.0, 100);
printf("∫x² dx [0,1] ≈ %.10f (exact: 0.3333...)\n", x_sq);

// Integral of sin approximation using Taylor series
function sin_approx(x) {
    let result = 0;
    let term = x;
    for (let i = 1; i <= 15; i++) {
        result += term;
        term *= -x * x / (2 * i * (2 * i + 1));
    }
    return result;
};

// Integral of sin(x) from 0 to pi (exact: 2)
let sin_int = integrate(sin_approx, 0, 3.14159265359, 1000);
printf("∫sin(x) dx [0,π] ≈ %.10f (exact: 2.0)\n", sin_int);
