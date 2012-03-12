#include <string.h>
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

namespace zk {
#define _LL_CAST_ (long long)

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

class ZooKeeper: public ObjectWrap {
public:
    static void Initialize(v8::Handle<v8::Object> target) {
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

        //extern ZOOAPI struct Id ZOO_ANYONE_ID_UNSAFE;
        //extern ZOOAPI struct Id ZOO_AUTH_IDS;

        //extern ZOOAPI struct ACL_vector ZOO_OPEN_ACL_UNSAFE;
        //extern ZOOAPI struct ACL_vector ZOO_READ_ACL_UNSAFE;
        //extern ZOOAPI struct ACL_vector ZOO_CREATOR_ALL_ACL;

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
        constructor_template->InstanceTemplate()->SetAccessor(String::NewSymbol("timeout"), SessionTimeoutPropertyGetter, 0, Local<Value>(), PROHIBITS_OVERWRITING, ReadOnly);
        constructor_template->InstanceTemplate()->SetAccessor(String::NewSymbol("is_unrecoverable"), IsUnrecoverablePropertyGetter, 0, Local<Value>(), PROHIBITS_OVERWRITING, ReadOnly);

        target->Set(String::NewSymbol("ZooKeeper"), constructor_template->GetFunction());
    }

    static Handle<Value> New (const Arguments& args) {
        HandleScope scope;
        ZooKeeper *zk = new ZooKeeper ();
        v8::Context::GetCurrent()->Global()->Set(String::New("myThis"), args.This());
        v8::Context::GetCurrent()->Global()->Set(String::New("myHolder"), args.Holder());
        v8::Context::GetCurrent()->Global()->Set(String::New("myCallee"), args.Callee()->GetName());

        zk->Wrap(args.This());
        //zk->handle_.ClearWeak();
        return args.This();
    }

    void yield () {
        if (is_closed) {
            return;
        }

#if NODE_VERSION_AT_LEAST(0, 5, 0)
        last_activity = ev_now (uv_default_loop()->ev);
#else
        last_activity = ev_now (EV_A);
#endif

        int rc = zookeeper_interest (zhandle, &fd, &interest, &tv);
        if (rc) {
          LOG_ERROR(("yield:zookeeper_interest returned error: %d - %s\n", rc, zerror(rc)));
          return;
        }

        if (fd == -1 ) {
          if (ev_is_active (&zk_io))
            ev_io_stop (EV_DEFAULT_UC_ &zk_io);
          return;
        }

        int events = (interest & ZOOKEEPER_READ ? EV_READ : 0) | (interest & ZOOKEEPER_WRITE ? EV_WRITE : 0);
        LOG_DEBUG(("Interest in (fd=%i, read=%s, write=%s)",
                   fd,
                   events & EV_READ ? "true" : "false",
                   events & EV_WRITE ? "true" : "false"));

        if (ev_is_active (&zk_io))
          ev_io_stop (EV_DEFAULT_UC_ &zk_io);

        ev_io_set (&zk_io, fd, events);
        ev_io_start(EV_DEFAULT_UC_ &zk_io);

        zk_timer.repeat = tv.tv_sec + tv.tv_usec / 1000000.;
        ev_timer_again (EV_DEFAULT_UC_ &zk_timer);
    }

    static void zk_io_cb (EV_P_ ev_io *w, int revents) {
        LOG_DEBUG(("zk_io_cb fired"));
        ZooKeeper *zk = static_cast<ZooKeeper*>(w->data);
        int events = (revents & EV_READ? ZOOKEEPER_READ : 0) | (revents & EV_WRITE? ZOOKEEPER_WRITE : 0);
        int rc = zookeeper_process (zk->zhandle, events);
        if (rc != ZOK) {
            LOG_ERROR(("yield:zookeeper_process returned error: %d - %s\n", rc, zerror(rc)));
        }
        zk->yield ();
    }

    static void zk_timer_cb (EV_P_ ev_timer *w, int revents) {
        LOG_DEBUG(("zk_timer_cb fired"));
        ZooKeeper *zk = static_cast<ZooKeeper*>(w->data);
#if NODE_VERSION_AT_LEAST(0, 5, 0)
        ev_tstamp now     = ev_now (uv_default_loop()->ev);
#else
        ev_tstamp now     = ev_now (EV_A);
#endif
        ev_tstamp timeout = zk->last_activity + zk->tv.tv_sec + zk->tv.tv_usec/1000000.;

        // if last_activity + tv.tv_sec is older than now, we did time out
        if (timeout < now) {
            LOG_DEBUG(("ping timer went off"));
            // timeout occurred, take action
            zk->yield ();
        } else {
            // callback was invoked, but there was some activity, re-arm
            // the watcher to fire in last_activity + 60, which is
            // guaranteed to be in the future, so "again" is positive:
            w->repeat = timeout - now;
            ev_timer_again (EV_DEFAULT_UC_ w);
            LOG_DEBUG(("delaying ping timer by %lf", w->repeat));
        }
    }

    inline bool realInit (const char* hostPort, int session_timeout) {
        zhandle = zookeeper_init(hostPort, main_watcher, session_timeout, &myid, this, 0);
        if (!zhandle) {
            LOG_ERROR (("zookeeper_init returned 0!"));
            return false;
        }
        Ref();
        ev_init (&zk_io, &zk_io_cb);
        ev_init (&zk_timer, &zk_timer_cb);
        zk_io.data = zk_timer.data = this;
        ev_set_priority (&zk_timer, 1);
        yield ();
        return true;
    }
    static Handle<Value> Init (const Arguments& args) {
        HandleScope scope;

        THROW_IF_NOT (args.Length() >= 1, "Must pass ZK init object");
        THROW_IF_NOT (args[0]->IsObject(), "Init argument must be an object");
        Local<Object> arg = args[0]->ToObject();

        int32_t debug_level = arg->Get(String::NewSymbol("debug_level"))->ToInt32()->Value();
        zoo_set_debug_level (static_cast<ZooLogLevel>(debug_level));
        bool order = arg->Get(String::NewSymbol("host_order_deterministic"))->ToBoolean()->BooleanValue();

        zoo_deterministic_conn_order (order); // enable deterministic order
        String::AsciiValue _hostPort (arg->Get(String::NewSymbol("connect"))->ToString());
        int32_t session_timeout = arg->Get(String::NewSymbol("timeout"))->ToInt32()->Value();
        if (session_timeout == 0) session_timeout = 20000;

        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(args.This());
        assert(zk);

        if (!zk->realInit(*_hostPort, session_timeout))
            return ErrnoException(errno, "zookeeper_init", "failed to init", __FILE__);
        else
            return args.This();
    }

    static void main_watcher(zhandle_t *zzh, int type, int state, const char *path, void* context) {
        LOG_DEBUG(("main watcher event: type=%d, state=%d, path=%s", type, state, (path ? path: "null")));
        ZooKeeper *zk = static_cast<ZooKeeper *>(context);

        if (type == ZOO_SESSION_EVENT) {
            if (state == ZOO_CONNECTED_STATE) {
                zk->myid.client_id = zoo_client_id(zzh)->client_id;
                zk->DoEmit (on_connected, path);
            } else if (state == ZOO_CONNECTING_STATE) {
                zk->DoEmit (on_connecting, path);
            } else if (state == ZOO_AUTH_FAILED_STATE) {
                LOG_ERROR (("Authentication failure. Shutting down...\n"));
                zk->realClose();
            } else if (state == ZOO_EXPIRED_SESSION_STATE) {
                LOG_ERROR (("Session expired. Shutting down...\n"));
                zk->realClose();
            }
        } else if (type == ZOO_CREATED_EVENT){
            zk->DoEmit (on_event_created, path);
        } else if (type == ZOO_DELETED_EVENT) {
            zk->DoEmit (on_event_deleted, path);
        } else if (type == ZOO_CHANGED_EVENT) {
            zk->DoEmit (on_event_changed, path);
        } else if (type == ZOO_CHILD_EVENT) {
            zk->DoEmit (on_event_child, path);
        } else if (type == ZOO_NOTWATCHING_EVENT) {
            zk->DoEmit (on_event_notwatching, path);
        } else {
            LOG_WARN(("Unknonwn watcher event type %s",type));
        }
    }

    Local<String> idAsString (int64_t id) {
        HandleScope scope;
        char idbuff [128] = {0};
        sprintf(idbuff, "%llx", _LL_CAST_ id);
        return scope.Close (String::NewSymbol (idbuff));
    }

    void DoEmit (Handle<String> event_name, const char* path = NULL) {
        HandleScope scope;
        Local<Value> argv[3];
        argv[0] = Local<Value>::New(event_name);
        argv[1] = Local<Value>::New(handle_);
        if (path != 0) {
            argv[2] = String::New(path);
            LOG_DEBUG (("calling Emit(%s, path='%s')", *String::Utf8Value(event_name), path));
        } else {
            argv[2] = Local<Value>::New(Undefined());
            LOG_DEBUG (("calling Emit(%s, path=null)", *String::Utf8Value(event_name)));
        }
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
        Persistent<Function> *callback = cb_unwrap((void*)data); \
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

    static void string_completion (int rc, const char *value, const void *data) {
        if (value == 0) value="null";
        LOG_DEBUG(("rc=%d, rc_string=%s, path=%s, data=%lp", rc, zerror(rc), value, data));
        CALLBACK_PROLOG (3);
        argv[2] = String::New (value);
        CALLBACK_EPILOG();
    }

    static Handle<Value> ACreate (const Arguments& args) {
        A_METHOD_PROLOG (4);
        String::Utf8Value _path (args[0]->ToString());
        uint32_t flags = args[2]->ToUint32()->Uint32Value();
        if( Buffer::HasInstance(args[1]) ) { // buffer
            Local<Object> _data = args[1]->ToObject();
            METHOD_EPILOG (zoo_acreate (zk->zhandle, *_path, BufferData(_data), BufferLength(_data), &ZOO_OPEN_ACL_UNSAFE, flags, string_completion, cb));
        } else {    // other
            String::Utf8Value _data (args[1]->ToString());
            METHOD_EPILOG (zoo_acreate (zk->zhandle, *_path, *_data, _data.length(), &ZOO_OPEN_ACL_UNSAFE, flags, string_completion, cb));
        }
    }

    static void void_completion (int rc, const void *data) {
        CALLBACK_PROLOG (2);
        LOG_DEBUG(("rc=%d, rc_string=%s", rc, zerror(rc)));
        CALLBACK_EPILOG();
    }

    static Handle<Value> ADelete (const Arguments& args) {
        A_METHOD_PROLOG (3);
        String::Utf8Value _path (args[0]->ToString());
        uint32_t version = args[1]->ToUint32()->Uint32Value();
        METHOD_EPILOG (zoo_adelete(zk->zhandle, *_path, version, &void_completion, cb));
    }

    Local<Object> createStatObject (const struct Stat *stat) {
        HandleScope scope;
        Local<Object> o = Object::New();
        o->Set(String::NewSymbol("czxid"), Number::New (stat->czxid), ReadOnly);
        o->Set(String::NewSymbol("mzxid"), Number::New (stat->mzxid), ReadOnly);
        o->Set(String::NewSymbol("pzxid"), Number::New (stat->pzxid), ReadOnly);
        o->Set(String::NewSymbol("dataLength"), Integer::New (stat->dataLength), ReadOnly);
        o->Set(String::NewSymbol("numChildren"), Integer::New (stat->numChildren), ReadOnly);
        o->Set(String::NewSymbol("version"), Integer::New (stat->version), ReadOnly);
        o->Set(String::NewSymbol("cversion"), Integer::New (stat->cversion), ReadOnly);
        o->Set(String::NewSymbol("aversion"), Integer::New (stat->aversion), ReadOnly);
        o->Set(String::NewSymbol("ctime"), NODE_UNIXTIME_V8(stat->ctime/1000.), ReadOnly);
        o->Set(String::NewSymbol("mtime"), NODE_UNIXTIME_V8(stat->mtime/1000.), ReadOnly);
        o->Set(String::NewSymbol("ephemeralOwner"), idAsString(stat->ephemeralOwner), ReadOnly);
        o->Set(String::NewSymbol("createdInThisSession"), Boolean::New(myid.client_id == stat->ephemeralOwner), ReadOnly);
        return scope.Close(o);
    }

    static void stat_completion (int rc, const struct Stat *stat, const void *data) {
        CALLBACK_PROLOG (3);
        LOG_DEBUG(("rc=%d, rc_string=%s", rc, zerror(rc)));
        argv[2] = rc == ZOK ? zkk->createStatObject (stat) : Object::Cast(*Null());
        CALLBACK_EPILOG();
    }

    static Handle<Value> AExists (const Arguments& args) {
        A_METHOD_PROLOG (3);
        String::Utf8Value _path (args[0]->ToString());
        bool watch = args[1]->ToBoolean()->BooleanValue();
        METHOD_EPILOG (zoo_aexists(zk->zhandle, *_path, watch, &stat_completion, cb));
    }

    static Handle<Value> AWExists (const Arguments& args) {
        AW_METHOD_PROLOG (3);
        String::Utf8Value _path (args[0]->ToString());
        METHOD_EPILOG (zoo_awexists(zk->zhandle, *_path, &watcher_fn, cbw, &stat_completion, cb));
    }

    static void data_completion (int rc, const char *value, int value_len,
                                 const struct Stat *stat, const void *data) {
        CALLBACK_PROLOG (4);
        LOG_DEBUG(("rc=%d, rc_string=%s, value=%s", rc, zerror(rc), value));
        argv[2] = stat != 0 ? zkk->createStatObject (stat) : Object::Cast(*Null());
        if( value != 0 ) {
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
	  int ret= zoo_delete(zk->zhandle, *_path, version);
	  return scope.Close(Int32::New(ret));
    }

    static Handle<Value> AGet (const Arguments& args) {
        A_METHOD_PROLOG (3);
        String::Utf8Value _path (args[0]->ToString());
        bool watch = args[1]->ToBoolean()->BooleanValue();
        METHOD_EPILOG (zoo_aget(zk->zhandle, *_path, watch, &data_completion, cb));
    }

    static void watcher_fn (zhandle_t *zh, int type, int state, const char *path, void *watcherCtx) {
        WATCHER_PROLOG (4);
        WATCHER_CALLBACK_EPILOG();
    }

    static Handle<Value> AWGet (const Arguments& args) {
        AW_METHOD_PROLOG (3);
        String::Utf8Value _path (args[0]->ToString());
        METHOD_EPILOG (zoo_awget(zk->zhandle, *_path,
                &watcher_fn, cbw, &data_completion, cb));
    }

    static Handle<Value> ASet (const Arguments& args) {
        A_METHOD_PROLOG (4);
        String::Utf8Value _path (args[0]->ToString());
        uint32_t version = args[2]->ToUint32()->Uint32Value();
        if( Buffer::HasInstance(args[1]) ) { // buffer
            Local<Object> _data = args[1]->ToObject();
            METHOD_EPILOG (zoo_aset(zk->zhandle, *_path, BufferData(_data), BufferLength(_data), version, &stat_completion, cb));
        } else {    // other
            String::Utf8Value _data(args[1]->ToString());
            METHOD_EPILOG (zoo_aset(zk->zhandle, *_path, *_data, _data.length(), version, &stat_completion, cb));
        }
    }

    static void strings_completion (int rc,
            const struct String_vector *strings, const void *data) {
        CALLBACK_PROLOG (3);
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
        A_METHOD_PROLOG (3);
        String::Utf8Value _path (args[0]->ToString());
        bool watch = args[1]->ToBoolean()->BooleanValue();
        METHOD_EPILOG (zoo_aget_children(zk->zhandle, *_path, watch, &strings_completion, cb));
    }

    static Handle<Value> AWGetChildren (const Arguments& args) {
        AW_METHOD_PROLOG (3);
        String::Utf8Value _path (args[0]->ToString());
        METHOD_EPILOG (zoo_awget_children(zk->zhandle, *_path, &watcher_fn, cbw, &strings_completion, cb));
    }

    static void strings_stat_completion (int rc, const struct String_vector *strings,
            const struct Stat *stat, const void *data) {
        CALLBACK_PROLOG (4);
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
        A_METHOD_PROLOG (3);
        String::Utf8Value _path (args[0]->ToString());
        bool watch = args[1]->ToBoolean()->BooleanValue();
        METHOD_EPILOG (zoo_aget_children2(zk->zhandle, *_path, watch, &strings_stat_completion, cb));
    }

    static Handle<Value> AWGetChildren2 (const Arguments& args) {
        AW_METHOD_PROLOG (3);
        String::Utf8Value _path (args[0]->ToString());
        METHOD_EPILOG (zoo_awget_children2(zk->zhandle, *_path, &watcher_fn, cbw, &strings_stat_completion, cb));
    }

    static Handle<Value> StatePropertyGetter (Local<String> property, const AccessorInfo& info) {
        HandleScope scope;
        v8::Context::GetCurrent()->Global()->Set(String::New("State_myThis"), info.This());
        //Debug::DebugBreak();
        assert(info.This().IsEmpty() == false);
        assert(info.This()->IsObject());
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(info.This());
        assert(zk);
        assert(zk->handle_ == info.This());
        return Integer::New (zk->zhandle != 0? zoo_state (zk->zhandle) : 0);
        //return Integer::New(-10);
    }

    static Handle<Value> ClientidPropertyGetter (Local<String> property, const AccessorInfo& info) {
        HandleScope scope;
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(info.This());
        assert(zk);
        return zk->idAsString(zk->zhandle != 0 ?
                zoo_client_id(zk->zhandle)->client_id : zk->myid.client_id);
    }

    static Handle<Value> SessionTimeoutPropertyGetter (Local<String> property, const AccessorInfo& info) {
        HandleScope scope;
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(info.This());
        assert(zk);
        return Integer::New (zk->zhandle != 0? zoo_recv_timeout (zk->zhandle) : -1);
    }

    static Handle<Value> IsUnrecoverablePropertyGetter (Local<String> property, const AccessorInfo& info) {
        HandleScope scope;
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(info.This());
        assert(zk);
        return Integer::New (zk->zhandle != 0? is_unrecoverable (zk->zhandle) : 0);
    }

    void realClose () {
        if (is_closed)
            return;

        is_closed = true;

        if (ev_is_active (&zk_timer))
            ev_timer_stop(EV_DEFAULT_UC_ &zk_timer);

        if (zhandle) {
            LOG_DEBUG(("call zookeeper_close(%lp)", zhandle));
            zookeeper_close(zhandle);
            zhandle = 0;
        }
        LOG_DEBUG(("zookeeper_close() returned"));
        DoEmit (on_closed);
        if (ev_is_active (&zk_io))
            ev_io_stop (EV_DEFAULT_UC_ &zk_io);
        Unref();
    }

    static Handle<Value> Close (const Arguments& args) {
        HandleScope scope;
        ZooKeeper *zk = ObjectWrap::Unwrap<ZooKeeper>(args.This());
        assert(zk);
        zk->realClose();
        return args.This();
    };

    virtual ~ZooKeeper() {
        //realClose ();
        LOG_INFO(("ZooKeeper destructor invoked"));
    }

#define ZERO_MEM(member) bzero(&(member), sizeof(member))

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
    ev_io zk_io;
    ev_timer zk_timer;
    int fd;
    int interest;
    timeval tv;
    ev_tstamp last_activity; // time of last zookeeper event loop activity
    bool is_closed;
};

} // namespace "zk"

extern "C" void init(Handle<Object> target) {
  zk::ZooKeeper::Initialize(target);
}
