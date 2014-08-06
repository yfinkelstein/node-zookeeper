#!/bin/bash

ROOT=`pwd`
BUILD=$ROOT/build/zk
BUILD_TMP=$BUILD/tmp
DEPS=$ROOT/deps
PLATFORM=`uname`
ZK_VERSION=3.4.6
ZK=zookeeper-$ZK_VERSION
ZK_FILE=/$BUILD_TMP/$ZK.tar.gz
ZK_URL=http://apache.mirrors.tds.net/zookeeper/$ZK/$ZK.tar.gz
APACHE_DYN_FILE=/$BUILD_TMP/index.html
APACHE_DYN_URL=http://www.apache.org/dyn/closer.cgi/zookeeper/

if [ "$PLATFORM" != "SunOS" ]; then
    if [ -e "$BUILD/lib/libzookeeper_st.la" ]; then
        echo "ZooKeeper has already been built"
        exit 0
    fi

    mkdir -p $BUILD_TMP
    
    cp $DEPS/$ZK.tar.gz $ZK_FILE

    cd $BUILD_TMP

    tar -zxf $ZK_FILE && \
    cd $ZK/src/c && \
    ./configure \
        --without-syncapi \
        --enable-static \
        --disable-shared \
        --with-pic \
        --libdir=$BUILD/lib \
        --prefix=$BUILD && \
        make && \
        make install
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
