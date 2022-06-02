FROM node:gallium-buster-slim 
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src .
COPY tsconfig*.json .
RUN npm run build
CMD [ "npm", "run", "start" ] 
EXPOSE 3000
