{
  "variables": {
    "platform": "<(OS)"
  },
  "targets": [
    {
      "target_name": "converters",
      "sources": [
        "wrappers/node-converters.cpp"
      ],
      "cflags": [
        "-Wall",
        "-O0"
      ],
      "conditions": [
        [
          "OS==\"mac\"",
          {
            "xcode_settings": {
              "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
              "MACOSX_DEPLOYMENT_TARGET": "<!(sw_vers -productVersion)"
            }
          }
        ],
        [
          "OS==\"win\"",
          {
            "defines": [
              "WIN32",
              "USE_STATIC_LIB"
            ],
            "msvs_settings": {
              "VCLinkerTool": {
                "IgnoreDefaultLibraryNames": [
                  "msvcrtd.lib",
                  "msvcmrtd.lib",
                  "libcmt.lib"
                ]
              }
            },
            "libraries": [
              "msvcrt.lib",
              "msvcmrt.lib",
              "Ws2_32.lib",
              "Mswsock.lib",
              "AdvApi32.lib"
            ]
          }
        ]
      ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ]
    }
  ]
}
