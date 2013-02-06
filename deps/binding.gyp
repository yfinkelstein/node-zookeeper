{
  'target_defaults': {
    'default_configuration': 'Debug',
    'configurations': {
      'Debug': {
        'defines': [ 'DEBUG', '_DEBUG' ],
        'msvs_settings': {
          'VCCLCompilerTool': {
            'RuntimeLibrary': 1, # static debug
          },
        },
      },
      'Release': {
        'defines': [ 'NDEBUG' ],
        'msvs_settings': {
          'VCCLCompilerTool': {
            'RuntimeLibrary': 0, # static release
          },
        },
      }
    },
    'msvs_settings': {
      'VCCLCompilerTool': {
      },
      'VCLibrarianTool': {
      },
      'VCLinkerTool': {
        'GenerateDebugInformation': 'true',
      },
    },
    'conditions': [
      ['OS == "win"', {
        'defines': [
          'WIN32', '_WINDOWS', 'WIN32_NOASM'
        ],
      }]
    ],
  },

  'targets': [
    {
      'target_name': 'zookeeper',
      'type': 'static_library',
      'include_dirs': [ 'zookeeper-3.4.4/src/c/include', 'zookeeper-3.4.4/src/c/generated'],
      'direct_dependent_settings': {
        'include_dirs': [ '.' ],
        'defines': [
          'MY_DEFINE=1'
        ],
      },
      'defines': [
          'MY_DEFINE=1'
      ],
      'sources+': [ 'zookeeper-3.4.4/src/c/src/hashtable/hashtable.c',
				   'zookeeper-3.4.4/src/c/src/hashtable/hashtable_itr.c',
				   'zookeeper-3.4.4/src/c/src/mt_adaptor.c',
				   'zookeeper-3.4.4/src/c/src/recordio.c',
				   'zookeeper-3.4.4/src/c/src/winport.c',
				   'zookeeper-3.4.4/src/c/src/zk_hashtable.c',
				   'zookeeper-3.4.4/src/c/src/zk_log.c',
				   'zookeeper-3.4.4/src/c/src/zookeeper.c',
				   'zookeeper-3.4.4/src/c/generated/zookeeper.jute.c'
	  ],
    }
  ]
}
