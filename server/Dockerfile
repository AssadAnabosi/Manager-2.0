FROM node:18-slim

# Create app directory

WORKDIR /usr/src/app

# Install app dependencies

COPY package*.json ./

RUN npm install --include-dev

# Bundle app source

COPY . .

# Expose port 5000

EXPOSE 5000

# Run the app

CMD [ "npm", "start" ]