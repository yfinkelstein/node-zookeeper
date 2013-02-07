#!/usr/bin/python
import os
import platform
import tarfile
import zipfile
import urllib2
import httplib
import subprocess
import sys
import hashlib
import shutil
import pickle
from functools import partial
from optparse import OptionParser

#
# SCRIPT - LOCATION PATH
#
SCRIPT_PATH = os.path.dirname(os.path.realpath(__file__))

#
# PROXY
#
ZK_HTTP_PROXY = ""

#
# A FEW DECLARARTIONS
#
ZK_DEPS_NAME = "deps"
ZK_NAME = "zookeeper"
ZK_VERSION = "3.4.5"

#
# SOME VARIABLES DEFINED BASE ON DECLARARTIONS
#
ZK_BASENAME = ZK_NAME + "-" + ZK_VERSION
ZK_FULLNAME = ZK_BASENAME + ".tar.gz"
ZK_DESTPATH = SCRIPT_PATH + "/" + ZK_DEPS_NAME
ZK_FULLPATH = ZK_DESTPATH + "/" + ZK_FULLNAME
ZK_SERVER = "apache.mirrors.tds.net"
ZK_DOWNLOAD_URL = "http://" + ZK_SERVER + "/" + ZK_NAME + "/" + ZK_BASENAME + "/" + ZK_FULLNAME
ZK_CACHE_FILENAME = "download.cache"

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
        etag = meta.getheaders("etag")[0]
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
        return etag
    finally:
        os.chdir(cwd)

def hash_file(filename):
    with open(filename, mode='rb') as f:
        d = hashlib.md5()
        m = hashlib.md5()
        for buf in iter(partial(f.read, 128), b''):
            d.update(buf)
    m.update(d.hexdigest())
    return d.hexdigest()

def get_etag(url):
	request = urllib2.Request(url)
	request.get_method = lambda : 'HEAD'
	response = urllib2.urlopen(request)
	meta = response.info()
	return meta.getheaders("etag")[0]

def build_lib(from_directory='.'):
	p = subprocess.Popen([sys.executable, from_directory + "ls -l"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE)
	for line in p.stdout.readlines():
		print line
	retval = p.wait()

def clean_deps(from_directory='abc', from_file='def'):
	dirpath=os.path.realpath(from_directory + '/' + ZK_BASENAME)
	tarpath=os.path.realpath(from_directory + '/' + ZK_FULLNAME)
	cachepath=os.path.realpath(from_directory + '/' + ZK_CACHE_FILENAME)

	print "Cleaning : " + dirpath
	if (os.path.exists(dirpath)):
		shutil.rmtree(dirpath)
		
	print "Cleaning : " + tarpath
	if (os.path.exists(tarpath)):
		os.unlink(tarpath)
	
	print "Cleaning : " + cachepath
	if (os.path.exists(cachepath)):
		os.unlink(cachepath)
		
def download_deps(from_directory='abc'):
	localHash=0
	remoteEtag=0
	hash=-1	
	etag=-1
	cacheInfo = os.path.realpath(ZK_DESTPATH + '/' + ZK_CACHE_FILENAME)
	if (os.path.exists(ZK_FULLPATH)):
		localHash=hash_file(ZK_FULLPATH)
		remoteEtag=get_etag(ZK_DOWNLOAD_URL)
		if (os.path.exists(cacheInfo)):
			with open(cacheInfo, 'rb') as f:
				etag, hash = pickle.load(f)
	if ((etag==remoteEtag) and (hash==localHash)):
		print os.path.realpath(ZK_DESTPATH) + " is ready"
	else:
		print "Downloading file from " + ZK_DOWNLOAD_URL + " to " + ZK_DESTPATH
		etag = download_file(ZK_DOWNLOAD_URL, ZK_DESTPATH)
		hash = hash_file(ZK_FULLPATH)
		
		print "Saving download information to : " + os.path.realpath(ZK_DESTPATH + '/' + ZK_CACHE_FILENAME)	
		with open(cacheInfo, 'wb') as f:
			pickle.dump([etag, hash], f, -1)
			
		print "Extracting " + ZK_FULLNAME + " has been extracted"
		extract_file(ZK_FULLNAME, SCRIPT_PATH + "/" + ZK_DEPS_NAME + "/")
	
def patch_deps(from_directory='.'):    
    cwd = os.getcwd()
    os.chdir(from_directory)
    try:
        p = subprocess.Popen(["python", "patch-1.12.11.py", "--strip=3", "--", "mt_adaptor.c.patch"], cwd=os.path.realpath(from_directory), stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE)
        for line in p.stdout.readlines():
		    print line
        for line in p.stderr.readlines():
		    print line
        retval = p.wait()
    finally:
        os.chdir(cwd)

#
# Under posix system, the library is build
# by the native script
#
def build_deps(from_directory='abc'):
	if (os.name == "posix"):
		print "Not yet implemented"

#
# Command line options
#
parser = OptionParser()

#
# Define some switch commands
#
parser.add_option("-c", "--clean", 
                  action="store_true", dest="clean", default=False,
                  help="Clean the library projects (deps)")
				  
parser.add_option("-d", "--download",
                  action="store_true", dest="download", default=False,
                  help="Download the library (deps)")

parser.add_option("-b", "--build",
                  action="store_true", dest="build", default=False,
                  help="Build the library - (posix system only)")

parser.add_option("-p", "--patch",
                  action="store_true", dest="patch", default=False,
                  help="Patch the Zookeeper Library (Windows x64)")
#
# Parse the command line
#
(options, args) = parser.parse_args()

#
# Clean Option
#
if options.clean:
    clean_deps(ZK_DESTPATH)
	
#
# Download Option
#
if options.download:
    download_deps(ZK_DESTPATH)

#
# Patch Option
#
if options.patch:
    patch_deps(ZK_DESTPATH)

#
# Build Option
#
if options.build:
    build_deps(ZK_DESTPATH)

#if (os.name == "posix"):
#        build_lib("/deps")

		
