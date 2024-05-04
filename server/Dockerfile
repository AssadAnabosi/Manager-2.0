FROM oven/bun:1

# Create app directory

WORKDIR /usr/src/app

# Install app dependencies

COPY package*.json ./

RUN bun install --production

# Bundle app source

COPY . .

# Expose port 5000

EXPOSE 5000

# Run the app

CMD [ "bun", "run", "start" ]