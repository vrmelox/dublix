FROM node:20-alpine

WORKDIR /app

# Copieur les package json d'abord pour optimiser le cache des couches Docker
COPY package*.json ./

RUN npm install

# Copier Prisma et générer le client (important avant le build TypeScript)
COPY prisma ./prisma
RUN npx prisma generate

# Copier le reste du code
COPY . .

# Compiler TypeScript en JS
RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]
