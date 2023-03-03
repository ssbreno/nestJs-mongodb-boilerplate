FROM node:18

WORKDIR /app

COPY package*.json ./

COPY .env ./

RUN npm ci --omit=dev --ignore-scripts

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "start:dev" ]