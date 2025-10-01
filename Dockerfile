FROM node:24-slim

RUN mkdir /app
WORKDIR /app

COPY . .

RUN npm install -g npm@latest

RUN npm install next

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]