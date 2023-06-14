FROM node:18

RUN mkdir -p /usr/src/dreamspin/games

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

EXPOSE 3002

ENV PROVIDER=dreamspin
ENV RNG=node_modules/@slotify/gdk/lib/rng/SlotifyRNG
ENV GAMES_PATH=lib/games/*/index.js
CMD ["node", "./FakeServer.js"]
