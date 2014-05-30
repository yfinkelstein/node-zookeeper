#include <string.h>
#include <strings.h>
#include <errno.h>
#include <assert.h>
#include <stdarg.h>
#include <node.h>
#include <node_buffer.h>
#include <node_object_wrap.h>
#include <v8-debug.h>
using namespace v8;
using namespace node;
#undef THREADED
#include <zookeeper.h>
#include "zk_log.h"
#include "buffer_compat.h"

// @param c must be in [0-15]
// @return '0'..'9','A'..'F'
inline char fourBitsToHex(unsigned char c) {
    return ((c <= 9) ? ('0' + c) : ('7' + c));
}

// @param h must be one of '0'..'9','A'..'F'
// @return [0-15]
inline unsigned char hexToFourBits(char h) {
    return (unsigned char) ((h <= '9') ? (h - '0') : (h - '7'));
}

// in: c
// out: hex[0],hex[1]
static void ucharToHex(const unsigned char *c, char *hex) {
    hex[0] = fourBitsToHex((*c & 0xf0)>>4);
    hex[1] = fourBitsToHex((*c & 0x0f));
}

// in: hex[0],hex[1]
// out: c
static void hexToUchar(const char *hex, unsigned char *c) {
    *c = (hexToFourBits(hex[0]) << 4) | hexToFourBits(hex[1]);
}

namespace zk {
#define ZERO_MEM(member) bzero(&(member), sizeof(member))
#define _LL_CAST_ (long long)
#define _LLP_CAST_ (long long *)

#define THROW_IF_NOT(condition, text) if (!(condition)) { \
      return ThrowException(Exception::Error (String::New(text))); \
    }

#define THROW_IF_NOT_R(condition, text) if (!(condition)) { \
      ThrowException(Exception::Error (String::New(text))); \
      return; \
    }

#define DEFINE_STRING(ev,str) static Persistent<String> ev = NODE_PSYMBOL(str)
DEFINE_STRING (on_closed,            "close");
DEFINE_STRING (on_connected,         "connect");
DEFINE_STRING (on_connecting,        "connecting");
DEFINE_STRING (on_event_created,     "created");
DEFINE_STRING (on_event_deleted,     "deleted");
DEFINE_STRING (on_event_changed,     "changed");
DEFINE_STRING (on_event_child,       "child");
DEFINE_STRING (on_event_notwatching, "notwatching");

#define DEFINE_SYMBOL(ev)   DEFINE_STRING(ev, #ev)
DEFINE_SYMBOL (HIDDEN_PROP_ZK);
DEFINE_SYMBOL (HIDDEN_PROP_HANDBACK);

#define ZOOKEEPER_PASSWORD_BYTE_COUNT 16

struct completion_data {
    Persistent<Function> *cb;
    int32_t type;
    void *data;
};

class ZooKeeper: public ObjectWrap {
public:
    static void Initialize (v8::Handle<v8::Object> target) {
        HandleScope scope;
        Local<FunctionTemplate> constructor_template = FunctionTemplate::New(New);
        constructor_template->SetClassName(String::NewSymbol("ZooKeeper"));
        constructor_template->InstanceTemplate()->SetInternalFieldCount(1);

        NODE_SET_PROTOTYPE_METHOD(constructor_template, "init", Init);
        NODE_SET_PROTOTYPE_METHOD(constructor_template, "close", Close);
        NODE_SET_PROTOTYPE_METHOD(constructor_template, "a_create", ACreate);
        NODE_SET_PROTOTYPE_METHOD(constructor_template, "a_exists", AExists);
        NODE_SET_PROTOTYPE_METHOD(constructor_template, "aw_exists", AWExists);
        NODE_SET_PROTOTYPE_METHOD(constructor_template, "a_get", AGet);
        NODE_SET_PROTOTYPE_METHOD(constructor_template, "aw_get", AWGet);
        NODE_SET_PROTOTYPE_METHOD(constructor_template, "a_get_children", AGetChildren);
        NODE_SET_PROTOTYPE_METHOD(constructor_template, "aw_get_children", AWGetChildren);
        NODE_SET_PROTOTYPE_METHOD(constructor_template, "a_get_children2", AGetChildren2);
        NODE_SET_PROTOTYPE_METHOD(constructor_template, "aw_get_children2", AWGetChildren2);
        NODE_SET_PROTOTYPE_METHOD(constructor_template, "a_set", ASet);
        NODE_SET_PROTOTYPE_METHOD(constructor_template, "a_delete_", ADelete);
        NODE_SET_PROTOTYPE_METHOD(constructor_template, "s_delete_", Delete);
        NODE_SET_PROTOTYPE_METHOD(constructor_template, "a_get_acl", AGetAcl);
        NODE_SET_PROTOTYPE_METHOD(constructor_template, "a_set_acl", ASetAcl);
        NODE_SET_PROTOTYPE_METHOD(constructor_template, "add_auth", AddAuth);

        NODE_DEFINE_CONSTANT(constructor_template, ZOO_CREATED_EVENT);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_DELETED_EVENT);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_CHANGED_EVENT);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_CHILD_EVENT);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_SESSION_EVENT);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_NOTWATCHING_EVENT);

        NODE_DEFINE_CONSTANT(constructor_template, ZOO_PERM_READ);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_PERM_WRITE);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_PERM_CREATE);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_PERM_DELETE);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_PERM_ADMIN);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_PERM_ALL);

        //extern ZOOAPI struct ACL_vector ZOO_OPEN_ACL_UNSAFE;
        Local<Object> acl_open = Object::New();
        acl_open->Set(String::NewSymbol("perms"), Integer::New(ZOO_PERM_ALL), static_cast<PropertyAttribute>(ReadOnly | DontDelete));
        acl_open->Set(String::NewSymbol("scheme"), String::NewSymbol("world"), static_cast<PropertyAttribute>(ReadOnly | DontDelete));
        acl_open->Set(String::NewSymbol("auth"), String::NewSymbol("anyone"), static_cast<PropertyAttribute>(ReadOnly | DontDelete));
        constructor_template->Set(String::NewSymbol("ZOO_OPEN_ACL_UNSAFE"), acl_open, static_cast<PropertyAttribute>(ReadOnly | DontDelete));

        //extern ZOOAPI struct ACL_vector ZOO_READ_ACL_UNSAFE;
        Local<Object> acl_read = Object::New();
        acl_read->Set(String::NewSymbol("perms"), Integer::New(ZOO_PERM_READ), static_cast<PropertyAttribute>(ReadOnly | DontDelete));
        acl_read->Set(String::NewSymbol("scheme"), String::NewSymbol("world"), static_cast<PropertyAttribute>(ReadOnly | DontDelete));
        acl_read->Set(String::NewSymbol("auth"), String::NewSymbol("anyone"), static_cast<PropertyAttribute>(ReadOnly | DontDelete));
        constructor_template->Set(String::NewSymbol("ZOO_READ_ACL_UNSAFE"), acl_read, static_cast<PropertyAttribute>(ReadOnly | DontDelete));

        //extern ZOOAPI struct ACL_vector ZOO_CREATOR_ALL_ACL;
        Local<Object> acl_creator = Object::New();
        acl_creator->Set(String::NewSymbol("perms"), Integer::New(ZOO_PERM_ALL), static_cast<PropertyAttribute>(ReadOnly | DontDelete));
        acl_creator->Set(String::NewSymbol("scheme"), String::NewSymbol("auth"), static_cast<PropertyAttribute>(ReadOnly | DontDelete));
        acl_creator->Set(String::NewSymbol("auth"), String::NewSymbol(""), static_cast<PropertyAttribute>(ReadOnly | DontDelete));
        constructor_template->Set(String::NewSymbol("ZOO_CREATOR_ALL_ACL"), acl_creator, static_cast<PropertyAttribute>(ReadOnly | DontDelete));

        NODE_DEFINE_CONSTANT(constructor_template, ZOOKEEPER_WRITE);
        NODE_DEFINE_CONSTANT(constructor_template, ZOOKEEPER_READ);

        NODE_DEFINE_CONSTANT(constructor_template, ZOO_EPHEMERAL);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_SEQUENCE);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_EXPIRED_SESSION_STATE);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_AUTH_FAILED_STATE);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_CONNECTING_STATE);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_ASSOCIATING_STATE);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_CONNECTED_STATE);

        NODE_DEFINE_CONSTANT(constructor_template, ZOO_CREATED_EVENT);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_DELETED_EVENT);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_CHANGED_EVENT);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_CHILD_EVENT);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_SESSION_EVENT);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_NOTWATCHING_EVENT);

        NODE_DEFINE_CONSTANT(constructor_template, ZOO_LOG_LEVEL_ERROR);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_LOG_LEVEL_WARN);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_LOG_LEVEL_INFO);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_LOG_LEVEL_DEBUG);

        NODE_DEFINE_CONSTANT(constructor_template, ZOO_EXPIRED_SESSION_STATE);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_AUTH_FAILED_STATE);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_CONNECTING_STATE);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_ASSOCIATING_STATE);
        NODE_DEFINE_CONSTANT(constructor_template, ZOO_CONNECTED_STATE);


        NODE_DEFINE_CONSTANT(constructor_template, ZOK);

        /** System and server-side errors.
         * This is never thrown by the server, it shouldn't be used other than
         * to indicate a range. Specifically error codes greater than this
         * value, but lesser than {@link #ZAPIERROR}, are system errors. */
        NODE_DEFINE_CONSTANT(constructor_template, ZSYSTEMERROR);
        NODE_DEFINE_CONSTANT(constructor_template, ZRUNTIMEINCONSISTENCY);
        NODE_DEFINE_CONSTANT(constructor_template, ZDATAINCONSISTENCY);
        NODE_DEFINE_CONSTANT(constructor_template, ZCONNECTIONLOSS);
        NODE_DEFINE_CONSTANT(constructor_template, ZMARSHALLINGERROR);
        NODE_DEFINE_CONSTANT(constructor_template, ZUNIMPLEMENTED);
        NODE_DEFINE_CONSTANT(constructor_template, ZOPERATIONTIMEOUT);
        NODE_DEFINE_CONSTANT(constructor_template, ZBADARGUMENTS);
        NODE_DEFINE_CONSTANT(constructor_template, ZINVALIDSTATE);

        /** API errors.
         * This is never thrown by the server, it shouldn't be used other than
         * to indicate a range. Specifically error codes greater than this
         * value are API errors (while values less than this indicate a
         * {@link #ZSYSTEMERROR}).
         */
        NODE_DEFINE_CONSTANT(constructor_template, ZAPIERROR);
        NODE_DEFINE_CONSTANT(constructor_template, ZNONODE);
        NODE_DEFINE_CONSTANT(constructor_template, ZNOAUTH);
        NODE_DEFINE_CONSTANT(constructor_template, ZBADVERSION);
        NODE_DEFINE_CONSTANT(constructor_template, ZNOCHILDRENFOREPHEMERALS);
        NODE_DEFINE_CONSTANT(constructor_template, ZNODEEXISTS);
        NODE_DEFINE_CONSTANT(constructor_template, ZNOTEMPTY);
        NODE_DEFINE_CONSTANT(constructor_template, ZSESSIONEXPIRED);
        NODE_DEFINE_CONSTANT(constructor_template, ZINVALIDCALLBACK);
        NODE_DEFINE_CONSTANT(constructor_template, ZINVALIDACL);
        NODE_DEFINE_CONSTANT(constructor_template, ZAUTHFAILED);
        NODE_DEFINE_CONSTANT(constructor_template, ZCLOSING);
        NODE_DEFINE_CONSTANT(constructor_template, ZNOTHING);
        NODE_DEFINE_CONSTANT(constructor_template, ZSESSIONMOVED);

        //what's the advantage of using constructor_template->PrototypeTemplate()->SetAccessor ?
        constructor_template->InstanceTemplate()->SetAccessor(String::NewSymbol("state"), StatePropertyGetter, 0, Local<Value>(), PROHIBITS_OVERWRITING, ReadOnly);
        constructor_template->InstanceTemplate()->SetAccessor(String::NewSymbol("client_id"), ClientidPropertyGetter, 0, Local<Value>(), PROHIBITS_OVERWRITING, ReadOnly);
        constructor_template->InstanceTemplate()->SetAccessor(String::NewSymbol("client_password"), ClientPasswordPropertyGetter, 0, Local<Value>(), PROHIBITS_OVERWRITING, ReadOnly);
        constructor_template->InstanceTemplate()->SetAccessor(String::NewSymbol("timeout"), SessionTimeoutPropertyGetter, 0, Local<Value>(), PROHIBITS_OVERWRITING, ReadOnly);
        constructor_template->InstanceTemplate()->SetAccessor(String::NewSymbol("is_unrecoverable"), IsUnrecoverablePropertyGetter, 0, Local<Value>(), PROHIBITS_OVERWRITING, ReadOnly);

        target->Set(String::NewSymbol("ZooKeeper"), constructor_template->GetFunction());
    }

    static Handle<Value> New (const Arguments& args) {
        HandleScope scope;
        ZooKeeper *zk = new ZooKeeper();

        zk->Wrap(args.This());
        //zk->handle_.ClearWeak();
        return args.This();
    }

    void yield () {
        if (is_closed) {
            return;
        }

        last_activity = uv_now(uv_default_loop());

        int rc = zookeeper_interest(zhandle, &fd, &interest, &tv);
        if (rc) {
            LOG_ERROR(("yield:zookeeper_interest returned error: %d - %s\n", rc, zerror(rc)));
            return;
        }

        if (fd == -1 ) {
            if (uv_is_active((uv_handle_t*) &zk_io)) {
                uv_poll_stop(&zk_io);
            }
            return;
        }

        int64_t delay = tv.tv_sec * 1000 + tv.tv_usec / 1000.;

        int events = (interest & ZOOKEEPER_READ ? UV_READABLE : 0) | (interest & ZOOKEEPER_WRITE ? UV_WRITABLE : 0);
        LOG_DEBUG(("Interest in (fd=%i, read=%s, write=%s, timeout=%d)",
                   fd,
                   events & UV_READABLE ? "true" : "false",
                   events & UV_WRITABLE ? "true" : "false",
                   delay));

        if (uv_is_active ((uv_handle_t*) &zk_io)) {
            uv_poll_stop(&zk_io);
        }

        uv_poll_init(uv_default_loop(), &zk_io, fd);
        uv_poll_start(&zk_io, events, &zk_io_cb);

        uv_timer_start(&zk_timer, &zk_timer_cb, delay, delay);
    }

    static void zk_io_cb (uv_poll_t *w, int status, int revents) {
        LOG_DEBUG(("zk_io_cb fired"));
        ZooKeeper *zk = static_cast<ZooKeeper*>(w->data);

        int events;

        if (status < 0 ) {
            events = ZOOKEEPER_READ | ZOOKEEPER_WRITE;
        } else {
            events = (revents & UV_READABLE ? ZOOKEEPER_READ : 0) | (revents & UV_WRITABLE ? ZOOKEEPER_WRITE : 0);
        }

        int rc = zookeeper_process (zk->zhandle, events);
        if (rc != ZOK) {
            LOG_ERROR(("yield:zookeeper_process returned error: %d - %s\n", rc, zerror(rc)));
        }
        zk->yield();
    }

    static void zk_timer_cb (uv_timer_t *w, int status) {
        LOG_DEBUG(("zk_timer_cb fired"));

        ZooKeeper *zk = static_cast<ZooKeeper*>(w->data);
        int64_t now = uv_now(uv_default_loop());
        int64_t timeout = zk->last_activity + zk->tv.tv_sec * 1000 + zk->tv.tv_usec / 1000.;

        // if last_activity + tv.tv_sec is older than now, we did time out
        if (timeout < now) {
            LOG_DEBUG(("ping timer went off"));
            // timeout occurred, take action
            zk->yield ();
        } else {
            // callback was invoked, but there was some activity, re-arm
            // the watcher to fire in last_activity + 60, which is
            // guaranteed to be in the future, so "again" is positive:
            int64_t delay = timeout - now + 1;
            uv_timer_start(w, &zk_timer_cb, delay, delay);

            LOG_DEBUG(("delaying ping timer by %lu", delay));
        }
    }

    inline bool realInit (const char* hostPort, int session_timeout, clientid_t *client_id) {
        myid = *client_id;
        zhandle = zookeeper_init(hostPort, main_watcher, session_timeout, &myid, this, 0);
        if (!zhandle) {
            LOG_ERROR(("zookeeper_init returned 0!"));
            return false;
        }
        Ref();

        uv_timer_init(uv_default_loop(), &zk_timer);
        zk_io.data = zk_timer.data = this;

        yield();
        return true;
    }
    static Handle<Value> Init (const Arguments& args) {
        HandleScope scope;

        THROW_IF_NOT(args.Length() >= 1, "Must pass ZK init object");
        THROW_IF_NOT(args[0]->IsObject(), "Init argument must be an object");
        Local<Object> arg = args[0]->ToObject();

        int32_t debug_level = arg->Get(String::NewSymbol("debug_level"))->ToInt32()->Value();
        zoo_set_debug_level(static_cast<ZooLogLevel>(debug_level));

        bool order = arg->Get(String::NewSymbol("host_order_deterministic"))->ToBoolean()->BooleanValue();
        zoo_deterministic_conn_order(order); // enable deterministic order

        String::AsciiValue _hostPort (arg->Get(String::NewSymbol("connect"))->ToString());
        int32_t session_timeout = arg->Get(String::NewSymbol("timeout"))->ToInt32()->Value();
        if (session_timeout == 0) {
            session_timeout = 20000;
        }

        clientid_t local_client;
        ZERO_MEM (local_client);
        v8::Local<v8::Value> v8v_client_id = arg->Get(String::NewSymbol("client_id"));
        v8::Local<v8::Value> v8v_client_password = arg->Get(String::NewSymbol("client_password"));
        bool id_and_password_defined = (!v8v_client_id->IsUndefined() && !v8v_client_password->IsUndefined());
        bool id_and_password_undefined = (v8v_client_id->IsUndefined() && v8v_client_password->IsUndefined());
        THROW_IF_NOT ((id_and_password_defined || id_and_password_undefined), 
            "ZK init: client id and password must either be both specified or unspecified");
        if (id_and_password_defined) {
          String::AsciiValue password_check(v8v_client_password->ToString());
          THROW_IF_NOT (password_check.length() == 2 * ZOOKEEPER_PASSWORD_BYTE_COUNT, 
              "ZK init: password does not have correct length");
          HexStringToPassword(v8v_client_password, local_client.passwd);
          StringToId(v8v_client_id, &local_client.client_id);
        }

        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(args.This());
        assert(zk);

        if (!zk->realInit(*_hostPort, session_timeout, &local_client)) {
            return ErrnoException(errno, "zookeeper_init", "failed to init", __FILE__);
        } else {
            return args.This();
        }
    }

    static void main_watcher (zhandle_t *zzh, int type, int state, const char *path, void* context) {
        LOG_DEBUG(("main watcher event: type=%d, state=%d, path=%s", type, state, (path ? path: "null")));
        ZooKeeper *zk = static_cast<ZooKeeper *>(context);

        if (type == ZOO_SESSION_EVENT) {
            if (state == ZOO_CONNECTED_STATE) {
                zk->myid = *(zoo_client_id(zzh));
                zk->DoEmitPath(on_connected, path);
            } else if (state == ZOO_CONNECTING_STATE) {
                zk->DoEmitPath (on_connecting, path);
            } else if (state == ZOO_AUTH_FAILED_STATE) {
                LOG_ERROR(("Authentication failure. Shutting down...\n"));
                zk->realClose(ZOO_AUTH_FAILED_STATE);
            } else if (state == ZOO_EXPIRED_SESSION_STATE) {
                LOG_ERROR(("Session expired. Shutting down...\n"));
                zk->realClose(ZOO_EXPIRED_SESSION_STATE);
            }
        } else if (type == ZOO_CREATED_EVENT) {
            zk->DoEmitPath(on_event_created, path);
        } else if (type == ZOO_DELETED_EVENT) {
            zk->DoEmitPath(on_event_deleted, path);
        } else if (type == ZOO_CHANGED_EVENT) {
            zk->DoEmitPath(on_event_changed, path);
        } else if (type == ZOO_CHILD_EVENT) {
            zk->DoEmitPath(on_event_child, path);
        } else if (type == ZOO_NOTWATCHING_EVENT) {
            zk->DoEmitPath(on_event_notwatching, path);
        } else {
            LOG_WARN(("Unknonwn watcher event type %s",type));
        }
    }

    static Local<String> idAsString (int64_t id) {
        HandleScope scope;
        char idbuff [128] = {0};
        sprintf(idbuff, "%llx", _LL_CAST_ id);
        return scope.Close(String::NewSymbol(idbuff));
    }

    static void StringToId (v8::Local<v8::Value> s, int64_t *id) {
        String::AsciiValue a(s->ToString());
        sscanf(*a, "%llx", _LLP_CAST_ id);
    }

    static Local<String> PasswordToHexString (const char *p) {
        HandleScope scope;
        char buff[ZOOKEEPER_PASSWORD_BYTE_COUNT * 2 + 1], *b = buff;
        for (int i = 0; i < ZOOKEEPER_PASSWORD_BYTE_COUNT; ++i) {
            ucharToHex((unsigned char *) (p + i), b);
            b += 2;
        }
        buff[ZOOKEEPER_PASSWORD_BYTE_COUNT * 2] = '\0';
        return scope.Close(String::NewSymbol(buff));
    }

    static void HexStringToPassword (v8::Local<v8::Value> s, char *p) {
        String::AsciiValue a(s->ToString());
        char *hex = *a;
        for (int i = 0; i < ZOOKEEPER_PASSWORD_BYTE_COUNT; ++i) {
          hexToUchar(hex, (unsigned char *)p+i);
          hex += 2;
        }
    }

    void DoEmitPath (Handle<String> event_name, const char* path = NULL) {
        HandleScope scope;
        Local<Value> str;

        if (path != 0) {
            str = String::New(path);
            LOG_DEBUG(("calling Emit(%s, path='%s')", *String::Utf8Value(event_name), path));
        } else {
            str = Local<Value>::New(Undefined());
            LOG_DEBUG(("calling Emit(%s, path=null)", *String::Utf8Value(event_name)));
        }

        this->DoEmit(event_name, str);
    }

    void DoEmitClose (Handle<String> event_name, int code) {
        HandleScope scope;
        Local<Value> v8code = Number::New(code);

        this->DoEmit(event_name, v8code);
    }

    void DoEmit (Handle<String> event_name, Handle<Value> data) {
        HandleScope scope;

        Local<Value> argv[3];
        argv[0] = Local<Value>::New(event_name);
        argv[1] = Local<Value>::New(handle_);
        argv[2] = Local<Value>::New(data);

        Local<Value> emit_v = handle_->Get(String::NewSymbol("emit"));
        assert(emit_v->IsFunction());
        Local<Function> emit_fn = emit_v.As<Function>();
        
        TryCatch tc;

        emit_fn->Call(handle_, 3, argv);

        if(tc.HasCaught()) {
            FatalException(tc);
        }
    }

#define CALLBACK_PROLOG(args) \
        HandleScope scope; \
        Persistent<Function> *callback = cb_unwrap((void*)cb); \
        assert (callback); \
        Local<Value> lv = (*callback)->GetHiddenValue(HIDDEN_PROP_ZK); \
        /*(*callback)->DeleteHiddenValue(HIDDEN_PROP_ZK);*/ \
        Local<Object> zk_handle = Local<Object>::Cast(lv); \
        ZooKeeper *zkk = ObjectWrap::Unwrap<ZooKeeper>(zk_handle); \
        assert(zkk);\
        assert(zkk->handle_ == zk_handle); \
        Local<Value> argv[args]; \
        argv[0] = Int32::New(rc); \
        argv[1] = String::NewSymbol (zerror(rc))

#define CALLBACK_EPILOG() \
        TryCatch try_catch; \
        (*callback)->Call(v8::Context::GetCurrent()->Global(), sizeof(argv)/sizeof(argv[0]), argv); \
        if (try_catch.HasCaught()) { \
            FatalException(try_catch); \
        }; \
        cb_destroy (callback)

#define WATCHER_CALLBACK_EPILOG() \
        TryCatch try_catch; \
        (*callback)->Call(v8::Context::GetCurrent()->Global(), sizeof(argv)/sizeof(argv[0]), argv); \
        if (try_catch.HasCaught()) { \
            FatalException(try_catch); \
        };

#define A_METHOD_PROLOG(nargs) \
        HandleScope scope; \
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(args.This()); \
        assert(zk);\
        THROW_IF_NOT (args.Length() >= nargs, "expected "#nargs" arguments") \
        assert (args[nargs-1]->IsFunction()); \
        Persistent<Function> *cb = cb_persist (args[nargs-1]); \
        (*cb)->SetHiddenValue(HIDDEN_PROP_ZK, zk->handle_); \

#define METHOD_EPILOG(call) \
        int ret = (call); \
        return scope.Close(Int32::New(ret))

#define WATCHER_PROLOG(args) \
        if (zoo_state(zh) == ZOO_EXPIRED_SESSION_STATE) { return; } \
        HandleScope scope; \
        Persistent<Function> *callback = cb_unwrap((void*)watcherCtx); \
        assert (callback); \
        Local<Value> lv_zk = (*callback)->GetHiddenValue(HIDDEN_PROP_ZK); \
        /* (*callback)->DeleteHiddenValue(HIDDEN_PROP_ZK); */ \
        Local<Object> zk_handle = Local<Object>::Cast(lv_zk); \
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(zk_handle); \
        assert(zk);\
        assert(zk->handle_ == zk_handle); \
        assert(zk->zhandle == zh); \
        Local<Value> argv[args]; \
        argv[0] = Integer::New(type); \
        argv[1] = Integer::New(state); \
        argv[2] = String::New(path); \
        Local<Value> lv_hb = (*callback)->GetHiddenValue(HIDDEN_PROP_HANDBACK); \
        /* (*callback)->DeleteHiddenValue(HIDDEN_PROP_HANDBACK); */ \
        argv[3] = Local<Value>::New(Undefined ()); \
        if (!lv_hb.IsEmpty()) argv[3] = lv_hb

#define AW_METHOD_PROLOG(nargs) \
        HandleScope scope; \
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(args.This()); \
        assert(zk);\
        THROW_IF_NOT (args.Length() >= nargs, "expected at least "#nargs" arguments") \
        assert (args[nargs-1]->IsFunction()); \
        Persistent<Function> *cb = cb_persist (args[nargs-1]); \
        (*cb)->SetHiddenValue(HIDDEN_PROP_ZK, zk->handle_); \
        \
        assert (args[nargs-2]->IsFunction()); \
        Persistent<Function> *cbw = cb_persist (args[nargs-2]); \
        (*cbw)->SetHiddenValue(HIDDEN_PROP_ZK, zk->handle_)

/*
        if (args.Length() > nargs) { \
            (*cbw)->SetHiddenValue(HIDDEN_PROP_HANDBACK, args[nargs]); \
        }
*/

    static void string_completion (int rc, const char *value, const void *cb) {
        if (value == 0) {
            value = "null";
        }

        LOG_DEBUG(("rc=%d, rc_string=%s, path=%s, data=%lp", rc, zerror(rc), value, cb));

        CALLBACK_PROLOG(3);
        argv[2] = String::New(value);
        CALLBACK_EPILOG();
    }

    static Handle<Value> ACreate (const Arguments& args) {
        A_METHOD_PROLOG(4);

        String::Utf8Value _path (args[0]->ToString());
        uint32_t flags = args[2]->ToUint32()->Uint32Value();

        if (Buffer::HasInstance(args[1])) { // buffer
            Local<Object> _data = args[1]->ToObject();
            METHOD_EPILOG(zoo_acreate(zk->zhandle, *_path, BufferData(_data), BufferLength(_data), &ZOO_OPEN_ACL_UNSAFE, flags, string_completion, cb));
        } else {    // other
            String::Utf8Value _data (args[1]->ToString());
            METHOD_EPILOG(zoo_acreate(zk->zhandle, *_path, *_data, _data.length(), &ZOO_OPEN_ACL_UNSAFE, flags, string_completion, cb));
        }
    }

    static void void_completion (int rc, const void *data) {
        struct completion_data *d = (struct completion_data *) data;
        void *cb = (void *) d->cb;

        if (d->type == ZOO_SETACL_OP) {
            deallocate_ACL_vector((struct ACL_vector *)d->data);
            free(d->data);
        }

        CALLBACK_PROLOG(2);
        LOG_DEBUG(("rc=%d, rc_string=%s", rc, zerror(rc)));
        CALLBACK_EPILOG();

        free(d);
    }

    static Handle<Value> ADelete (const Arguments& args) {
        A_METHOD_PROLOG(3);
        String::Utf8Value _path (args[0]->ToString());
        uint32_t version = args[1]->ToUint32()->Uint32Value();

        struct completion_data *data = (struct completion_data *) malloc(sizeof(struct completion_data));
        data->cb = cb;
        data->type = ZOO_DELETE_OP;
        data->data = NULL;

        METHOD_EPILOG (zoo_adelete(zk->zhandle, *_path, version, &void_completion, data));
    }

    Local<Object> createStatObject (const struct Stat *stat) {
        HandleScope scope;
        Local<Object> o = Object::New();
        o->Set(String::NewSymbol("czxid"), Number::New(stat->czxid), ReadOnly);
        o->Set(String::NewSymbol("mzxid"), Number::New(stat->mzxid), ReadOnly);
        o->Set(String::NewSymbol("pzxid"), Number::New(stat->pzxid), ReadOnly);
        o->Set(String::NewSymbol("dataLength"), Integer::New(stat->dataLength), ReadOnly);
        o->Set(String::NewSymbol("numChildren"), Integer::New(stat->numChildren), ReadOnly);
        o->Set(String::NewSymbol("version"), Integer::New(stat->version), ReadOnly);
        o->Set(String::NewSymbol("cversion"), Integer::New(stat->cversion), ReadOnly);
        o->Set(String::NewSymbol("aversion"), Integer::New(stat->aversion), ReadOnly);
        o->Set(String::NewSymbol("ctime"), NODE_UNIXTIME_V8(stat->ctime/1000.), ReadOnly);
        o->Set(String::NewSymbol("mtime"), NODE_UNIXTIME_V8(stat->mtime/1000.), ReadOnly);
        o->Set(String::NewSymbol("ephemeralOwner"), idAsString(stat->ephemeralOwner), ReadOnly);
        o->Set(String::NewSymbol("createdInThisSession"), Boolean::New(myid.client_id == stat->ephemeralOwner), ReadOnly);
        return scope.Close(o);
    }

    static void stat_completion (int rc, const struct Stat *stat, const void *cb) {
        CALLBACK_PROLOG(3);

        LOG_DEBUG(("rc=%d, rc_string=%s", rc, zerror(rc)));
        argv[2] = rc == ZOK ? zkk->createStatObject (stat) : Object::Cast(*Null());

        CALLBACK_EPILOG();
    }

    static Handle<Value> AExists (const Arguments& args) {
        A_METHOD_PROLOG(3);

        String::Utf8Value _path (args[0]->ToString());
        bool watch = args[1]->ToBoolean()->BooleanValue();

        METHOD_EPILOG(zoo_aexists(zk->zhandle, *_path, watch, &stat_completion, cb));
    }

    static Handle<Value> AWExists (const Arguments& args) {
        AW_METHOD_PROLOG(3);
        String::Utf8Value _path (args[0]->ToString());
        METHOD_EPILOG(zoo_awexists(zk->zhandle, *_path, &watcher_fn, cbw, &stat_completion, cb));
    }

    static void data_completion (int rc, const char *value, int value_len, const struct Stat *stat, const void *cb) {
        CALLBACK_PROLOG(4);

        LOG_DEBUG(("rc=%d, rc_string=%s, value=%s", rc, zerror(rc), value));

        argv[2] = stat != 0 ? zkk->createStatObject (stat) : Object::Cast(*Null());

        if (value != 0) {
            Buffer* b = Buffer::New(value_len);
            memcpy(BufferData(b), value, value_len);
            argv[3] = Local<Value>::New(b->handle_);
        } else {
            argv[3] = String::Cast(*Null());
        }

        CALLBACK_EPILOG();
    }

    static Handle<Value> Delete (const Arguments& args) {
        HandleScope scope;

        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(args.This());   
        assert(zk);
        String::Utf8Value _path (args[0]->ToString());
        uint32_t version = args[1]->ToUint32()->Uint32Value();
  
        int ret = zoo_delete(zk->zhandle, *_path, version);
        return scope.Close(Int32::New(ret));
    }

    static Handle<Value> AGet (const Arguments& args) {
        A_METHOD_PROLOG(3);

        String::Utf8Value _path (args[0]->ToString());
        bool watch = args[1]->ToBoolean()->BooleanValue();

        METHOD_EPILOG(zoo_aget(zk->zhandle, *_path, watch, &data_completion, cb));
    }

    static void watcher_fn (zhandle_t *zh, int type, int state, const char *path, void *watcherCtx) {
        WATCHER_PROLOG(4);
        WATCHER_CALLBACK_EPILOG();
    }

    static Handle<Value> AWGet (const Arguments& args) {
        AW_METHOD_PROLOG(3);

        String::Utf8Value _path (args[0]->ToString());

        METHOD_EPILOG(zoo_awget(zk->zhandle, *_path, &watcher_fn, cbw, &data_completion, cb));
    }

    static Handle<Value> ASet (const Arguments& args) {
        A_METHOD_PROLOG(4);

        String::Utf8Value _path (args[0]->ToString());
        uint32_t version = args[2]->ToUint32()->Uint32Value();

        if (Buffer::HasInstance(args[1])) { // buffer
            Local<Object> _data = args[1]->ToObject();
            METHOD_EPILOG(zoo_aset(zk->zhandle, *_path, BufferData(_data), BufferLength(_data), version, &stat_completion, cb));
        } else {    // other
            String::Utf8Value _data(args[1]->ToString());
            METHOD_EPILOG(zoo_aset(zk->zhandle, *_path, *_data, _data.length(), version, &stat_completion, cb));
        }
    }

    static void strings_completion (int rc, const struct String_vector *strings, const void *cb) {
        CALLBACK_PROLOG(3);

        LOG_DEBUG(("rc=%d, rc_string=%s", rc, zerror(rc)));

        if (strings != NULL) {
            Local<Array> ar = Array::New((uint32_t)strings->count);
            for (uint32_t i = 0; i < (uint32_t)strings->count; ++i) {
                ar->Set(i, String::New(strings->data[i]));
            }
            argv[2] = ar;
        } else {
            argv[2] = Object::Cast(*Null());
        }

        CALLBACK_EPILOG();
    }

    static Handle<Value> AGetChildren (const Arguments& args) {
        A_METHOD_PROLOG(3);

        String::Utf8Value _path (args[0]->ToString());
        bool watch = args[1]->ToBoolean()->BooleanValue();

        METHOD_EPILOG(zoo_aget_children(zk->zhandle, *_path, watch, &strings_completion, cb));
    }

    static Handle<Value> AWGetChildren (const Arguments& args) {
        AW_METHOD_PROLOG(3);

        String::Utf8Value _path (args[0]->ToString());

        METHOD_EPILOG(zoo_awget_children(zk->zhandle, *_path, &watcher_fn, cbw, &strings_completion, cb));
    }

    static void strings_stat_completion (int rc, const struct String_vector *strings, const struct Stat *stat, const void *cb) {
        CALLBACK_PROLOG(4);

        LOG_DEBUG(("rc=%d, rc_string=%s", rc, zerror(rc)));

        if (strings != NULL) {
            Local<Array> ar = Array::New((uint32_t)strings->count);
            for (uint32_t i = 0; i < (uint32_t)strings->count; ++i) {
                ar->Set(i, String::New(strings->data[i]));
            }
            argv[2] = ar;
        } else {
            argv[2] = Object::Cast(*Null());
        }

        argv[3] = (stat != 0 ? zkk->createStatObject (stat) : Object::Cast(*Null()));

        CALLBACK_EPILOG();
    }

    static Handle<Value> AGetChildren2 (const Arguments& args) {
        A_METHOD_PROLOG(3);

        String::Utf8Value _path (args[0]->ToString());
        bool watch = args[1]->ToBoolean()->BooleanValue();

        METHOD_EPILOG(zoo_aget_children2(zk->zhandle, *_path, watch, &strings_stat_completion, cb));
    }

    static Handle<Value> AWGetChildren2 (const Arguments& args) {
        AW_METHOD_PROLOG(3);

        String::Utf8Value _path (args[0]->ToString());

        METHOD_EPILOG(zoo_awget_children2(zk->zhandle, *_path, &watcher_fn, cbw, &strings_stat_completion, cb));
    }

    static Handle<Value> AGetAcl (const Arguments& args) {
        A_METHOD_PROLOG(2);

        String::Utf8Value _path (args[0]->ToString());

        METHOD_EPILOG(zoo_aget_acl(zk->zhandle, *_path, &acl_completion, cb));
    }

    static Handle<Value> ASetAcl (const Arguments& args) {
        A_METHOD_PROLOG(4);

        String::Utf8Value _path (args[0]->ToString());
        uint32_t _version = args[1]->ToUint32()->Uint32Value();
        Local<Array> arr = Local<Array>::Cast(args[2]);

        struct ACL_vector *aclv = zk->createAclVector(arr);

        struct completion_data *data = (struct completion_data *) malloc(sizeof(struct completion_data));
        data->cb = cb;
        data->type = ZOO_SETACL_OP;
        data->data = aclv;

        METHOD_EPILOG(zoo_aset_acl(zk->zhandle, *_path, _version, aclv, void_completion, data));
    }

    static Handle<Value> AddAuth (const Arguments& args) {
        A_METHOD_PROLOG(3);

        String::Utf8Value _scheme (args[0]->ToString());
        String::Utf8Value _auth (args[1]->ToString());

        struct completion_data *data = (struct completion_data *) malloc(sizeof(struct completion_data));
        data->cb = cb;
        data->type = ZOO_SETAUTH_OP;
        data->data = NULL;

        METHOD_EPILOG(zoo_add_auth(zk->zhandle, *_scheme, *_auth, _auth.length(), void_completion, data));
    }

    Local<Object> createAclObject (struct ACL_vector *aclv) {
        HandleScope scope;

        Local<Array> arr = Array::New(aclv->count);

        for (int i = 0; i < aclv->count; i++) {
            struct ACL *acl = &aclv->data[i];

            Local<Object> obj = Object::New();
            obj->Set(String::NewSymbol("perms"), Integer::New(acl->perms), ReadOnly);
            obj->Set(String::NewSymbol("scheme"), String::New(acl->id.scheme), ReadOnly);
            obj->Set(String::NewSymbol("auth"), String::New(acl->id.id), ReadOnly);

            arr->Set(i, obj);
        }

        return scope.Close(arr);
    };

    struct ACL_vector *createAclVector (Handle<Array> arr) {
        HandleScope scope;

        struct ACL_vector *aclv = (struct ACL_vector *) malloc(sizeof(struct ACL_vector));
        aclv->count = arr->Length();
        aclv->data = (struct ACL *) calloc(aclv->count, sizeof(struct ACL));

        for (int i = 0, l = aclv->count; i < l; i++) {
            Local<Object> obj = Local<Object>::Cast(arr->Get(i));

            String::Utf8Value _scheme (obj->Get(String::NewSymbol("scheme"))->ToString());
            String::Utf8Value _auth (obj->Get(String::NewSymbol("auth"))->ToString());
            uint32_t _perms = obj->Get(String::NewSymbol("perms"))->ToUint32()->Uint32Value();

            struct Id id;
            struct ACL *acl = &aclv->data[i];

            id.scheme = strdup(*_scheme);
            id.id = strdup(*_auth);

            acl->perms = _perms;
            acl->id = id;
        }

        scope.Close(Undefined());

        return aclv;
    }

    static void acl_completion (int rc, struct ACL_vector *acl, struct Stat *stat, const void *cb) {
        LOG_DEBUG(("rc=%d, rc_string=%s, acl_vector=%lp", rc, zerror(rc), acl));
        CALLBACK_PROLOG(4);

        argv[2] = acl != NULL ? zkk->createAclObject(acl) : Object::Cast(*Null());
        argv[3] = stat != NULL ? zkk->createStatObject(stat) : Object::Cast(*Null());

        deallocate_ACL_vector(acl);

        CALLBACK_EPILOG();
    }

    static Handle<Value> StatePropertyGetter (Local<String> property, const AccessorInfo& info) {
        HandleScope scope;
        assert(info.This().IsEmpty() == false);
        assert(info.This()->IsObject());
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(info.This());
        assert(zk);
        assert(zk->handle_ == info.This());
        return Integer::New (zk->zhandle != 0 ? zoo_state(zk->zhandle) : 0);
    }

    static Handle<Value> ClientidPropertyGetter (Local<String> property, const AccessorInfo& info) {
        HandleScope scope;
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(info.This());
        assert(zk);
        return zk->idAsString(zk->zhandle != 0 ? zoo_client_id(zk->zhandle)->client_id : zk->myid.client_id);
    }
    static Handle<Value> ClientPasswordPropertyGetter (Local<String> property, const AccessorInfo& info) {
        HandleScope scope;
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(info.This());
        assert(zk);
        return zk->PasswordToHexString(zk->zhandle != 0 ? zoo_client_id(zk->zhandle)->passwd : zk->myid.passwd);
    }

    static Handle<Value> SessionTimeoutPropertyGetter (Local<String> property, const AccessorInfo& info) {
        HandleScope scope;
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(info.This());
        assert(zk);
        return Integer::New (zk->zhandle != 0 ? zoo_recv_timeout(zk->zhandle) : -1);
    }

    static Handle<Value> IsUnrecoverablePropertyGetter (Local<String> property, const AccessorInfo& info) {
        HandleScope scope;
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(info.This());
        assert(zk);
        return Integer::New (zk->zhandle != 0 ? is_unrecoverable(zk->zhandle) : 0);
    }

    void realClose (int code) {
        if (is_closed) {
            return;
        }

        is_closed = true;

        if (uv_is_active ((uv_handle_t*) &zk_timer)) {
            uv_timer_stop(&zk_timer);
        }

        if (zhandle) {
            LOG_DEBUG(("call zookeeper_close(%lp)", zhandle));
            zookeeper_close(zhandle);
            zhandle = 0;

            LOG_DEBUG(("zookeeper_close() returned"));

            if (uv_is_active((uv_handle_t*) &zk_io)) {
                uv_poll_stop(&zk_io);
            }
            Unref();
            DoEmitClose (on_closed, code);
        }
    }

    static Handle<Value> Close (const Arguments& args) {
        HandleScope scope;
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(args.This());
        assert(zk);
        zk->realClose(0);
        return args.This();
    };

    virtual ~ZooKeeper() {
        //realClose ();
        LOG_INFO(("ZooKeeper destructor invoked"));
    }


    ZooKeeper () : zhandle(0), clientIdFile(0), fd(-1) {
        ZERO_MEM (myid);
        ZERO_MEM (zk_io);
        ZERO_MEM (zk_timer);
        is_closed = false;
    }
private:
    zhandle_t *zhandle;
    clientid_t myid;
    const char *clientIdFile;
    uv_poll_t zk_io;
    uv_timer_t zk_timer;
    int fd;
    int interest;
    timeval tv;
    int64_t last_activity; // time of last zookeeper event loop activity
    bool is_closed;
};

} // namespace "zk"

extern "C" void init(Handle<Object> target) {
  zk::ZooKeeper::Initialize(target);
}

NODE_MODULE(zookeeper, init)
