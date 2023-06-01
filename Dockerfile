FROM node:14-slim

RUN mkdir -p /usr/src/dreamspin/games

WORKDIR /usr/src/dreamspin/games

COPY . .

RUN npm install --production
RUN npm run build

EXPOSE 8080

ENV PROVIDER=dreamspin
ENV RNG=node_modules/@slotify/gdk/lib/rng/SlotifyRNG
ENV GAMES_PATH=lib/games/*/index.js
CMD ["node", "node_modules/@slotify/gdk/lib/index.js"]
