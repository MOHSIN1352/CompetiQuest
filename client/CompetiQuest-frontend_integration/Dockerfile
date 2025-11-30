# Frontend Dockerfile (client/CompetiQuest-frontend_integration/Dockerfile)

# --- Stage 1: Install Dependencies (deps) ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --production=false

# --- Stage 2: Build the Application (builder) ---
FROM node:20-alpine AS builder
WORKDIR /app
# Copy installed dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# CRITICAL FIX: Accept the API URL as a build argument and set it as an environment variable
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Disable Next.js telemetry during the build
ENV NEXT_TELEMETRY_DISABLED 1

# Run the Next.js build command
RUN npm run build 

# --- Stage 3: Minimal Production Runner (runner) ---
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV production

# Copy necessary output files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Command to start the Next.js standalone server
# CRITICAL FIX: Ensure Next.js binds to all network interfaces (0.0.0.0) AND limit memory usage
CMD ["node", "--max-old-space-size=460", "server.js", "-H", "0.0.0.0"]
