#!/bin/bash

PLATFORM=`uname`
ROOT=`pwd`
if [ "$PLATFORM" == "SunOS" ]; then
    LIBS="-lnsl -lsocket"
    CFLAGS=-D_POSIX_PTHREAD_SEMANTICS
fi

cd deps/zookeeper-3.4.3/src/c
make distclean 2>&1 > /dev/null
rm -fr $ROOT/build/zk
./configure \
    --without-syncapi \
    --enable-static \
    --disable-shared \
    --with-pic \
    --prefix=$ROOT/build/zk 2>&1 > /dev/null
make 2>&1 > /dev/null && make install 2>&1 > /dev/null
cd $ROOT