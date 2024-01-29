{
  "variables": {
    "platform": "<(OS)"
  },
  "targets": [
    {
      "target_name": "zookeeper",
      "dependencies": [
        "libzk"
      ],
      "sources": [
        "src/node-zk.cpp"
      ],
      "cflags": [
        "-w",
        "-O0"
      ],
      "conditions": [
        [
          "OS==\"mac\"",
          {
            "include_dirs": [
              "<(module_root_dir)/deps/zookeeper-client-c/include",
              "<(module_root_dir)/deps/zookeeper-client-c/generated",
              "<!(node -e \"require('nan')\")"
            ],
            "libraries": [
              "<(module_root_dir)/deps/zookeeper-client-c/.libs/libzookeeper_st.a"
            ],
            "xcode_settings": {
              "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
              "MACOSX_DEPLOYMENT_TARGET": "<!(sw_vers -productVersion)"
            }
          }
        ],
        [
          "OS==\"linux\"",
          {
            "variables": {"with_ssl": "<!(if [[ $(openssl version -v | tr '[:upper:]' '[:lower:]') = openssl* ]]; then echo 'WITH_SSL'; else echo 'WITHOUT_SSL'; fi)"},
            "defines": ["<(with_ssl)"],
            "include_dirs": [
              "<(module_root_dir)/deps/zookeeper-client-c/include",
              "<(module_root_dir)/deps/zookeeper-client-c/generated",
              "<!(node -e \"require('nan')\")"
            ],
            "libraries": [
              "<(module_root_dir)/deps/zookeeper-client-c/.libs/libzookeeper_st.a"
            ]
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
            "include_dirs": [
              "<(module_root_dir)/deps/zookeeper-client-c/include",
              "<(module_root_dir)/deps/zookeeper-client-c/generated",
              "<!(node -e \"require('nan')\")"
            ],
            "libraries": [
              "<(module_root_dir)/deps/zookeeper-client-c/Debug/zookeeper.lib",
              "<(module_root_dir)/deps/zookeeper-client-c/Debug/hashtable.lib",
              "msvcrt.lib",
              "msvcmrt.lib",
              "Ws2_32.lib",
              "Mswsock.lib",
              "AdvApi32.lib"
            ]
          }
        ]
      ]
    },
    {
      "target_name": "libzk",
      "type": "none",
      "actions": [
        {
          "action_name": "build_zk_client_lib",
          "inputs": [
            ""
          ],
          "outputs": [
            ""
          ],
          "action": [
            "node",
            "scripts/build.js"
          ]
        }
      ]
    },
    {
      "target_name": "after_build",
      "type": "none",
      "dependencies": [
        "zookeeper"
      ],
      "copies": [
        {
          "files": [
            "<(PRODUCT_DIR)/zookeeper.node"
          ],
          "destination": "<(module_root_dir)/build"
        }
      ]
    }
  ]
}
