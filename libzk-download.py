import os
import tarfile
import zipfile
import urllib2

scriptPath = os.path.dirname(os.path.realpath(__file__))
ZK = "zookeeper-3.4.4"
url = "http://apache.mirrors.tds.net/zookeeper/" + ZK + "/" + ZK + ".tar.gz"

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

print "Current directory : " + os.getcwd()
print "Downloading file from " + url + " to " + scriptPath + "/deps"
#download_file(url, scriptPath + "/deps")
print ZK + " has been downloaded"
#extract_file(ZK + ".tar.gz", scriptPath + "/deps/")
print ZK + " has been extracted"


