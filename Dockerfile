FROM ubuntu:20.04

RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get install -y nodejs

WORKDIR /app/dictation-studio-ui

COPY package*.json ./

RUN node -v
RUN npm -v
RUN npm install

COPY . .

RUN npm run build

EXPOSE 5173

CMD ["npm", "start"]