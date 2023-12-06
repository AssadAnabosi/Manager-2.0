FROM node:18-alpine as BUILD_IMAGE  

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine as PRODUCTION_IMAGE

WORKDIR /usr/src/app

COPY --from=BUILD_IMAGE /usr/src/app/dist/ /usr/src/app/dist/

COPY package.json ./
COPY vite.config.ts ./

RUN npm install typescript

EXPOSE 8080

CMD ["npm", "run", "preview"]