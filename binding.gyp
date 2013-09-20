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
      'cflags': ['-Wall', '-O0'],
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
        }]
      ]
    },
    {
      'target_name': 'libzk',
      'type': 'none',
      'actions': [{
        'action_name': 'build_zk_client_lib',
        'inputs': [''],
        'outputs': [''],
        'action': ['sh', 'libzk-build.sh']
      }]
    },
    {
      "target_name": "after_build",
      "type": "none",
      "dependencies": ["zookeeper"],
      "actions": [{
        "action_name": "symlink",
        "inputs": ["<@(PRODUCT_DIR)/zookeeper.node"],
        "outputs": ["<(module_root_dir)/build/zookeeper.node"],
        "action": ["sh", "libzk-symlink.sh", "<@(_inputs)"]
      }]
    }
  ],
}
