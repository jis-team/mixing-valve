FROM node:16-alpine

WORKDIR /usr/src/app/frontend

COPY package*.json ./

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]