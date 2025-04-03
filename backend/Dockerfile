FROM node:16-alpine

WORKDIR /usr/src/app/backend

COPY package*.json ./

RUN npm install

EXPOSE 5000

# 개발환경에는 nodemon 배포시 node
CMD ["npm", "start"]