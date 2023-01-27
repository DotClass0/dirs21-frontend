FROM node:lts-alpine

COPY . .

WORKDIR ./app

RUN npm install && npm run build

WORKDIR ../api

RUN npm install

EXPOSE 9000
CMD [ "node", "index.js" ]