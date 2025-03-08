FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY lerna.json ./

# Copy workspace configurations
COPY packages/dicebear/package*.json ./packages/dicebear/
COPY packages/@dicebear/ ./packages/@dicebear/
COPY apps/ ./apps/
COPY scripts/ ./scripts/

# Install dependencies
RUN npm install
RUN npm install -g lerna ts-node-dev typescript

# Build the packages
RUN npm run build

# Build the editor
RUN npm run build:editor

# Build the server
RUN npm run build:server

# Set environment variables
ENV PORT=3000
ENV BASE_URL=http://localhost:3000
ENV API_KEY=development-api-key
ENV NODE_ENV=production

# Expose the port
EXPOSE 3000

# Start the server
CMD ["npm", "run", "start"]