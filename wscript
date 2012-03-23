import Options
import platform

srcdir = "."
blddir = "build"
APPNAME = "zookeeper"
ZKVERSION = "3.4.3"
OSTYPE = platform.system()


def set_options(opt):
    opt.add_option('-z','--zookeeper', action='store', default='zookeeper-' + ZKVERSION, help='build zookeeper', dest='zookeeper')
    opt.tool_options("compiler_cxx")

def configure(conf):
    conf.check_tool("compiler_cxx")
    conf.check_tool("node_addon")

def zookeeper(ctx, z):
    t = ctx.bdir + '/zk'
    ctx.exec_command("cd ../deps/zookeeper-3.4.3/src/c && LIBS=\"-lnsl -lsocket\" CFLAGS=\"-D_POSIX_PTHREAD_SEMANTICS\" ./configure --without-syncapi --without-shared --disable-shared --with-pic --prefix=%s && make clean install"%(t))

def build(bld):
    # for quicker development, run with "--zookeeper=" to skip rebuilding the zookeeper source (99% of build time)
    if Options.options.zookeeper != '':
        zookeeper(bld, Options.options.zookeeper)
    
    includes = [
      bld.bdir + '/zk/include/zookeeper',      # zookeeper 3.4.x (local)
      bld.bdir + '/zk/include/c-client-src',   # zookeeper 3.3.x (local)
      # '/usr/local/include/zookeeper',        # zookeeper 3.4.x (system)
      # '/usr/local/include/c-client-src'      # zookeeper 3.3.x (system)
    ]
    libpaths = [bld.bdir + '/zk/lib', '/usr/local/lib']

    obj = bld.new_task_gen("cxx", "shlib", "node_addon")
    if OSTYPE == 'Darwin':
        obj.cxxflags = ["-Wall", "-Werror", '-DDEBUG', '-O0', '-mmacosx-version-min=10.4']
        obj.ldflags = ['-mmacosx-version-min=10.4']
    else:
        # default build flags, add special cases if needed
        obj.cxxflags = ["-Wall", "-Werror", '-DDEBUG', '-O0']
        obj.ldflags = ['']

    obj.target = "zookeeper_native"
    obj.source = "src/node-zk.cpp"
    obj.lib = ["zookeeper_st"]
    obj.includes = includes
    obj.libpath = libpaths
