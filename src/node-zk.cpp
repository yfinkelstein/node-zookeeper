#include <string.h>
#ifdef WIN32
    #define _MSC_STDINT_H_
    #include <iostream>
    #include <stdint.h>
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #include <stdlib.h>
    #include <stdio.h>
    #include <windows.h>
#else
    #include <strings.h>
    #include <errno.h>
#endif
#include <assert.h>
#include <stdarg.h>
#include <node.h>
#include <node_buffer.h>
#include <node_object_wrap.h>
#include <v8.h>
#undef THREADED
#include <zookeeper.h>
#include "nan.h"
#include "zk_log.h"
#include "buffer_compat.h"
#include "converters.hpp"
using namespace v8;
using namespace node;
using namespace nodezk;

#ifdef WIN32
    #pragma comment (lib, "Ws2_32.lib")
    #pragma comment (lib, "Mswsock.lib")
    #pragma comment (lib, "AdvApi32.lib")
#endif


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
#ifdef WIN32
	#define ZERO_MEM(member) memset(&(member), 0x0, sizeof(member))
#else
	#define ZERO_MEM(member) bzero(&(member), sizeof(member))
#endif
#define _LL_CAST_ (long long)
#define _LLP_CAST_ (long long *)

#define THROW_IF_NOT(condition, text) if (!(condition)) { \
      return Nan::ThrowError(text); \
    }

#define THROW_IF_NOT_R(condition, text) if (!(condition)) { \
      Nan::ThrowError(text); \
      return; \
    }


#define RETURN_THIS(info) info.GetReturnValue().Set(info.This())
#define RETURN_VALUE(info, value) info.GetReturnValue().Set(value)

#define LOCAL_STRING(str) Nan::New<String>(str).ToLocalChecked()

#define DECLARE_STRING(ev) static Nan::Persistent<String> ev;
#define INITIALIZE_STRING(ev, str) ev.Reset(LOCAL_STRING(str));

DECLARE_STRING (on_closed);
DECLARE_STRING (on_connected);
DECLARE_STRING (on_connecting);
DECLARE_STRING (on_event_created);
DECLARE_STRING (on_event_deleted);
DECLARE_STRING (on_event_changed);
DECLARE_STRING (on_event_child);
DECLARE_STRING (on_event_notwatching);

#define DECLARE_SYMBOL(ev)   DECLARE_STRING(ev)
#define INITIALIZE_SYMBOL(ev) INITIALIZE_STRING(ev, #ev)

DECLARE_SYMBOL (PRIVATE_PROP_ZK);
DECLARE_SYMBOL (PRIVATE_PROP_HANDBACK);

#define ZOOKEEPER_PASSWORD_BYTE_COUNT 16

void delete_on_close(uv_handle_t* handle) {
    free(handle);
}

struct completion_data {
    Nan::Callback *cb;
    int32_t type;
    void *data;
};

class ZooKeeper: public Nan::ObjectWrap {
public:
    static void Initialize (Local<Object> target) {
        Nan::HandleScope scope;

        Local<FunctionTemplate> constructor_template = Nan::New<FunctionTemplate>(New);
        constructor_template->SetClassName(LOCAL_STRING("ZooKeeper"));
        constructor_template->InstanceTemplate()->SetInternalFieldCount(1);

        Nan::SetPrototypeMethod(constructor_template,  "init",  Init);
        Nan::SetPrototypeMethod(constructor_template,  "close",  Close);
        Nan::SetPrototypeMethod(constructor_template,  "a_create",  ACreate);
        Nan::SetPrototypeMethod(constructor_template,  "a_exists",  AExists);
        Nan::SetPrototypeMethod(constructor_template,  "aw_exists",  AWExists);
        Nan::SetPrototypeMethod(constructor_template,  "a_get",  AGet);
        Nan::SetPrototypeMethod(constructor_template,  "aw_get",  AWGet);
        Nan::SetPrototypeMethod(constructor_template,  "a_get_children",  AGetChildren);
        Nan::SetPrototypeMethod(constructor_template,  "aw_get_children",  AWGetChildren);
        Nan::SetPrototypeMethod(constructor_template,  "a_get_children2",  AGetChildren2);
        Nan::SetPrototypeMethod(constructor_template,  "aw_get_children2",  AWGetChildren2);
        Nan::SetPrototypeMethod(constructor_template,  "a_set",  ASet);
        Nan::SetPrototypeMethod(constructor_template,  "a_delete_",  ADelete);
        Nan::SetPrototypeMethod(constructor_template,  "a_get_acl",  AGetAcl);
        Nan::SetPrototypeMethod(constructor_template,  "a_set_acl",  ASetAcl);
        Nan::SetPrototypeMethod(constructor_template,  "add_auth",  AddAuth);
        Nan::SetPrototypeMethod(constructor_template,  "a_sync",  ASync);

        //what's the advantage of using constructor_template->PrototypeTemplate()->SetAccessor ?
        Nan::SetAccessor(constructor_template->InstanceTemplate(), LOCAL_STRING("state"), StatePropertyGetter, 0, Local<Value>(), PROHIBITS_OVERWRITING, ReadOnly);
        Nan::SetAccessor(constructor_template->InstanceTemplate(), LOCAL_STRING("client_id"), ClientidPropertyGetter, 0, Local<Value>(), PROHIBITS_OVERWRITING, ReadOnly);
        Nan::SetAccessor(constructor_template->InstanceTemplate(), LOCAL_STRING("client_password"), ClientPasswordPropertyGetter, 0, Local<Value>(), PROHIBITS_OVERWRITING, ReadOnly);
        Nan::SetAccessor(constructor_template->InstanceTemplate(), LOCAL_STRING("timeout"), SessionTimeoutPropertyGetter, 0, Local<Value>(), PROHIBITS_OVERWRITING, ReadOnly);
        Nan::SetAccessor(constructor_template->InstanceTemplate(), LOCAL_STRING("is_unrecoverable"), IsUnrecoverablePropertyGetter, 0, Local<Value>(), PROHIBITS_OVERWRITING, ReadOnly);


        Local<Function> constructor = constructor_template->GetFunction(Nan::GetCurrentContext()).ToLocalChecked();

        //extern ZOOAPI struct ACL_vector ZOO_OPEN_ACL_UNSAFE;
        Local<Object> acl_open = Nan::New<Object>();
        Nan::DefineOwnProperty(acl_open, LOCAL_STRING("perms"), Nan::New<Integer>(ZOO_PERM_ALL), static_cast<PropertyAttribute>(ReadOnly | DontDelete));
        Nan::DefineOwnProperty(acl_open, LOCAL_STRING("scheme"), LOCAL_STRING("world"), static_cast<PropertyAttribute>(ReadOnly | DontDelete));
        Nan::DefineOwnProperty(acl_open, LOCAL_STRING("auth"), LOCAL_STRING("anyone"), static_cast<PropertyAttribute>(ReadOnly | DontDelete));
        Nan::DefineOwnProperty(constructor, LOCAL_STRING("ZOO_OPEN_ACL_UNSAFE"), acl_open, static_cast<PropertyAttribute>(ReadOnly | DontDelete));

        //extern ZOOAPI struct ACL_vector ZOO_READ_ACL_UNSAFE;
        Local<Object> acl_read = Nan::New<Object>();
        Nan::DefineOwnProperty(acl_read, LOCAL_STRING("perms"), Nan::New<Integer>(ZOO_PERM_READ), static_cast<PropertyAttribute>(ReadOnly | DontDelete));
        Nan::DefineOwnProperty(acl_read, LOCAL_STRING("scheme"), LOCAL_STRING("world"), static_cast<PropertyAttribute>(ReadOnly | DontDelete));
        Nan::DefineOwnProperty(acl_read, LOCAL_STRING("auth"), LOCAL_STRING("anyone"), static_cast<PropertyAttribute>(ReadOnly | DontDelete));
        Nan::DefineOwnProperty(constructor, LOCAL_STRING("ZOO_READ_ACL_UNSAFE"), acl_read, static_cast<PropertyAttribute>(ReadOnly | DontDelete));

        //extern ZOOAPI struct ACL_vector ZOO_CREATOR_ALL_ACL;
        Local<Object> acl_creator = Nan::New<Object>();
        Nan::DefineOwnProperty(acl_creator, LOCAL_STRING("perms"), Nan::New<Integer>(ZOO_PERM_ALL), static_cast<PropertyAttribute>(ReadOnly | DontDelete));
        Nan::DefineOwnProperty(acl_creator, LOCAL_STRING("scheme"), LOCAL_STRING("auth"), static_cast<PropertyAttribute>(ReadOnly | DontDelete));
        Nan::DefineOwnProperty(acl_creator, LOCAL_STRING("auth"), LOCAL_STRING(""), static_cast<PropertyAttribute>(ReadOnly | DontDelete));
        Nan::DefineOwnProperty(constructor, LOCAL_STRING("ZOO_CREATOR_ALL_ACL"), acl_creator, static_cast<PropertyAttribute>(ReadOnly | DontDelete));


        NODE_DEFINE_CONSTANT(constructor, ZOO_CREATED_EVENT);
        NODE_DEFINE_CONSTANT(constructor, ZOO_DELETED_EVENT);
        NODE_DEFINE_CONSTANT(constructor, ZOO_CHANGED_EVENT);
        NODE_DEFINE_CONSTANT(constructor, ZOO_CHILD_EVENT);
        NODE_DEFINE_CONSTANT(constructor, ZOO_SESSION_EVENT);
        NODE_DEFINE_CONSTANT(constructor, ZOO_NOTWATCHING_EVENT);

        NODE_DEFINE_CONSTANT(constructor, ZOO_PERM_READ);
        NODE_DEFINE_CONSTANT(constructor, ZOO_PERM_WRITE);
        NODE_DEFINE_CONSTANT(constructor, ZOO_PERM_CREATE);
        NODE_DEFINE_CONSTANT(constructor, ZOO_PERM_DELETE);
        NODE_DEFINE_CONSTANT(constructor, ZOO_PERM_ADMIN);
        NODE_DEFINE_CONSTANT(constructor, ZOO_PERM_ALL);

        NODE_DEFINE_CONSTANT(constructor, ZOOKEEPER_WRITE);
        NODE_DEFINE_CONSTANT(constructor, ZOOKEEPER_READ);

        NODE_DEFINE_CONSTANT(constructor, ZOO_EPHEMERAL);
        NODE_DEFINE_CONSTANT(constructor, ZOO_SEQUENCE);
        NODE_DEFINE_CONSTANT(constructor, ZOO_EXPIRED_SESSION_STATE);
        NODE_DEFINE_CONSTANT(constructor, ZOO_AUTH_FAILED_STATE);
        NODE_DEFINE_CONSTANT(constructor, ZOO_CONNECTING_STATE);
        NODE_DEFINE_CONSTANT(constructor, ZOO_ASSOCIATING_STATE);
        NODE_DEFINE_CONSTANT(constructor, ZOO_CONNECTED_STATE);

        NODE_DEFINE_CONSTANT(constructor, ZOO_CREATED_EVENT);
        NODE_DEFINE_CONSTANT(constructor, ZOO_DELETED_EVENT);
        NODE_DEFINE_CONSTANT(constructor, ZOO_CHANGED_EVENT);
        NODE_DEFINE_CONSTANT(constructor, ZOO_CHILD_EVENT);
        NODE_DEFINE_CONSTANT(constructor, ZOO_SESSION_EVENT);
        NODE_DEFINE_CONSTANT(constructor, ZOO_NOTWATCHING_EVENT);

        NODE_DEFINE_CONSTANT(constructor, ZOO_LOG_LEVEL_ERROR);
        NODE_DEFINE_CONSTANT(constructor, ZOO_LOG_LEVEL_WARN);
        NODE_DEFINE_CONSTANT(constructor, ZOO_LOG_LEVEL_INFO);
        NODE_DEFINE_CONSTANT(constructor, ZOO_LOG_LEVEL_DEBUG);

        NODE_DEFINE_CONSTANT(constructor, ZOO_EXPIRED_SESSION_STATE);
        NODE_DEFINE_CONSTANT(constructor, ZOO_AUTH_FAILED_STATE);
        NODE_DEFINE_CONSTANT(constructor, ZOO_CONNECTING_STATE);
        NODE_DEFINE_CONSTANT(constructor, ZOO_ASSOCIATING_STATE);
        NODE_DEFINE_CONSTANT(constructor, ZOO_CONNECTED_STATE);


        NODE_DEFINE_CONSTANT(constructor, ZOK);

        /** System and server-side errors.
         * This is never thrown by the server, it shouldn't be used other than
         * to indicate a range. Specifically error codes greater than this
         * value, but lesser than {@link #ZAPIERROR}, are system errors. */
        NODE_DEFINE_CONSTANT(constructor, ZSYSTEMERROR);
        NODE_DEFINE_CONSTANT(constructor, ZRUNTIMEINCONSISTENCY);
        NODE_DEFINE_CONSTANT(constructor, ZDATAINCONSISTENCY);
        NODE_DEFINE_CONSTANT(constructor, ZCONNECTIONLOSS);
        NODE_DEFINE_CONSTANT(constructor, ZMARSHALLINGERROR);
        NODE_DEFINE_CONSTANT(constructor, ZUNIMPLEMENTED);
        NODE_DEFINE_CONSTANT(constructor, ZOPERATIONTIMEOUT);
        NODE_DEFINE_CONSTANT(constructor, ZBADARGUMENTS);
        NODE_DEFINE_CONSTANT(constructor, ZINVALIDSTATE);

        /** API errors.
         * This is never thrown by the server, it shouldn't be used other than
         * to indicate a range. Specifically error codes greater than this
         * value are API errors (while values less than this indicate a
         * {@link #ZSYSTEMERROR}).
         */
        NODE_DEFINE_CONSTANT(constructor, ZAPIERROR);
        NODE_DEFINE_CONSTANT(constructor, ZNONODE);
        NODE_DEFINE_CONSTANT(constructor, ZNOAUTH);
        NODE_DEFINE_CONSTANT(constructor, ZBADVERSION);
        NODE_DEFINE_CONSTANT(constructor, ZNOCHILDRENFOREPHEMERALS);
        NODE_DEFINE_CONSTANT(constructor, ZNODEEXISTS);
        NODE_DEFINE_CONSTANT(constructor, ZNOTEMPTY);
        NODE_DEFINE_CONSTANT(constructor, ZSESSIONEXPIRED);
        NODE_DEFINE_CONSTANT(constructor, ZINVALIDCALLBACK);
        NODE_DEFINE_CONSTANT(constructor, ZINVALIDACL);
        NODE_DEFINE_CONSTANT(constructor, ZAUTHFAILED);
        NODE_DEFINE_CONSTANT(constructor, ZCLOSING);
        NODE_DEFINE_CONSTANT(constructor, ZNOTHING);
        NODE_DEFINE_CONSTANT(constructor, ZSESSIONMOVED);


        Nan::Set(target, LOCAL_STRING("ZooKeeper"), constructor);
    }

    static void New(const Nan::FunctionCallbackInfo<Value>& info) {
        LOG_DEBUG(NULL, "New: creating a new ZooKeeper");
        ZooKeeper *zk = new ZooKeeper();

        zk->Wrap(info.This());
        //zk->handle_.ClearWeak();
        RETURN_THIS(info);
    }

    void yield () {
        if (is_closed) {
            LOG_DEBUG(NULL, "yield: was closed");
            return;
        }

        last_activity = uv_now(uv_default_loop());

        #ifdef WIN32
            SOCKET oldFd = fd;
        #else
            int oldFd = fd;
        #endif

        int rc = zookeeper_interest(zhandle, &fd, &interest, &tv);

        if (zk_io && uv_is_active((uv_handle_t*) zk_io)) {
            uv_poll_stop(zk_io);
        }

        if (rc) {
            LOG_ERROR(NULL, "yield:zookeeper_interest returned error: %d - %s\n", rc, zerror(rc));
            return;
        }

        if (fd == -1 ) {
            if (zk_io) {
                uv_close((uv_handle_t*) zk_io, delete_on_close);
                zk_io = NULL;
            }
            return;
        }

        int64_t delay = tv.tv_sec * 1000 + tv.tv_usec / 1000.;

        int events = (interest & ZOOKEEPER_READ ? UV_READABLE : 0) | (interest & ZOOKEEPER_WRITE ? UV_WRITABLE : 0);
        LOG_DEBUG(NULL, "Interest in (fd=%i, read=%s, write=%s, timeout=%d)",
                   fd,
                   events & UV_READABLE ? "true" : "false",
                   events & UV_WRITABLE ? "true" : "false",
                   delay);

        // If the file descriptor to watch has changed, then
        // a new uv_poll_t handle needs to be created to watch it.
        if (oldFd != fd) {
            // If there was an existing handle, then clean it up
            if (zk_io) {
                uv_close((uv_handle_t*) zk_io, delete_on_close);
                zk_io = NULL;
            }

            LOG_DEBUG(NULL, "yield: creating a new poll handle for %lp", this);
            zk_io = (uv_poll_t*)malloc(sizeof(uv_poll_t));
            if (!zk_io) {
                LOG_ERROR(NULL, "Failed to malloc memory for uv_poll_t");
                return;
             }

             zk_io->data = this;
             #ifdef WIN32
             	uv_poll_init_socket(uv_default_loop(), zk_io, fd);
             #else
             	uv_poll_init(uv_default_loop(), zk_io, fd);
             #endif
        }

        LOG_DEBUG(NULL, "yield: starting poll for %lp from thread %lp", this);
        uv_poll_start(zk_io, events, &zk_io_cb);

        uv_timer_start(&zk_timer, &zk_timer_cb, delay, delay);
    }

    static void zk_io_cb (uv_poll_t *w, int status, int revents) {
        LOG_DEBUG(NULL, "zk_io_cb fired, status: %d, revents: %d", status, revents);
        ZooKeeper *zk = static_cast<ZooKeeper*>(w->data);

        int events;

        if (status < 0 ) {
            events = ZOOKEEPER_READ | ZOOKEEPER_WRITE;
        } else {
            events = (revents & UV_READABLE ? ZOOKEEPER_READ : 0) | (revents & UV_WRITABLE ? ZOOKEEPER_WRITE : 0);
        }

        int rc = zookeeper_process (zk->zhandle, events);
        if (rc != ZOK) {
            LOG_ERROR(NULL, "yield:zookeeper_process returned error: %d - %s\n", rc, zerror(rc));

            // Explicitly check for the return code, and close the session.
            if (rc == ZNOTHING) {
                zk->realClose(ZOO_EXPIRED_SESSION_STATE);
                return;
            }
        }
        zk->yield();
    }


#if UV_VERSION_MAJOR > 0
    static void zk_timer_cb (uv_timer_t *w) {
#else
    static void zk_timer_cb (uv_timer_t *w, int status) {
#endif
        LOG_DEBUG(NULL, "zk_timer_cb fired");

        ZooKeeper *zk = static_cast<ZooKeeper*>(w->data);
        int64_t now = uv_now(uv_default_loop());
        int64_t timeout = zk->last_activity + zk->tv.tv_sec * 1000 + zk->tv.tv_usec / 1000.;

        // if last_activity + tv.tv_sec is older than now, we did time out
        if (timeout < now) {
            LOG_DEBUG(NULL, "ping timer went off");
            // timeout occurred, take action
            zk->yield ();
        } else {
            // callback was invoked, but there was some activity, re-arm
            // the watcher to fire in last_activity + 60, which is
            // guaranteed to be in the future, so "again" is positive:
            int64_t delay = timeout - now + 1;
            uv_timer_start(w, &zk_timer_cb, delay, delay);

            LOG_DEBUG(NULL, "delaying ping timer by %lu", delay);
        }
    }

    inline bool realInit (const char* hostPort, int session_timeout, clientid_t *client_id) {
        if (zhandle) {
            // In case this is not the first call to realInit,
            // stop the current timer and skip re-initializing the timer
            uv_timer_stop(&zk_timer);
        }

        myid = *client_id;
        zhandle = zookeeper_init(hostPort, main_watcher, session_timeout, &myid, this, 0);
        if (!zhandle) {
            LOG_ERROR(NULL, "zookeeper_init returned 0!");
            return false;
        }
        Ref();

        uv_timer_init(uv_default_loop(), &zk_timer);
        zk_timer.data = this;

        yield();
        return true;
    }

    static void Init(const Nan::FunctionCallbackInfo<Value>& info) {
        THROW_IF_NOT(info.Length() >= 1, "Must pass ZK init object");
        THROW_IF_NOT(info[0]->IsObject(), "Init argument must be an object");
        Local<Object> arg = toLocalObj(info[0]);

        int32_t debug_level = toInt(arg, LOCAL_STRING("debug_level"));
        zoo_set_debug_level(static_cast<ZooLogLevel>(debug_level));

        bool order = toBool(arg, LOCAL_STRING("host_order_deterministic"));
        zoo_deterministic_conn_order(order); // enable deterministic order

        Nan::Utf8String _hostPort (toString(toLocalVal(arg, LOCAL_STRING("connect"))));
        int32_t session_timeout = toInt(arg, LOCAL_STRING("timeout"));
        if (session_timeout == 0) {
            session_timeout = 20000;
        }

        clientid_t local_client;
        ZERO_MEM (local_client);
        Local<Value> v8v_client_id = toLocalVal(arg, LOCAL_STRING("client_id"));
        Local<Value> v8v_client_password = toLocalVal(arg, LOCAL_STRING("client_password"));
        bool id_and_password_defined = (!v8v_client_id->IsUndefined() && !v8v_client_password->IsUndefined());
        bool id_and_password_undefined = (v8v_client_id->IsUndefined() && v8v_client_password->IsUndefined());
        THROW_IF_NOT ((id_and_password_defined || id_and_password_undefined),
            "ZK init: client id and password must either be both specified or unspecified");
        if (id_and_password_defined) {
            Nan::Utf8String password_check(toString(v8v_client_password));
            THROW_IF_NOT (password_check.length() == 2 * ZOOKEEPER_PASSWORD_BYTE_COUNT,
                          "ZK init: password does not have correct length");
            HexStringToPassword(v8v_client_password, local_client.passwd);
            StringToId(v8v_client_id, &local_client.client_id);
        }

        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(info.This());
        assert(zk);

        if (!zk->realInit(*_hostPort, session_timeout, &local_client)) {
            RETURN_VALUE(info, Nan::ErrnoException(errno, "zookeeper_init", "failed to init", __FILE__));
        } else {
            RETURN_THIS(info);
        }
    }

    static void main_watcher (zhandle_t *zzh, int type, int state, const char *path, void* context) {
        Nan::HandleScope scope;
        LOG_DEBUG(NULL, "main watcher event: type=%d, state=%d, path=%s", type, state, (path ? path: "null"));
        ZooKeeper *zk = static_cast<ZooKeeper *>(context);

        if (type == ZOO_SESSION_EVENT) {
            if (state == ZOO_CONNECTED_STATE) {
                zk->myid = *(zoo_client_id(zzh));
                zk->DoEmitPath(Nan::New(on_connected), path);
            } else if (state == ZOO_CONNECTING_STATE) {
                zk->DoEmitPath (Nan::New(on_connecting), path);
            } else if (state == ZOO_AUTH_FAILED_STATE) {
                LOG_ERROR(NULL, "Authentication failure. Shutting down...\n");
                zk->realClose(ZOO_AUTH_FAILED_STATE);
            } else if (state == ZOO_EXPIRED_SESSION_STATE) {
                LOG_ERROR(NULL, "Session expired. Shutting down...\n");
                zk->realClose(ZOO_EXPIRED_SESSION_STATE);
            }
        } else if (type == ZOO_CREATED_EVENT) {
            zk->DoEmitPath(Nan::New(on_event_created), path);
        } else if (type == ZOO_DELETED_EVENT) {
            zk->DoEmitPath(Nan::New(on_event_deleted), path);
        } else if (type == ZOO_CHANGED_EVENT) {
            zk->DoEmitPath(Nan::New(on_event_changed), path);
        } else if (type == ZOO_CHILD_EVENT) {
            zk->DoEmitPath(Nan::New(on_event_child), path);
        } else if (type == ZOO_NOTWATCHING_EVENT) {
            zk->DoEmitPath(Nan::New(on_event_notwatching), path);
        } else {
            LOG_WARN(NULL, "Unknonwn watcher event type %s",type);
        }
    }

    static Local<String> idAsString (int64_t id) {
        Nan::EscapableHandleScope scope;
        char idbuff [128] = {0};
        sprintf(idbuff, "%llx", _LL_CAST_ id);
        return scope.Escape(LOCAL_STRING(idbuff));
    }

    static void StringToId (Local<Value> s, int64_t *id) {
        Nan::Utf8String a(toString(s));
        sscanf(*a, "%llx", _LLP_CAST_ id);
    }

    static Local<String> PasswordToHexString (const char *p) {
        Nan::EscapableHandleScope scope;
        char buff[ZOOKEEPER_PASSWORD_BYTE_COUNT * 2 + 1], *b = buff;
        for (int i = 0; i < ZOOKEEPER_PASSWORD_BYTE_COUNT; ++i) {
            ucharToHex((unsigned char *) (p + i), b);
            b += 2;
        }
        buff[ZOOKEEPER_PASSWORD_BYTE_COUNT * 2] = '\0';
        return scope.Escape(LOCAL_STRING(buff));
    }

    static void HexStringToPassword (Local<Value> s, char *p) {
        Nan::Utf8String a(toString(s));
        char *hex = *a;
        for (int i = 0; i < ZOOKEEPER_PASSWORD_BYTE_COUNT; ++i) {
            hexToUchar(hex, (unsigned char *)p+i);
            hex += 2;
        }
    }

    void DoEmitPath (Local<String> event_name, const char* path = NULL) {
        Nan::HandleScope scope;
        Local<Value> str;

        if (path != 0) {
            str = LOCAL_STRING(path);
            LOG_DEBUG(NULL, "calling Emit(%s, path='%s')", *Nan::Utf8String(event_name), path);
        } else {
            str = Nan::Undefined();
            LOG_DEBUG(NULL, "calling Emit(%s, path=null)", *Nan::Utf8String(event_name));
        }

        this->DoEmit(event_name, str);
    }

    void DoEmitClose (Local<String> event_name, int code) {
        Nan::HandleScope scope;
        Local<Value> v8code = Nan::New<Number>(code);

        this->DoEmit(event_name, v8code);
    }

    void DoEmit (Local<String> event_name, Local<Value> data) {
        Nan::HandleScope scope;
        Local<Object> thisObj = this->handle();

        Local<Value> argv[3];
        argv[0] = event_name;
        argv[1] = thisObj;
        argv[2] = data;

        Nan::AsyncResource resource("node-zk:DoEmit");
        resource.runInAsyncScope(thisObj, "emit", 3, argv);
    }

#define CALLBACK_PROLOG(info) \
        Nan::HandleScope scope; \
        Nan::Callback *callback = (Nan::Callback*)(cb); \
        assert (callback); \
        Local<Value> lv = Nan::GetPrivate(callback->GetFunction(), Nan::New(PRIVATE_PROP_ZK)).ToLocalChecked(); \
        Local<Object> zk_handle = Local<Object>::Cast(lv); \
        ZooKeeper *zkk = ObjectWrap::Unwrap<ZooKeeper>(zk_handle); \
        assert(zkk);\
        assert(zkk->handle() == zk_handle);        \
        Local<Value> argv[info]; \
        argv[0] = Nan::New<Int32>(rc);           \
        argv[1] = LOCAL_STRING(zerror(rc))

#define CALLBACK_EPILOG() \
        Nan::AsyncResource resource("node-zk:CALLBACK_EPILOG"); \
        callback->Call(sizeof(argv)/sizeof(argv[0]), argv, &resource); \
        delete callback

#define WATCHER_CALLBACK_EPILOG() \
        Nan::AsyncResource resource("node-zk:WATCHER_CALLBACK_EPILOG"); \
        callback->Call(sizeof(argv)/sizeof(argv[0]), argv, &resource); \

#define A_METHOD_PROLOG(nargs) \
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(info.This()); \
        assert(zk);\
        THROW_IF_NOT (info.Length() >= nargs, "expected "#nargs" arguments") \
        assert (info[nargs-1]->IsFunction()); \
        Nan::Callback *cb = new Nan::Callback(info[nargs-1].As<Function>()); \
        Nan::SetPrivate(cb->GetFunction(), Nan::New(PRIVATE_PROP_ZK), zk->handle()); \

#define METHOD_EPILOG(call) \
        int ret = (call); \
        RETURN_VALUE(info, Nan::New<Int32>(ret))

#define WATCHER_PROLOG(info) \
        if (zoo_state(zh) == ZOO_EXPIRED_SESSION_STATE) { return; } \
        Nan::HandleScope scope;                                                    \
        Nan::Callback *callback = (Nan::Callback*)(watcherCtx);            \
        assert (callback); \
        Local<Value> lv_zk = Nan::GetPrivate(callback->GetFunction(), Nan::New(PRIVATE_PROP_ZK)).ToLocalChecked(); \
        Local<Object> zk_handle = Local<Object>::Cast(lv_zk); \
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(zk_handle); \
        assert(zk);\
        assert(zk->handle() == zk_handle); \
        assert(zk->zhandle == zh); \
        Local<Value> argv[info]; \
        argv[0] = Nan::New<Integer>(type);   \
        argv[1] = Nan::New<Integer>(state);  \
        argv[2] = LOCAL_STRING(path);                                 \
        Local<Value> lv_hb = Nan::GetPrivate(callback->GetFunction(), Nan::New(PRIVATE_PROP_HANDBACK)).ToLocalChecked(); \
        argv[3] = Nan::Undefined();    \
        if (!lv_hb.IsEmpty()) argv[3] = lv_hb

#define AW_METHOD_PROLOG(nargs) \
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(info.This()); \
        assert(zk);\
        THROW_IF_NOT (info.Length() >= nargs, "expected at least "#nargs" arguments") \
        assert (info[nargs-1]->IsFunction()); \
        Nan::Callback *cb = new Nan::Callback (info[nargs-1].As<Function>()); \
        Nan::SetPrivate(cb->GetFunction(), Nan::New(PRIVATE_PROP_ZK), zk->handle()); \
        \
        assert (info[nargs-2]->IsFunction()); \
        Nan::Callback *cbw = new Nan::Callback (info[nargs-2].As<Function>()); \
        Nan::SetPrivate(cbw->GetFunction(), Nan::New(PRIVATE_PROP_ZK), zk->handle())

    static void string_completion (int rc, const char *value, const void *cb) {
        if (value == 0) {
            value = "null";
        }

        LOG_DEBUG(NULL, "rc=%d, rc_string=%s, path=%s, data=%lp", rc, zerror(rc), value, cb);

        CALLBACK_PROLOG(3);
        argv[2] = LOCAL_STRING(value);
        CALLBACK_EPILOG();
    }

    static void ACreate(const Nan::FunctionCallbackInfo<Value>& info) {
        A_METHOD_PROLOG(4);

        Nan::Utf8String _path (toString(info[0]));
        uint32_t flags = toUint(info[2]);

        if (Buffer::HasInstance(info[1])) { // buffer
            Local<Object> _data = toLocalObj(info[1]);
            METHOD_EPILOG(zoo_acreate(zk->zhandle, *_path, BufferData(_data), BufferLength(_data), &ZOO_OPEN_ACL_UNSAFE, flags, string_completion, cb));
        } else {    // other
            Nan::Utf8String _data (toString(info[1]));
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
        LOG_DEBUG(NULL, "rc=%d, rc_string=%s", rc, zerror(rc));
        CALLBACK_EPILOG();

        free(d);
    }

    static void ADelete(const Nan::FunctionCallbackInfo<Value>& info) {
        A_METHOD_PROLOG(3);
        Nan::Utf8String _path (toString(info[0]));
        uint32_t version = toUint(info[1]);

        struct completion_data *data = (struct completion_data *) malloc(sizeof(struct completion_data));
        data->cb = cb;
        data->type = ZOO_DELETE_OP;
        data->data = NULL;

        METHOD_EPILOG (zoo_adelete(zk->zhandle, *_path, version, &void_completion, data));
    }

    Local<Object> createStatObject (const struct Stat *stat) {
        Nan::EscapableHandleScope scope;
        Local<Object> o = Nan::New<Object>();
        Nan::DefineOwnProperty(o, LOCAL_STRING("czxid"), Nan::New<Number>(stat->czxid), ReadOnly);
        Nan::DefineOwnProperty(o, LOCAL_STRING("mzxid"), Nan::New<Number>(stat->mzxid), ReadOnly);
        Nan::DefineOwnProperty(o, LOCAL_STRING("pzxid"), Nan::New<Number>(stat->pzxid), ReadOnly);
        Nan::DefineOwnProperty(o, LOCAL_STRING("dataLength"), Nan::New<Integer>(stat->dataLength), ReadOnly);
        Nan::DefineOwnProperty(o, LOCAL_STRING("numChildren"), Nan::New<Integer>(stat->numChildren), ReadOnly);
        Nan::DefineOwnProperty(o, LOCAL_STRING("version"), Nan::New<Integer>(stat->version), ReadOnly);
        Nan::DefineOwnProperty(o, LOCAL_STRING("cversion"), Nan::New<Integer>(stat->cversion), ReadOnly);
        Nan::DefineOwnProperty(o, LOCAL_STRING("aversion"), Nan::New<Integer>(stat->aversion), ReadOnly);
        Nan::DefineOwnProperty(o, LOCAL_STRING("ctime"), convertUnixTimeToDate(stat->ctime), ReadOnly);
        Nan::DefineOwnProperty(o, LOCAL_STRING("mtime"), convertUnixTimeToDate(stat->mtime), ReadOnly);
        Nan::DefineOwnProperty(o, LOCAL_STRING("ephemeralOwner"), idAsString(stat->ephemeralOwner), ReadOnly);
        Nan::DefineOwnProperty(o, LOCAL_STRING("createdInThisSession"), Nan::New<Boolean>(myid.client_id == stat->ephemeralOwner), ReadOnly);
        return scope.Escape(o);
    }

    static void stat_completion (int rc, const struct Stat *stat, const void *cb) {
        CALLBACK_PROLOG(3);

        LOG_DEBUG(NULL, "rc=%d, rc_string=%s", rc, zerror(rc));
        argv[2] = rc == ZOK ? zkk->createStatObject (stat) : Nan::Null().As<Object>();

        CALLBACK_EPILOG();
    }

    static void AExists(const Nan::FunctionCallbackInfo<Value>& info) {
        A_METHOD_PROLOG(3);

        Nan::Utf8String _path (toString(info[0]));
        bool watch = toBool(info[1]);

        METHOD_EPILOG(zoo_aexists(zk->zhandle, *_path, watch, &stat_completion, cb));
    }

    static void AWExists(const Nan::FunctionCallbackInfo<Value>& info) {
        AW_METHOD_PROLOG(3);
        Nan::Utf8String _path (toString(info[0]));
        METHOD_EPILOG(zoo_awexists(zk->zhandle, *_path, &watcher_fn, cbw, &stat_completion, cb));
    }

    static void data_completion (int rc, const char *value, int value_len, const struct Stat *stat, const void *cb) {
        CALLBACK_PROLOG(4);

        LOG_DEBUG(NULL, "rc=%d, rc_string=%s, value=%.*s", rc, zerror(rc), value_len, value);

        argv[2] = stat != 0 ? zkk->createStatObject (stat) : Nan::Null().As<Object>();

        if (value != 0) {
            argv[3] = BufferNew(value, value_len).ToLocalChecked();
        } else {
            argv[3] = Nan::Null().As<Object>();
        }

        CALLBACK_EPILOG();
    }

    static void AGet(const Nan::FunctionCallbackInfo<Value>& info) {
        A_METHOD_PROLOG(3);

        Nan::Utf8String _path (toString(info[0]));
        bool watch = toBool(info[1]);

        METHOD_EPILOG(zoo_aget(zk->zhandle, *_path, watch, &data_completion, cb));
    }

    static void watcher_fn (zhandle_t *zh, int type, int state, const char *path, void *watcherCtx) {
        WATCHER_PROLOG(4);
        WATCHER_CALLBACK_EPILOG();
    }

    static void AWGet(const Nan::FunctionCallbackInfo<Value>& info) {
        AW_METHOD_PROLOG(3);

        Nan::Utf8String _path (toString(info[0]));

        METHOD_EPILOG(zoo_awget(zk->zhandle, *_path, &watcher_fn, cbw, &data_completion, cb));
    }

    static void ASet(const Nan::FunctionCallbackInfo<Value>& info) {
        A_METHOD_PROLOG(4);

        Nan::Utf8String _path (toString(info[0]));
        uint32_t version = toUint(info[2]);

        if (Buffer::HasInstance(info[1])) { // buffer
            Local<Object> _data = toLocalObj(info[1]);
            METHOD_EPILOG(zoo_aset(zk->zhandle, *_path, BufferData(_data), BufferLength(_data), version, &stat_completion, cb));
        } else {    // other
            Nan::Utf8String _data(toString(info[1]));
            METHOD_EPILOG(zoo_aset(zk->zhandle, *_path, *_data, _data.length(), version, &stat_completion, cb));
        }
    }

    static void strings_completion (int rc, const struct String_vector *strings, const void *cb) {
        CALLBACK_PROLOG(3);

        LOG_DEBUG(NULL, "rc=%d, rc_string=%s", rc, zerror(rc));

        if (strings != NULL) {
            Local<Array> ar = Nan::New<Array>((uint32_t)strings->count);
            for (uint32_t i = 0; i < (uint32_t)strings->count; ++i) {
                Nan::Set(ar, i, LOCAL_STRING(strings->data[i]));
            }
            argv[2] = ar;
        } else {
            argv[2] = Nan::Null().As<Object>();
        }

        CALLBACK_EPILOG();
    }

    static void AGetChildren(const Nan::FunctionCallbackInfo<Value>& info) {
        A_METHOD_PROLOG(3);

        Nan::Utf8String _path (toString(info[0]));
        bool watch = toBool(info[1]);

        METHOD_EPILOG(zoo_aget_children(zk->zhandle, *_path, watch, &strings_completion, cb));
    }

    static void AWGetChildren(const Nan::FunctionCallbackInfo<Value>& info) {
        AW_METHOD_PROLOG(3);

        Nan::Utf8String _path (toString(info[0]));

        METHOD_EPILOG(zoo_awget_children(zk->zhandle, *_path, &watcher_fn, cbw, &strings_completion, cb));
    }

    static void strings_stat_completion (int rc, const struct String_vector *strings, const struct Stat *stat, const void *cb) {
        CALLBACK_PROLOG(4);

        LOG_DEBUG(NULL, "rc=%d, rc_string=%s", rc, zerror(rc));

        if (strings != NULL) {
            Local<Array> ar = Nan::New<Array>((uint32_t)strings->count);
            for (uint32_t i = 0; i < (uint32_t)strings->count; ++i) {
                Nan::Set(ar, i, LOCAL_STRING(strings->data[i]));
            }
            argv[2] = ar;
        } else {
            argv[2] = Nan::Null().As<Object>();
        }

        argv[3] = (stat != 0 ? zkk->createStatObject (stat) : Nan::Null().As<Object>());

        CALLBACK_EPILOG();
    }

    static void AGetChildren2(const Nan::FunctionCallbackInfo<Value>& info) {
        A_METHOD_PROLOG(3);

        Nan::Utf8String _path (toString(info[0]));
        bool watch = toBool(info[1]);

        METHOD_EPILOG(zoo_aget_children2(zk->zhandle, *_path, watch, &strings_stat_completion, cb));
    }

    static void AWGetChildren2(const Nan::FunctionCallbackInfo<Value>& info) {
        AW_METHOD_PROLOG(3);

        Nan::Utf8String _path (toString(info[0]));

        METHOD_EPILOG(zoo_awget_children2(zk->zhandle, *_path, &watcher_fn, cbw, &strings_stat_completion, cb));
    }

    static void AGetAcl(const Nan::FunctionCallbackInfo<Value>& info) {
        A_METHOD_PROLOG(2);

        Nan::Utf8String _path (toString(info[0]));

        METHOD_EPILOG(zoo_aget_acl(zk->zhandle, *_path, &acl_completion, cb));
    }

    static void ASetAcl(const Nan::FunctionCallbackInfo<Value>& info) {
        A_METHOD_PROLOG(4);

        Nan::Utf8String _path (toString(info[0]));
        uint32_t _version = toUint(info[1]);
        Local<Array> arr = Local<Array>::Cast(info[2]);

        struct ACL_vector *aclv = zk->createAclVector(arr);

        struct completion_data *data = (struct completion_data *) malloc(sizeof(struct completion_data));
        data->cb = cb;
        data->type = ZOO_SETACL_OP;
        data->data = aclv;

        METHOD_EPILOG(zoo_aset_acl(zk->zhandle, *_path, _version, aclv, void_completion, data));
    }

    static void ASync(const Nan::FunctionCallbackInfo<Value>& info) {
        A_METHOD_PROLOG(2);

        Nan::Utf8String _path (toString(info[0]));

        METHOD_EPILOG(zoo_async(zk->zhandle, *_path, &string_completion, cb));
    }

    static void AddAuth(const Nan::FunctionCallbackInfo<Value>& info) {
        A_METHOD_PROLOG(3);

        Nan::Utf8String _scheme (toString(info[0]));
        Nan::Utf8String _auth (toString(info[1]));

        struct completion_data *data = (struct completion_data *) malloc(sizeof(struct completion_data));
        data->cb = cb;
        data->type = ZOO_SETAUTH_OP;
        data->data = NULL;

        METHOD_EPILOG(zoo_add_auth(zk->zhandle, *_scheme, *_auth, _auth.length(), void_completion, data));
    }

    Local<Object> createAclObject (struct ACL_vector *aclv) {
        Nan::EscapableHandleScope scope;

        Local<Array> arr = Nan::New<Array>(aclv->count);

        for (int i = 0; i < aclv->count; i++) {
            struct ACL *acl = &aclv->data[i];

            Local<Object> obj = Nan::New<Object>();
            Nan::DefineOwnProperty(obj, LOCAL_STRING("perms"), Nan::New<Integer>(acl->perms), ReadOnly);
            Nan::DefineOwnProperty(obj, LOCAL_STRING("scheme"), LOCAL_STRING(acl->id.scheme), ReadOnly);
            Nan::DefineOwnProperty(obj, LOCAL_STRING("auth"), LOCAL_STRING(acl->id.id), ReadOnly);

            Nan::Set(arr, i, obj);
        }

        return scope.Escape(arr);
    };

    struct ACL_vector *createAclVector (Local<Array> arr) {
        Nan::HandleScope scope;

        struct ACL_vector *aclv = (struct ACL_vector *) malloc(sizeof(struct ACL_vector));
        aclv->count = arr->Length();
        aclv->data = (struct ACL *) calloc(aclv->count, sizeof(struct ACL));

        for (int i = 0, l = aclv->count; i < l; i++) {
            Local<Value> obj_local = arr->Get(Nan::GetCurrentContext(), i).ToLocalChecked();
            Local<Object> obj = Local<Object>::Cast(obj_local);

            Nan::Utf8String _scheme (toString(toLocalVal(obj, LOCAL_STRING("scheme"))));
            Nan::Utf8String _auth (toString(toLocalVal(obj, LOCAL_STRING("auth"))));
            uint32_t _perms = toUint(toLocalVal(obj, LOCAL_STRING("perm")));

            struct Id id;
            struct ACL *acl = &aclv->data[i];

            id.scheme = strdup(*_scheme);
            id.id = strdup(*_auth);

            acl->perms = _perms;
            acl->id = id;
        }


        return aclv;
    }

    static void acl_completion (int rc, struct ACL_vector *acl, struct Stat *stat, const void *cb) {
        LOG_DEBUG(NULL, "rc=%d, rc_string=%s, acl_vector=%lp", rc, zerror(rc), acl);
        CALLBACK_PROLOG(4);

        argv[2] = acl != NULL ? zkk->createAclObject(acl) : Nan::Null().As<Object>();
        argv[3] = stat != NULL ? zkk->createStatObject(stat) : Nan::Null().As<Object>();

        deallocate_ACL_vector(acl);

        CALLBACK_EPILOG();
    }

    static NAN_PROPERTY_GETTER(StatePropertyGetter) {
        assert(info.This().IsEmpty() == false);
        assert(info.This()->IsObject());
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(info.This());
        assert(zk);
        assert(zk->handle() == info.This());
        RETURN_VALUE(info, Nan::New<Integer> (zk->zhandle != 0 ? zoo_state(zk->zhandle) : 0));
    }

    static NAN_PROPERTY_GETTER(ClientidPropertyGetter) {
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(info.This());
        assert(zk);
        RETURN_VALUE(info, zk->idAsString(zk->zhandle != 0 ? zoo_client_id(zk->zhandle)->client_id : zk->myid.client_id));
    }

    static NAN_PROPERTY_GETTER(ClientPasswordPropertyGetter) {
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(info.This());
        assert(zk);
        RETURN_VALUE(info, zk->PasswordToHexString(zk->zhandle != 0 ? zoo_client_id(zk->zhandle)->passwd : zk->myid.passwd));
    }

    static NAN_PROPERTY_GETTER(SessionTimeoutPropertyGetter) {
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(info.This());
        assert(zk);
        RETURN_VALUE(info, Nan::New<Integer> (zk->zhandle != 0 ? zoo_recv_timeout(zk->zhandle) : -1));
    }

    static NAN_PROPERTY_GETTER(IsUnrecoverablePropertyGetter) {
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(info.This());
        assert(zk);
        RETURN_VALUE(info, Nan::New<Integer> (zk->zhandle != 0 ? is_unrecoverable(zk->zhandle) : 0));
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
            LOG_DEBUG(NULL, "call zookeeper_close(%lp)", zhandle);
            zookeeper_close(zhandle);
            zhandle = 0;

            LOG_DEBUG(NULL, "zookeeper_close() returned");

            if (zk_io) {
                int rc = uv_poll_stop(zk_io);
                LOG_DEBUG(NULL, "zookeeper_close(%lp) uv_poll_stop result: %d", this, rc);

                uv_close((uv_handle_t*) zk_io, delete_on_close);
                zk_io = NULL;
            }

            // Close the timer and finally Unref the ZooKeeper instance when it's done
            // Unrefing after is important to avoid memory being freed too early.
            uv_close((uv_handle_t*) &zk_timer, timer_closed);

            Nan::HandleScope scope;
            DoEmitClose (Nan::New(on_closed), code);
        }
    }

    static void timer_closed(uv_handle_t* handle) {
        ZooKeeper *zk = static_cast<ZooKeeper *>(handle->data);
        zk->Unref();
    }

    static void Close(const Nan::FunctionCallbackInfo<Value>& info) {
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(info.This());
        assert(zk);
        zk->realClose(0);
        RETURN_THIS(info);
    };

    virtual ~ZooKeeper() {
        //realClose ();
        LOG_INFO(NULL, "ZooKeeper destructor invoked");
    }

#ifdef WIN32
    ZooKeeper () : zhandle(0) {
        fd = socket(AF_INET, SOCK_STREAM, 0);
#else
    ZooKeeper () : zhandle(0), fd(-1) {
#endif
        ZERO_MEM (myid);
        ZERO_MEM (zk_io);
        ZERO_MEM (zk_timer);
        is_closed = false;
    }
private:
    zhandle_t *zhandle;
    clientid_t myid;
    uv_poll_t* zk_io;

    uv_timer_t zk_timer;

    #ifdef WIN32
        SOCKET fd;
    #else
        int fd;
    #endif

    int interest;
    timeval tv;
    int64_t last_activity; // time of last zookeeper event loop activity
    bool is_closed;
};

} // namespace "zk"

extern "C" void init(Local<Object> target) {
    INITIALIZE_STRING (zk::on_closed,            "close");
    INITIALIZE_STRING (zk::on_connected,         "connect");
    INITIALIZE_STRING (zk::on_connecting,        "connecting");
    INITIALIZE_STRING (zk::on_event_created,     "created");
    INITIALIZE_STRING (zk::on_event_deleted,     "deleted");
    INITIALIZE_STRING (zk::on_event_changed,     "changed");
    INITIALIZE_STRING (zk::on_event_child,       "child");
    INITIALIZE_STRING (zk::on_event_notwatching, "notwatching");

    INITIALIZE_SYMBOL (zk::PRIVATE_PROP_ZK);
    INITIALIZE_SYMBOL (zk::PRIVATE_PROP_HANDBACK);

    zk::ZooKeeper::Initialize(target);
}

NODE_MODULE(zookeeper, init)
