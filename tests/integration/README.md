### Integration tests ###

Note: currently there is a manual workflow for the existing integration tests.

#### Test: remote socket server sends no data ####
This test is meant to verify that the `node-zk.cpp` wrapper will handle the scenario when a remote server return 0.
The issue is described in [detail here](https://github.com/yfinkelstein/node-zookeeper/issues/172).

##### Steps #####
Build an image from the `Dockerfile.examples` file:
````bash 
docker build --tag=examples -f Dockerfile.examples .
````
Start the example code:
````bash
docker run examples
````

In a second terminal window, start the test socket server:
````bash
node examples/socketserver.js
````

Start and stop the example code a couple of times. Make sure the example code is not stuck in an infinite loop, as described in the [issue](https://github.com/yfinkelstein/node-zookeeper/issues/172).

