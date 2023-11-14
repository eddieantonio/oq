FROM node:20-alpine as base

WORKDIR /app

# Install dependencies first...
COPY package.json package-lock.json ./
RUN npm ci



# Image used in development. Note, we do NOT copy the source files into the container,
# as we are using a bind mount to actively modify the source code.
FROM base as dev-hot-reload
# Hardcode the contents of "npm run" to avoid npm from intercepting our exit signals
# See: https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#cmd
CMD ["node_modules/.bin/vite", "dev"]


# Image used to build the application
FROM base as build
# Copy remaining files:
COPY . .
# TODO: build command