#!/bin/bash

ROOT=`pwd`
DEPS=$ROOT/deps
BUILD=$ROOT/build/zk
ZK_VERSION=3.4.6
ZK=zookeeper-$ZK_VERSION
ZK_DEPS=$DEPS/$ZK
ZK_FILE=/tmp/$ZK.tar.gz
ZK_URL=http://apache.mirrors.tds.net/zookeeper/$ZK/$ZK.tar.gz
PATCHES=$(ls $ROOT/patches/*.patch)
