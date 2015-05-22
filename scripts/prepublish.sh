#!/bin/bash

. ./scripts/env.sh

cd $DEPS

echo "Downloading $ZK from $ZK_URL"

curl --output $ZK_FILE $ZK_URL || wget $ZK_URL -O $ZK_FILE

if [ $? != 0 ] ; then
    echo "Unable to download zookeeper library"
    exit 1
fi

tar zxf $ZK_FILE $ZK/src/c

cd $ZK_DEPS

echo "Applying patches"
for PATCH in $PATCHES; do
    echo "Patching: $PATCH"
    patch -p0 < $PATCH
    if [ $? != 0 ] ; then
            echo "Unable to patch the ZooKeeper source"
            exit 1
    fi
done
