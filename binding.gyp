{
  'variables': {
    'platform': '<(OS)',
  },
  "targets":
  [
    {
      "target_name": "zookeeper",
      'message': 'Building Zookeeper Library',
      'dependencies': ['libzk', 'deps/binding.gyp:zookeeper'],
      "sources": [ "src/node-zk.cpp" ],
      'cflags': ['-Wall', '-O0'],
      'conditions': [
        ['OS=="solaris"', {
          'cflags': ['-Wno-strict-aliasing'],
          'defines': ['_POSIX_PTHREAD_SEMANTICS'],
          'include_dirs': ['/opt/local/include/zookeeper'],
		  'ldflags': ['-lzookeeper_st'],
        }],
		['OS=="mac"',{
		  'include_dirs': ['<(module_root_dir)/build/zk/include/zookeeper'],
          'libraries': ['<(module_root_dir)/build/zk/lib/libzookeeper_st.a'],
          'xcode_settings': {
          'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
          'MACOSX_DEPLOYMENT_TARGET': '10.5'
          }
        }],
		['OS=="linux"',{
          'include_dirs': ['<(module_root_dir)/build/zk/include/zookeeper'],
          'libraries': ['<(module_root_dir)/build/zk/lib/libzookeeper_st.a'],
        }],
		[ 'OS=="win"', { 
            'defines': ['DLL_EXPORT'],
			"sources": [ "src/node-zk.def" ],
			'include_dirs': ['<(module_root_dir)/deps/zookeeper-3.4.5/src/c/include', '<(module_root_dir)/deps/zookeeper-3.4.5/src/c/generated'],
			'libraries': ['<(module_root_dir)/build/Release/lib/zookeeper.lib','Ws2_32.lib']
			} 
  	 	],
      ]
    },
    {
      'target_name': 'libzk',
      'type': 'executable',
	  'actions': [{
		'action_name': 'build_zk_client_lib',
		'inputs': [''],
		'outputs': [''],
		'message': 'Donwloading Zookeeper Library',
		'action': ['python', 'libzk-download.py', '--download', '--patch']
		}]
    },
    {
      'target_name': 'clean',
      'type': 'executable',
	  'actions': [{
		'action_name': 'clean_client_lib',
		'inputs': [''],
		'outputs': [''],
		'message': 'Cleaning Zookeeper Library',
		'action': ['python', 'libzk-download.py', '--clean']
		}]
    }
	]
}
