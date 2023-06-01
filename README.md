# Fake-server

Lots still to sort, will provide a proper readme when it works

For now, if you *really* need to try it

1) Open a terminal
2) npm install --force
3) create the lib folder by running tsc on the terminal
4) npm run start:snc

In the game code, change the tequity backend server address to
http:127.0.0.1:3002

e.g
        //server: "https://test.tequity.ventures",
        server: "http://127.0.0.1:3002",

For now it just replays one round. More to come...