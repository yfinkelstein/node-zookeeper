### Developer: updating the ZooKeeper Client C source code

This guide is extracted from the [official docs](https://github.com/apache/zookeeper/blob/master/zookeeper-client/zookeeper-client-c/README)

1 Download the source code
2 Navigate to the `zookeeper-jute` folder and run `mvn compile`
3 Navigate to the zookeeper-client-c folder: run autoreconf -if
4 compress the entire zookeeper-client-c folder and name it `zookeeper-client-c.tar.gz`
   * On Mac OS X: `COPYFILE_DISABLE=1 tar -czvf zookeeper-client-c.tar.gz zookeeper-client-c`
5 replace the existing compressed file in the deps folder
