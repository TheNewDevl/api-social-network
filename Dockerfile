################ 
##### DEV ######
################


# Node base image
FROM node@sha256:c785e617c8d7015190c0d41af52cc69be8a16e3d9eb7cb21f0bb58bcfca14d6b As development

# Create the working directory
WORKDIR /app

# Copy package dependencies
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy app
COPY . .



################ 
##### BUILD ####
################

FROM node@sha256:c785e617c8d7015190c0d41af52cc69be8a16e3d9eb7cb21f0bb58bcfca14d6b As build

WORKDIR /app

COPY package*.json ./

# To run `npm run build` we need access to the Nest CLI which is a dev dependency. So lets install it first.
RUN npm install @nestjs/cli

COPY . .

# Run the build command to create the dist folder
RUN npm run prebuild
RUN npm run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Install only prod dependencies and ensures that the node_modules dir is as optimized as possible 
RUN npm ci --omit=dev && npm cache clean --force


################ 
#### PROD ######
################

FROM node@sha256:c785e617c8d7015190c0d41af52cc69be8a16e3d9eb7cb21f0bb58bcfca14d6b As production

# Copy the bundled code from the build stage to the production image
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
