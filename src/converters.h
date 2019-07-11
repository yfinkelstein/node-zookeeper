#include <v8.h>
#include "nan.h"

using namespace v8;

Local<Value> toLocalVal(Local<Object> arg, Local<String> propertyName) {
    Local<Value> val_local = arg->Get(Nan::GetCurrentContext(), propertyName).ToLocalChecked();
    return val_local;
}

int32_t fromJustInt(Local<Object> arg, Local<String> propertyName) {
    Local<Value> val_local = toLocalVal(arg, propertyName);
    int32_t val = val_local->Int32Value(Nan::GetCurrentContext()).FromJust();

    return val;
}

bool fromJustBool(Local<Object> arg, Local<String> propertyName) {
    Local<Value> val_local = toLocalVal(arg, propertyName);
    bool val = Nan::To<bool>(val_local).FromJust();

    return val;
}

Local<Value> convertUnixTimeToDate(double time) {
    return Date::New(Isolate::GetCurrent()->GetCurrentContext(), time).ToLocalChecked();
}

Local<String> toStr(Local<Value> val) {
    return val->ToString(Nan::GetCurrentContext()).FromMaybe(Local<String>());
}
