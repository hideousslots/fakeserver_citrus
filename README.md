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

for rtp variants: 
docker build -t fajeserverimageX -f Dockerfile.rtpXX

docker build -t fakeserverimage1 .
or
docker build -t fakeserverimage2 .
or
docker build -t fakeserverimage3 .

refer to docker instructions online for any issues
        
export the docker image with:

win
docker save fakeserverimage1 -o fakeserverimage1.tar
or
docker save fakeserverimage2 -o fakeserverimage2.tar
or
docker save fakeserverimage3 -o fakeserverimage3.tar

on target server, import docker image with:
win
docker load fakeserverimage1 -i fakeserverimage1.tar
linux
docker load < fakeserverimage1.tar

eg

docker load < ../home/filereceiver/fakeserverimage3.tar 

----

updating ssl certs on server

certs for dstest live in ./fakeserversource/keys/dstestkey.pem and ...dstestcert.pem
(this could be improved)
once in the container, these should be in: /app/fakeserversource

Renew certs as normal (snc - see MCP system)
Upload new key and pem via scp
copy into running container at above path

root@dockermain:~# cp /home/filereceiver/*.pem .
root@dockermain:~# mv cert2.pem dstestcert.pem   
root@dockermain:~# mv privkey2.pem  dstestkey.pem 

docker cp dstestcert.pem focused_lichterman:/app/FakeServerSource/Keys/dstestcert.pem
 docker cp dstestkey.pem focused_lichterman:/app/FakeServerSource/Keys/dstestkey.pem
docker restart focused_lichterman


root@dockermain:~# cp /home/filereceiver/*.pem .
root@dockermain:~# mv cert2.pem dstestcert.pem                                  root@dockermain:~# mv privkey2.pem  dstestkey.pem 




publish and run a new container

docker run --publish 3003:3003 fakeserverimage1
or
docker run --publish 3004:3003 fakeserverimage2 if running a second server

or
docker run --publish 3005:3003 fakeserverimage3 if running a third server

to list and close

docker container ls
docker stop <name>




