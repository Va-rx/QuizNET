FROM node:20 AS build

WORKDIR /Grywalizacja

COPY package*.json ./
RUN npm install

COPY . .

COPY phaser.d.ts.bak ./node_modules/phaser/types/phaser.d.ts

RUN npm run build

FROM nginx:alpine
COPY --from=build /Grywalizacja/dist/web /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
