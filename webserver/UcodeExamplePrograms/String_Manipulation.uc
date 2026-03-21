// String manipulation with builtins

let text = "the quick brown fox jumps over the lazy dog";

printf("Original:   %s\n", text);
printf("Uppercase:  %s\n", uc(text));
printf("Length:     %d\n", length(text));

// Split and rejoin
let words = split(text, " ");
printf("Words:      %d\n", length(words));

// Capitalize each word
let capitalized = map(words, function(w) {
    return uc(substr(w, 0, 1)) + substr(w, 1);
});
printf("Title case: %s\n", join(" ", capitalized));

// Reverse each word
let reversed = map(words, function(w) {
    let chars = split(w, "");
    let out = "";
    for (let i = length(chars) - 1; i >= 0; i--)
        out += chars[i];
    return out;
});
printf("Reversed:   %s\n", join(" ", reversed));

// Count vowels
let vowel_count = 0;
let chars = split(text, "");
for (let i = 0; i < length(chars); i++) {
    if (index(["a","e","i","o","u"], chars[i]) >= 0)
        vowel_count++;
}
printf("Vowels:     %d\n", vowel_count);

// Simple pattern matching
let m = match(text, /(\w+) fox/);
if (m)
    printf("Match:      '%s' before fox\n", m[1]);
