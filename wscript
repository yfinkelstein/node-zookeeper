import Options
import platform

srcdir = "."
blddir = "build"
APPNAME = "zookeeper"
VERSION = "3.3.2-2"
OSTYPE = ""


includes = ['/usr/local/include/c-client-src']
libpaths = ['/usr/local/lib']


def detect_os():
	OSTYPE = platform.system()

def set_options(opt):
    opt.add_option('-z','--zookeeper', action='store', default='zookeeper-3.3.2', help='build zookeeper', dest='zookeeper')
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
        z = 'zookeeper-3.3.2'
    if z.find('/') == -1:
        tgz = z + '.tar.gz'
        ctx.exec_command("if [[ ! -d '%s' && ! -a '%s' ]] ; then curl 'http://apache.mirrors.tds.net//hadoop/zookeeper/%s/%s' > %s ; fi" % (z,tgz,z,tgz,tgz))
        ctx.exec_command("if [[ ! -d '%s' ]] ; then tar -xzvf %s ; fi" % (z,tgz))
        ctx.exec_command("mkdir -p zk ; cd %s/src/c && ./configure --without-syncapi --disable-shared --prefix=%s && make clean install"%(z,t))
    else:
        ctx.exec_command("mkdir -p zk ; cd %s/src/c && ./configure --without-syncapi --disable-shared --prefix=%s && make clean install"%(z,t))

def build(bld):
    detect_os()
    if Options.options.zookeeper != None:
        zookeeper(bld, Options.options.zookeeper)

    obj = bld.new_task_gen("cxx", "shlib", "node_addon")
    if OSTYPE == 'Darwin':
        obj.cxxflags = ["-Wall", "-Werror", '-DDEBUG', '-O0', '-mmacosx-version-min=10.4']
        obj.ldflags = ['-mmacosx-version-min=10.4']
    elif OSTYPE == 'Linux':
        obj.cxxflags = ["-Wall", "-Werror", '-DDEBUG', '-O0']
        obj.ldflags = ['']

    obj.target = "zookeeper"
    obj.source = "src/node-zk.cpp"
    obj.lib = ["zookeeper_st"]
    obj.includes = includes
    obj.libpath = libpaths
