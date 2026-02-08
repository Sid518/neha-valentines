FROM node:18-alpine

WORKDIR /app

# Copy everything
COPY . .

# Install client dependencies
WORKDIR /app/client
RUN npm install
RUN npm run build

# Install server dependencies
WORKDIR /app/server
RUN npm install

EXPOSE 5050

CMD ["node", "index.js"]
