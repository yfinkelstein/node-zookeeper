#!/bin/bash

PLATFORM=`uname`
if [ "$PLATFORM" == "SunOS" ]; then
    # Illumos platforms are annoying to work with,
    # so we just depend on libzooker_st being preinstalled
    # On SmartOS, pkgin install zookeeper-client drops it
    # in /opt/local
    exit 0
fi

ROOT=`pwd`
CONFIG_ARGS="--without-syncapi \
    --enable-static \
    --disable-shared \
    --with-pic \
    --prefix=$ROOT/build/zk"

cd deps/zookeeper-3.4.3/src/c
make distclean 2>&1 > /dev/null
rm -fr $ROOT/build/zk
./configure $CONFIG_ARGS
make && make install
cd $ROOT