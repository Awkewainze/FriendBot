FROM node:16

COPY . /app/

WORKDIR /app/

CMD ["node", "./dist/index.js"]