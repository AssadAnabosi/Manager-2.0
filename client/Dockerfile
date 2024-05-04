FROM oven/bun:1 as BUILD_IMAGE  

WORKDIR /usr/src/app

COPY package.json ./

RUN bun install

COPY . .

RUN bunx --bun vite build

FROM oven/bun:1 as PRODUCTION_IMAGE

WORKDIR /usr/src/app

COPY --from=BUILD_IMAGE /usr/src/app/dist/ /usr/src/app/dist/

COPY package.json ./
COPY vite.config.ts ./

RUN bun install typescript

EXPOSE 8080

CMD ["bun", "run", "preview"]