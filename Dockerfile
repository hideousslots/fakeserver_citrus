FROM node:18 as build

RUN mkdir -p /usr/src/dreamspin/games

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

FROM node:alpine as main

WORKDIR /app

COPY --from=build /app/FakeServer.js /app/FakeServer.js
COPY --from=build /app/FakeServerSource /app/FakeServerSource
COPY --from=build /app/lib /app/lib
COPY --from=build /app/node_modules/ /app/node_modules/

EXPOSE 3003

ENV PROVIDER=dreamspin
ENV RNG=node_modules/@slotify/gdk/lib/rng/SlotifyRNG
ENV GAMES_PATH=lib/games/*/index.js
ENV FAKESERVERUSESSL=true
CMD ["node", "./FakeServer.js"]
