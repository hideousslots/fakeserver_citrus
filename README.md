# Fake-server

1) Open a terminal
2) npm install --force
3) npm run build
4) npm run start:fakeserver

In the game code, change the tequity backend server address to

http://127.0.0.1:3002

on the mac this is

http://0.0.0.0:3002

e.g
        //server: "https://test.tequity.ventures",
        server: "http://127.0.0.1:3002",
        or
        server: "http://0.0.0.0:3002",

# DOCKER

It's now possible to get this fake server into a docker container
You can build it with:

docker build -t fakeserverimage .

refer to docker instructions online for any issues
        
export the docker image with:

docker save fakeserverimage -o fakeserverimage.tar

on target server, import docker image with:

docker load fakeserverimage -i fakeserverimage.tar
