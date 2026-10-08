# Build stage
FROM node:22.12.0-alpine AS build

WORKDIR /app
COPY .env package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

# Production stage
FROM node:22.12.0-alpine
WORKDIR /app
# Copy built assets
COPY --from=build /app/build ./build
# Set port and expose it
EXPOSE 5173
# Command to run the application
CMD ["node", "build"]
