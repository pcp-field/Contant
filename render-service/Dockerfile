# Puppeteer-ready base (bundled Chromium + system libs)
FROM ghcr.io/puppeteer/puppeteer:23.11.1

WORKDIR /app
USER root
COPY package.json ./
RUN npm install --omit=dev
COPY . .
ENV NODE_ENV=production
# Chromium is provided by the base image; skip re-download
ENV PUPPETEER_SKIP_DOWNLOAD=false
CMD ["node", "server.js"]
