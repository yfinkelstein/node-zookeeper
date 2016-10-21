#!/bin/bash

. ./scripts/env.sh

cd $DEPS

# Fetch the SHA1 hash to see if a file download is really needed
curl --fail --output $ZK_FILE.sha1 $ZK_URL.sha1 || wget $ZK_URL.sha1 -O $ZK_FILE.sha1

pushd `dirname $ZK_FILE`
shasum -c $ZK_FILE.sha1
CHECKSUM_MATCHES=$?
popd

if [ $CHECKSUM_MATCHES -eq 0 ]; then
    echo "Skipping zookeeper source download because cached version is correct"
else
    echo "Downloading $ZK from $ZK_URL"

    curl -C - --fail --output $ZK_FILE $ZK_URL || wget --continue $ZK_URL -O $ZK_FILE

    if [ $? != 0 ] ; then
        echo "Unable to download zookeeper library"
        exit 1
    fi
fi


rm -rf $ZK_DEPS

tar zxf  $ZK_FILE $ZK/src/c

mv $ZK $ZK_DEPS

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
