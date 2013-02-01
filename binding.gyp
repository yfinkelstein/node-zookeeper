{
  'variables': {
    'platform': '<(OS)',
  },
  "targets":
  [
    {
      "target_name": "zookeeper",
      'dependencies': ['libzk'],
      "sources": [ "src/node-zk.cpp" ],
      'cflags': ['-Wall', '-Werror', '-O0'],
      'conditions': [
        ['OS=="solaris"', {
          'cflags': ['-Wno-strict-aliasing'],
          'defines': ['_POSIX_PTHREAD_SEMANTICS'],
          'include_dirs': ['/opt/local/include/zookeeper'],
	  'ldflags': ['-lzookeeper_st'],
        }],['OS=="mac"',{
	  'include_dirs': ['<(module_root_dir)/build/zk/include/zookeeper'],
          'libraries': ['<(module_root_dir)/build/zk/lib/libzookeeper_st.a'],
          'xcode_settings': {
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
            'MACOSX_DEPLOYMENT_TARGET': '10.5'
          }
        }],['OS=="linux"',{
          'include_dirs': ['<(module_root_dir)/build/zk/include/zookeeper'],
          'libraries': ['<(module_root_dir)/build/zk/lib/libzookeeper_st.a'],
        }],[ 'OS=="win"', { 
			'include_dirs': ['<(module_root_dir)/deps/zookeeper-3.4.4/src/c/include', '<(module_root_dir)/deps/zookeeper-3.4.4/src/c/generated'],
			'libraries': ['<(module_root_dir)/build/Release/lib/zookeeper.lib']
			} 
  	 	],
      ]
    },
    {
      'target_name': 'libzk',
      'type': 'none',
      'include_dirs': ['deps\zookeeper-3.4.4\src\c\include'],
      'conditions': [
		  [ 'OS=="win"', {
			  'dependencies': ['libzk-download', 'deps/binding.gyp:zookeeper'],		  			  
		  }],
		  ['OS == "solaris" or OS == "mac" or OS == "linux"', {
			  'actions': [{
				'action_name': 'build_zk_client_lib',
				'inputs': [''],
				'outputs': [''],
				'action': ['sh', 'libzk-build.sh']
			  }]
			}]
		]
    },
    {
      'target_name': 'libzk-download',
      'type': 'none',
	  'actions': [{
		'action_name': 'build_zk_client_lib',
		'inputs': [''],
		'outputs': [''],
		'action': ['python', 'libzk-download.py']
		}]
    }	
  ],
}
