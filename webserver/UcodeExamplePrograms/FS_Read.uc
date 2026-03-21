const fs = require('fs');

let file = fs.open("data.txt", "r"); // fs.open's hover shows on 'fs' but not 'open'???
let content = file.read("data.txt"); // file.read()'s hover shows on 'file' but not 'read'???
print("len:", length(content));



