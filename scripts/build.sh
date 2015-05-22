#!/bin/bash

. ./scripts/env.sh

if [ "$PLATFORM" != "SunOS" ]; then
    if [ -e "$BUILD/lib/libzookeeper_st.la" ]; then
        echo "ZooKeeper has already been built"
        exit 0
    fi

    cd $ZK_DEPS/src/c && \
    ./configure \
        --without-syncapi \
        --enable-static \
        --disable-shared \
        --with-pic && \
        make
    if [ $? != 0 ] ; then
            echo "Unable to build zookeeper library"
            exit 1
    fi
    cd $ROOT
else
    if [ `uname -v` =~ "joyent_.*" ] ; then
        pkgin list | grep zookeeper-client-$ZK_VERSION
        if [ $? != 0] ; then
            echo "You must install zookeeper before installing this module. Try:"
            echo "pkgin install zookeeper-client-$ZK_VERSION"
            exit 1
        fi
    fi
fi
