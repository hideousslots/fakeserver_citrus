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
or
docker build -t fakeserverimage2 .
or
docker build -t fakeserverimage3 .

refer to docker instructions online for any issues
        
export the docker image with:

win
docker save fakeserverimage -o fakeserverimage.tar
or
docker save fakeserverimage2 -o fakeserverimage2.tar
or
docker save fakeserverimage3 -o fakeserverimage3.tar

on target server, import docker image with:
win
docker load fakeserverimage -i fakeserverimage.tar
linux
docker load < fakeserverimage.tar

publish and run a new container

docker run --publish 3003:3003 fakeserverimage
or
docker run --publish 3004:3003 fakeserverimage2 if running a second server

or
docker run --publish 3005:3003 fakeserverimage3 if running a third server




