import Options
import platform

srcdir = "."
blddir = "build"
APPNAME = "zookeeper"
VERSION = "3.3.3-1"
OSTYPE = platform.system()


includes = ['/usr/local/include/c-client-src']
libpaths = ['/usr/local/lib']

def set_options(opt):
    opt.add_option('-z','--zookeeper', action='store', default='zookeeper-3.3.3', help='build zookeeper', dest='zookeeper')
    opt.tool_options("compiler_cxx")

def configure(conf):
    conf.check_tool("compiler_cxx")
    conf.check_tool("node_addon")

def zookeeper(ctx, z):
    global includes
    global libpaths
    t = ctx.bdir + '/zk'
    includes = [t + "/include/c-client-src"]
    libpaths = [t + "/lib"]
    if z == None:
        z = 'zookeeper-3.3.3'
    if z.find('/') == -1:
        tgz = z + '.tar.gz'
        r = ctx.exec_command("if [ ! -d '%s' -a ! -f '%s' ] ; then curl --silent --write-out '%%{http_code}' --output %s 'http://apache.mirrors.tds.net/zookeeper/%s/%s' | grep -v 404 ; fi" % (z,tgz,tgz,z,tgz))
        if r != 0:
            # probably building with an archive version, this is in a different directory
            print 'attempting to fetch from from archive location'
            ctx.exec_command("curl --output %s 'http://apache.mirrors.tds.net/hadoop/zookeeper/%s/%s'" % (tgz,z,tgz))
        ctx.exec_command("if [ ! -d '%s' ] ; then tar -xzvf %s ; fi" % (z,tgz))
    
    # We use "--without-shared" to force building/linking only the static libzookeeper.a library, else we would have unresolved runtime dependencies
    # We also use "--disable-shared" because on a newer version of the zk source (maybe 3.3.1 vs 3.3.0???), "--without-shared" is no longer recognized.  no idea why / wtf is going on here.  but it works.  and the other one gets silently ignored.  keeping both in the code to cover all our bases
    # We use "--with-pic" to make position-independent code that can be statically linked into a shared object file (zookeeper.node)
    ctx.exec_command("mkdir -p zk ; cd %s/src/c && ./configure --without-syncapi --without-shared --disable-shared --with-pic --prefix=%s && make clean install"%(z,t))

def build(bld):
    global includes
    global libpaths
    if Options.options.zookeeper != '':
        zookeeper(bld, Options.options.zookeeper)
    else:
        # for quicker development, run with "--zookeeper=" to skip rebuilding the zookeeper source (99% of build time)
        includes = [bld.bdir + '/zk/include/c-client-src']
        libpaths = [bld.bdir + '/zk/lib']

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
