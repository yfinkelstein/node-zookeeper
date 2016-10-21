#!/bin/bash

ROOT=`pwd`
DEPS=$ROOT/deps
BUILD=$ROOT/build/zk
ZK_VERSION=3.4.8
ZK_VERSION_SHA1=51b61611a329294f75aed82f3a4517a4b6ff116f
ZK=zookeeper-$ZK_VERSION
ZK_DEPS=$DEPS/zookeeper
ZK_FILE=/tmp/$ZK.tar.gz
#ZK_URL=http://apache.mirrors.tds.net/zookeeper/$ZK/$ZK.tar.gz
ZK_URL=http://archive.apache.org/dist/zookeeper/$ZK/$ZK.tar.gz
PATCHES=$(ls $ROOT/patches/*.patch 2>/dev/null || echo -n)
