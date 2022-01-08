# Integration tests

Note: currently there is a manual workflow for the existing integration tests.

## Setup

### docker-compose

You can use `docker-compose` setup that is provided with the project. To run the tests simply run: `docker-compose up --build integration-tests`.

### ZooKeeper server running locally

Make sure you have a ZooKeeper server running.

Run `npm run test-integration`. The tests expect a running ZooKeeper server at `localhost:2181`. Attach your custom url by: `npm run test-integration -- my-ip:my-port`.

Pro tip: Check out the ZooKeeper [Docker image](https://hub.docker.com/_/zookeeper) and guidelines on how to run a local server.

To run ZooKeeper on localhost via Docker run: `docker run --rm -p 2181:2181 zookeeper`.
