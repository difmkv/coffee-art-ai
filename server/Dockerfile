FROM node:20
WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./
RUN yarn install

RUN yarn global add nodemon
COPY . .

EXPOSE 8000

CMD ["yarn", "dev"]

