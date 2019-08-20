# Examples

## Run

You can use `docker-compose` setup that is provided with the project. To run the tests simply run: `docker-compose run --build examples`.

Restart the ZooKeeper server a couple of times using `docker-compose restart zookeeper`. Make sure the example code is not stuck in an infinite loop, as described in the [issue](https://github.com/yfinkelstein/node-zookeeper/issues/172).

## Build manually

Build an image from the `Dockerfile.node` file:

`docker build -t examples -f Dockerfile.node .` (note the dot at the end of the command)

Start the example code:

`docker run --rm examples node examples/index`

In a second terminal window, start the test socket server:

`node examples/socketserver.js`

Start and stop the example code a couple of times. Make sure the example code is not stuck in an infinite loop, as described in the [issue](https://github.com/yfinkelstein/node-zookeeper/issues/172).

### Test: remote socket server sends no data

This test is meant to verify that the `node-zk.cpp` wrapper will handle the scenario when a remote server return 0.

The issue is described in [detail here](https://github.com/yfinkelstein/node-zookeeper/issues/172).
