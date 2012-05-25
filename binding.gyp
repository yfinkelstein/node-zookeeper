{
  'variables': {
    'platform': '<(OS)',
  },
  "targets":
  [
    {
      "target_name": "zookeeper",
      "sources": [ "src/node-zk.cpp" ],
      'dependencies': ['libzk'],
      'include_dirs': ['./build/zk/include/zookeeper'],
      'cflags': ['-Wall', '-Werror', '-O0'],
      'libraries': ['<(module_root_dir)/build/zk/lib/libzookeeper_st.a'],
      'conditions': [
        ['OS=="darwin"', {
          'xcode_settings': {
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
            'MACOSX_DEPLOYMENT_TARGET': '10.5'
          }
        }],
        ['OS=="sunos"', {
          'defines': ['_POSIX_PTHREAD_SEMANTICS'],
          'ldflags': ['-lnsl', '-lsocket']
        }]
      ]
    },
    {
      'target_name': 'libzk',
      'type': 'none',
      'actions': [
        {
          'action_name': 'build_zk_client_lib',
          'inputs': [''],
          'outputs': [''],
          'action': ['sh', 'libzk-build.sh']
        }
      ]
    }
  ]
}
