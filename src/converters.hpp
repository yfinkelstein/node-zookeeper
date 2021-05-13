#include <v8.h>
#include "nan.h"

using namespace v8;

namespace nodezk {
    Local<Object> toLocalObj(Local<Value> val) {
        return Nan::To<Object>(val).ToLocalChecked();
    }

    Local<Value> toLocalVal(Local<Object> arg, Local<String> propertyName) {
        Local<Value> val_local = arg->Get(Nan::GetCurrentContext(), propertyName).ToLocalChecked();
        return val_local;
    }

    int32_t toInt(Local<Value> val_local) {
        int32_t val = val_local->Int32Value(Nan::GetCurrentContext()).FromJust();

        return val;
    }

    int64_t toInt64(Local<Value> val_local) {
        int64_t val = static_cast<int64_t>(val_local->NumberValue(Nan::GetCurrentContext()).FromJust());

        return val;
    }

    int32_t toInt(Local<Object> arg, Local<String> propertyName) {
        Local<Value> val_local = toLocalVal(arg, propertyName);

        return toInt(val_local);
    }

    bool toBool(Local<Value> val_local) {
        return Nan::To<bool>(val_local).FromJust();
    }

    bool toBool(Local<Object> arg, Local<String> propertyName) {
        Local<Value> val_local = toLocalVal(arg, propertyName);

        return toBool(val_local);
    }

    Local<Value> convertUnixTimeToDate(double time) {
        return Date::New(Isolate::GetCurrent()->GetCurrentContext(), time).ToLocalChecked();
    }

    Local<String> toString(Local<Value> val) {
        return val->ToString(Nan::GetCurrentContext()).FromMaybe(Local<String>());
    }

    uint32_t toUint(Local<Value> val) {
        return val->Uint32Value(Nan::GetCurrentContext()).FromJust();
    }
}
