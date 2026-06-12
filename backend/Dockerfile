FROM node:24-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY server.js ./

EXPOSE 5000

USER node

CMD ["node", "server.js"]
