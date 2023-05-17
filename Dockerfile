# Base image
FROM node:14-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

RUN npm i -g sequelize-cli

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

RUN chmod 755 ./startup.sh

EXPOSE 8976
# CMD ["npm","run","start"]
CMD ["sh", "-c","--","echo 'started';while true; do sleep 1000; done"]