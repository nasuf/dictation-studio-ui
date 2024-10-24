FROM node:22.5.1

WORKDIR /app/dictation-studio-ui

RUN apt-get update && apt-get install -y build-essential python

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5173

CMD ["npm", "start"]