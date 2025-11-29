# Backend Dockerfile (server/Dockerfile)

FROM node:20-alpine 

# Set the working directory inside the container
WORKDIR /app

# CRITICAL FIX: Install dependencies needed for native modules (like bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 5000 

# Command to start the application using the entry file (index.js)
CMD ["node", "index.js"]