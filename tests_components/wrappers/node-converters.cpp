#include "../../src/converters.hpp"
#include <nan.h>
#include <v8.h>
using namespace v8;
using namespace nodezk;

NAN_METHOD(toUintTest) {
    uint32_t res = toUint(info[0]);

    info.GetReturnValue().Set(res);
}

NAN_METHOD(toIntTest) {
    Local<Object> arg = Nan::To<Object>(info[0]).ToLocalChecked();
    Local<String> key = Nan::New<String>("val").ToLocalChecked();

    int32_t res = toInt(arg, key);

    info.GetReturnValue().Set(res);
}

NAN_METHOD(toBoolTest) {
    Local<Object> arg = Nan::To<Object>(info[0]).ToLocalChecked();
    Local<String> key = Nan::New<String>("val").ToLocalChecked();

    bool res = toBool(arg, key);

    info.GetReturnValue().Set(res);
}

NAN_METHOD(convertUnixTimeToDateTest) {
    Local<Int32> arg = Nan::To<Int32>(info[0]).ToLocalChecked();
    int32_t val = toInt(arg);

    Local<Value> res = convertUnixTimeToDate(val);

    info.GetReturnValue().Set(res);
}

NAN_METHOD(toStrTest) {
    Local<String> res = toString(info[0]);

    info.GetReturnValue().Set(res);
}

NAN_MODULE_INIT(Init) {
    NAN_EXPORT(target, toStrTest);
    NAN_EXPORT(target, convertUnixTimeToDateTest);
    NAN_EXPORT(target, toBoolTest);
    NAN_EXPORT(target, toIntTest);
    NAN_EXPORT(target, toUintTest);
}

NODE_MODULE(unit_tests, Init)
