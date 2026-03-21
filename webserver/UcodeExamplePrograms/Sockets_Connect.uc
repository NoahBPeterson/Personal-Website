import { create, connect, AF_INET, SOCK_STREAM } from 'socket';

let sock = create(AF_INET, SOCK_STREAM);
let result = connect(sock, "example.com", "80");
print("connected:", result);



