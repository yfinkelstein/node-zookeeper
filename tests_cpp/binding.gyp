{
  'variables': {
    'platform': '<(OS)',
  },
  "targets": [{
    "target_name": "converters",
    "sources": ["node-converters.cpp"],
    'cflags': ['-Wall', '-O0'],
    'conditions': [
      ['OS=="mac"', {
        'xcode_settings': {
          'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
          'MACOSX_DEPLOYMENT_TARGET': '<!(sw_vers -productVersion)'
        }
      }]
    ],
    'include_dirs': ['<!(node -e "require(\'nan\')")']
  }]
}
