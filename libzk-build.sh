#!/bin/bash

PLATFORM=`uname`
ROOT=`pwd`
if [ "$PLATFORM" == "SunOS" ]; then
    LIBS="-lnsl -lsocket"
    CFLAGS="-D_POSIX_PTHREAD_SEMANTICS"
else
    LIBS=""
    CFLAGS=""
fi

CONFIG_ARGS="--without-syncapi \
    --enable-static \
    --disable-shared \
    --with-pic \
    --prefix=$ROOT/build/zk"

cd deps/zookeeper-3.4.3/src/c
make distclean 2>&1 > /dev/null
rm -fr $ROOT/build/zk
CFLAGS=$CFLAGS LIBS=$LIBS ./configure $CONFIG_ARGS
make && make install
cd $ROOT