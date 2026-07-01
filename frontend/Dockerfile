FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

ARG CACHEBUST=1
COPY . .

# Compiler l'application Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
