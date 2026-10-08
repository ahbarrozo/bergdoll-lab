# Backend build
FROM oven/bun:latest AS back-build

WORKDIR /app/back

COPY back/package.json back/bun.lock ./
RUN bun install

COPY back/ .
RUN bun build src/index.ts --outdir dist --target bun


# Frontend build
FROM node:22.13.0-alpine AS front-build

WORKDIR /app/front

COPY front/.env front/package.json front/package-lock.json ./
RUN npm ci

COPY front/ .
RUN npm run build
RUN npm prune --production

# Final combined image
FROM node:22.13.0-alpine

WORKDIR /apps

# Install Bun
RUN apk add --no-cache curl unzip bash
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Install PM2
RUN npm install -g pm2

# Copy all builds
COPY --from=back-build /app/back/dist /apps/back/dist

COPY --from=front-build /app/front/build /apps/front/build
COPY --from=front-build /app/front/node_modules /apps/front/node_modules
COPY --from=front-build /app/front/package.json /apps/front/package.json

# Create PM2 config file
COPY ecosystem.config.js .

# Expose ports for both applications
EXPOSE 3000 5173

# Start both services with PM2
CMD ["pm2-runtime", "ecosystem.config.js"]
