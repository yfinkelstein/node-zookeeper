#ifndef BUFFER_COMPAT_H
#define BUFFER_COMPAT_H

#include <node.h>
#include <node_buffer.h>
#include <node_version.h>
#include <v8.h>

#include "nan.h"

Nan::MaybeLocal<v8::Object> BufferNew(const char* bytes, uint32_t length) {
    return Nan::CopyBuffer(bytes, length);
}

char *BufferData(v8::Local<v8::Object> buf_obj) {
    return node::Buffer::Data(buf_obj);
}

size_t BufferLength(v8::Local<v8::Object> buf_obj) {
    return node::Buffer::Length(buf_obj);
}

#endif // BUFFER_COMPAT_H
