FROM node:gallium-buster-slim 
WORKDIR /app
COPY package*.json ./
COPY ./src /app/src
COPY .env .
COPY tsconfig*.json .
RUN npm install
RUN npm run build
EXPOSE 3636
CMD ["node", "dist/main"]
