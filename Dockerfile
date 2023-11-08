FROM node:20-alpine

WORKDIR /app

# TODO: move this stuff to the sandboxed environment
# TEMPORARY: install gcc to compile user code
RUN apk add --no-cache gcc musl-dev

COPY package.json package-lock.json ./

RUN npm ci

COPY . ./

# Hardcode "npm run" to avoid npm from intercepting our exit signals
# See: https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#cmd
CMD ["node_modules/.bin/vite", "dev"]
