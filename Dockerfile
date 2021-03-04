FROM node:lts-alpine

COPY . .

RUN npm install
RUN node_modules/typescript/bin/tsc

CMD npm start