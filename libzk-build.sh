#!/bin/bash

ROOT=`pwd`
BUILD=$ROOT/build/zk
BUILD_TMP=$BUILD/tmp
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

    if [ -e "$APACHE_DYN_FILE" ] ;then
        rm -f $APACHE_DYN_FILE
    fi
    echo "Get $ZK download url from $APACHE_DYN_URL"
    curl --silent --keepalive-time 10 --connect-timeout 10 --output $APACHE_DYN_FILE $APACHE_DYN_URL || wget -T 10 $APACHE_DYN_URL -O $APACHE_DYN_FILE
    if [ $? != 0 ] ; then
        echo "Can't connect apache.org."
        exit 1
    fi
    ZK_ROOT_URL=$(grep --color=never -o "http://mirrors.[a-zA-Z0-9.-\_]*/apache/zookeeper/" $APACHE_DYN_FILE | head -n 1)
    if [ "x$ZK_ROOT_URL" != "x" ] ; then
        ZK_URL="$ZK_ROOT_URL/$ZK/$ZK.tar.gz"
    fi

    if [ ! -e "$ZK_FILE" ] ; then
        echo "Downloading $ZK from $ZK_URL"
        curl --silent --output $ZK_FILE $ZK_URL || wget $ZK_URL -O $ZK_FILE
        if [ $? != 0 ] ; then
            echo "Unable to download zookeeper library"
            exit 1
        fi
    fi

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
