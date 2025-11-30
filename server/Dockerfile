# Backend Dockerfile (server/Dockerfile)

FROM node:20-alpine 

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm install --production

COPY . .

# Railway injects PORT dynamically (ex: 39345)
ENV PORT=$PORT

EXPOSE 5000

CMD ["node", "index.js"]
