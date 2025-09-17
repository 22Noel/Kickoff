FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better Docker cache)
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Optionally prune devDependencies for a slimmer image
RUN npm prune --production

# Install curl for healthcheck
RUN apk add --no-cache curl

# Expose the port your Express app runs on
EXPOSE 3000

# Healthcheck using curl
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl --fail http://localhost:3000/status || exit 1

# Start the Express server
CMD ["npm", "start"]