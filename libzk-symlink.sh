#!/bin/bash

if [ $# -ne 1 ]
then
  echo "Usage: $0 <PRODUCT_DIR>"
  exit 1
fi

PRODUCT_DIR=$1
FILE=$(basename $PRODUCT_DIR)
BUILD_TYPE=$(basename $(dirname $PRODUCT_DIR))

ln -s $BUILD_TYPE/$FILE build/$FILE
