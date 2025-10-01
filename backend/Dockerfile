FROM node:20

WORKDIR /usr/src/app

# Install Chrome dependencies
# RUN apt-get update && apt-get install -y \
#     wget gnupg ca-certificates \
#     fonts-liberation libasound2 libatk-bridge2.0-0 libdrm2 libxcomposite1 \
#     libxdamage1 libxrandr2 libgbm1 libxss1 libnss3 libxkbcommon0 \
#     chromium-browser \
#     && rm -rf /var/lib/apt/lists/*


RUN apt-get update && apt-get install -y \
    wget gnupg ca-certificates \
    fonts-liberation libasound2 libatk-bridge2.0-0 libdrm2 libxcomposite1 \
    libxdamage1 libxrandr2 libgbm1 libxss1 libnss3 libxkbcommon0 \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

RUN npx puppeteer browsers install chrome

RUN which google-chrome-stable && ls -la /usr/bin/google-chrome*

# ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

#ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

COPY package*.json ./

RUN npm install -g npm@11.5.2

RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-timeout 600000 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set fetch-retry-maxtimeout 60000 && \
    npm config set fetch-retries 3

# Install dependencies using clean and reliable method
RUN npm ci --verbose || npm ci --verbose || npm install --verbose

COPY . .

RUN npm run build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1


CMD [ "npm", "run", "start:dev" ]

