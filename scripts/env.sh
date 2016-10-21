#!/bin/bash

ROOT=`pwd`
DEPS=$ROOT/deps
BUILD=$ROOT/build/zk
ZK_VERSION=3.4.9
ZK_VERSION_SHA1=0285717bf5ea87a7a36936bf37851d214a32bb99
ZK=zookeeper-$ZK_VERSION
ZK_DEPS=$DEPS/zookeeper
ZK_FILE=/tmp/$ZK.tar.gz
#ZK_URL=http://apache.mirrors.tds.net/zookeeper/$ZK/$ZK.tar.gz
ZK_URL=http://archive.apache.org/dist/zookeeper/$ZK/$ZK.tar.gz
PATCHES=$(ls $ROOT/patches/*.patch 2>/dev/null || echo -n)
