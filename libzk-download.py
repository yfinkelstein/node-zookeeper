import os
import platform
import tarfile
import zipfile
import urllib2
import httplib
import subprocess
import sys
import hashlib
from functools import partial

SCRIPT_PATH = os.path.dirname(os.path.realpath(__file__))

ZK_DEPS_NAME = "deps"
ZK_NAME = "zookeeper"
ZK_VERSION = "3.4.4"

ZK_BASENAME = ZK_NAME + "-" + ZK_VERSION
ZK_FULLNAME = ZK_BASENAME + ".tar.gz"
ZK_DESTPATH = SCRIPT_PATH + "/" + ZK_DEPS_NAME
ZK_FULLPATH = ZK_DESTPATH + "/" + ZK_FULLNAME
ZK_SERVER = "apache.mirrors.tds.net"
ZK_DOWNLOAD_URL = "http://" + ZK_SERVER + "/" + ZK_NAME + "/" + ZK_FULLNAME

def extract_file(path, to_directory='.'):
    if path.endswith('.zip'):
        opener, mode = zipfile.ZipFile, 'r'
    elif path.endswith('.tar.gz') or path.endswith('.tgz'):
        opener, mode = tarfile.open, 'r:gz'
    elif path.endswith('.tar.bz2') or path.endswith('.tbz'):
        opener, mode = tarfile.open, 'r:bz2'
    else: 
        raise ValueError, "Could not extract `%s` as no appropriate extractor is found" % path
    
    cwd = os.getcwd()
    os.chdir(to_directory)
    
    try:
        file = opener(path, mode)
        try: file.extractall()
        finally: file.close()
    finally:
        os.chdir(cwd)

def download_file(url, to_directory='.'):
    cwd = os.getcwd()
    os.chdir(to_directory)

    try:
        file_name = url.split('/')[-1]
        u = urllib2.urlopen(url)
        f = open(file_name, 'wb')
        meta = u.info()
        file_size = int(meta.getheaders("Content-Length")[0])
        print "Downloading: %s Bytes: %s" % (file_name, file_size)

        file_size_dl = 0
        block_sz = 8192
        while True:
            buffer = u.read(block_sz)
            if not buffer:
                break
            file_size_dl += len(buffer)
            f.write(buffer)
            status = r"%10d  [%3.2f%%]" % (file_size_dl, file_size_dl * 100. / file_size)
            status = status + chr(8)*(len(status)+1)
            print status,
        f.close()
    finally:
        os.chdir(cwd)

def hash_file(filename):
    with open(filename, mode='rb') as f:
        d = hashlib.md5()
        m = hashlib.md5()
        for buf in iter(partial(f.read, 128), b''):
            d.update(buf)
    m.update(d.hexdigest())
    print m.hexdigest()
    return d.hexdigest()

def get_etag(url, fullname):
	print fullname
	conn = httplib.HTTPConnection(url)
	conn.request("HEAD", "/" + fullname)
	res = conn.getresponse()
	print res.status, res.reason
	print res.getheaders()

def build_lib(from_directory='.'):
        p = subprocess.Popen([sys.executable, from_directory + "ls -l"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE)
        for line in p.stdout.readlines():
		print line
        retval = p.wait()

if (os.path.exists(ZK_FULLPATH)):
	 print get_etag(ZK_SERVER, ZK_NAME + "/" + ZK_BASENAME + "/" + ZK_FULLNAME)
	 print hash_file(ZK_FULLPATH)
else:
	 print "Downloading file from " + ZK_DOWNLOAD_URL + " to " + ZK_DESTPATH
	 download_file(ZK_DOWNLOAD_URL, ZK_DESTPATH)

print "Extracting " + ZK_FULLNAME + " has been extracted"
extract_file(ZK_FULLNAME, SCRIPT_PATH + "/" + ZK_DEPS_NAME + "/")
print ZK_FULLNAME + " has been extracted"

#
# Under posix system, the library is build
# by the native script
#
if (os.name == "posix"):
        build_lib("/deps")
