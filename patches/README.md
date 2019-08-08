# Patches

## Mac OS X and Linux ##
As of version 3.5.5, the ZooKeeper C Client is packaged differently from before. The release artifact is source-only and require these steps below to build:
```bash
autoreconf -if
./configure --without-syncapi --disable-shared --with-pic --without-cppunit
make
```

The last two steps are done in the install scripts of this library. The first step, `autoreconf`, require users to have `autoconf` installed, and as of today neither Ubuntu or Mac OS X has the tool installed by default.
To bypass that, there are generated files in the source code hosted in the `patches` folder. These files most likely need to be updated when a new version of the ZooKeeper C Client is to be used in this project.

## Windows ##
To improve the developer experience on the Windows platform (a quicker build experience),
the `CMakeLists.txt` file from the ZooKeeper C Client source code is replaced with a light weight one. It is hosted in the `patches` folder.
The light weight `CMakeLists.txt` will bypass feature checks and also hide compiler warnings in the output.

There is an option to still use the defaults, by passing in the ZK_INSTALL_VERBOSE flag as described [here](https://github.com/yfinkelstein/node-zookeeper#development).
