srcdir = "."
blddir = "build"
VERSION = "0.0.1"

def set_options(opt):
    opt.tool_options("compiler_cxx")

def configure(conf):
    conf.check_tool("compiler_cxx")
    conf.check_tool("node_addon")


def build(bld):
    obj = bld.new_task_gen("cxx", "shlib", "node_addon")
    obj.cxxflags = ["-Wall", "-Werror", '-DDEBUG', '-O0']
    obj.target = "node_zk"
    obj.source = "src/node-zk.cpp"
    obj.lib = ["zookeeper_st"]
    obj.includes = ["/usr/local/include/c-client-src"]
    obj.libpath = ["/usr/local/lib"]
