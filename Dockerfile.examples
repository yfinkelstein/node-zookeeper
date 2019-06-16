FROM node:10

WORKDIR /app

COPY . /app

RUN rm -rf build
RUN rm -rf node_modules
RUN rm -f package-lock.json

RUN npm install --unsafe-perm

CMD ["node", "examples/index", "host.docker.internal:2181"]
