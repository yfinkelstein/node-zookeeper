#include "../src/converters.h"
#include <nan.h>
#include <v8.h>
using namespace v8;

NAN_METHOD(convertUnixTimeToDateTest) {
    Local<Int32> arg = Nan::To<Int32>(info[0]).ToLocalChecked();
    int32_t val = fromJustInt(arg);

    Local<Value> res = convertUnixTimeToDate(val);

    info.GetReturnValue().Set(res);
}

NAN_METHOD(toStrTest) {
    Local<String> res = toStr(info[0]);

    info.GetReturnValue().Set(res);
}

NAN_MODULE_INIT(Init) {
    NAN_EXPORT(target, toStrTest);
    NAN_EXPORT(target, convertUnixTimeToDateTest);
}

NODE_MODULE(unit_tests, Init)
