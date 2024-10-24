FROM node:22.5.1

WORKDIR /app/dictation-studio-ui

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5173

CMD ["npm", "start"]