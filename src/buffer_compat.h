#ifndef BUFFER_COMPAT_H
#define BUFFER_COMPAT_H

#include <node.h>
#include <node_buffer.h>
#include <node_version.h>
#include <v8.h>

#if NODE_MAJOR_VERSION < 11 && NODE_MINOR_VERSION < 3

char *BufferData(node::Buffer *b) {
    return b->data();
}
size_t BufferLength(node::Buffer *b) {
    return b->length();
}
char *BufferData(v8::Local<v8::Object> buf_obj) {
    v8::HandleScope scope;
    node::Buffer *buf = node::ObjectWrap::Unwrap<node::Buffer>(buf_obj);
    return buf->data();
}
size_t BufferLength(v8::Local<v8::Object> buf_obj) {
    v8::HandleScope scope;
    node::Buffer *buf = node::ObjectWrap::Unwrap<node::Buffer>(buf_obj);
    return buf->length();
}

Local<Object> BufferNew(const char* bytes, int length) {
    Buffer* b = Buffer::New(value_len);
    memcpy(BufferData(b), value, value_len);
    return Local<Object>::New(b->handle_);
}

#else // NODE_VERSION
#include "nan.h"

Local<Object> BufferNew(const char* bytes, int length) {
    return NanNewBufferHandle(bytes, length);
}

char *BufferData(v8::Local<v8::Object> buf_obj) {
    NanScope();
    return node::Buffer::Data(buf_obj);
}
size_t BufferLength(v8::Local<v8::Object> buf_obj) {
    NanScope();
    return node::Buffer::Length(buf_obj);
}

#endif // NODE_VERSION

#endif//BUFFER_COMPAT_H
