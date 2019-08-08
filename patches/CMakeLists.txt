cmake_minimum_required(VERSION 3.6)

project(zookeeper VERSION 3.5.5)
set(email user@zookeeper.apache.org)
set(description "zookeeper C client")

# general options
add_compile_options(/W0)
add_definitions(-DUSE_STATIC_LIB)

# CppUnit option
set(DEFAULT_WANT_CPPUNIT OFF)
option(WANT_CPPUNIT "Enables CppUnit and tests" ${DEFAULT_WANT_CPPUNIT})

# The function `to_have(in out)` converts a header name like `arpa/inet.h`
# into an Autotools style preprocessor definition `HAVE_ARPA_INET_H`.
# This is then set or unset in `configure_file()` step.
#
# Note that CMake functions do not have return values; instead an "out"
# variable must be passed, and explicitly set with parent scope.
function(to_have in out)
  string(TOUPPER ${in} str)
  string(REGEX REPLACE "/|\\." "_" str ${str})
  set(${out} "HAVE_${str}" PARENT_SCOPE)
endfunction()

# include file checks
foreach(f generated/zookeeper.jute.h generated/zookeeper.jute.c)
  if(EXISTS "${CMAKE_SOURCE_DIR}/${f}")
    to_have(${f} name)
    set(${name} 1)
  else()
    message(FATAL_ERROR
      "jute files are missing!\n"
      "Please run 'ant compile_jute' while in the ZooKeeper top level directory.")
  endif()
endforeach()

# configure
configure_file(cmake_config.h.in ${CMAKE_CURRENT_BINARY_DIR}/include/config.h)

# hashtable library
set(hashtable_sources src/hashtable/hashtable_itr.c src/hashtable/hashtable.c)
add_library(hashtable STATIC ${hashtable_sources})
target_include_directories(hashtable PUBLIC include)
target_link_libraries(hashtable PUBLIC $<$<OR:$<PLATFORM_ID:Linux>,$<PLATFORM_ID:FreeBSD>>:m>)

# zookeeper library
set(zookeeper_sources
  src/zookeeper.c
  src/recordio.c
  generated/zookeeper.jute.c
  src/zk_log.c
  src/zk_hashtable.c
  src/addrvec.c)

list(APPEND zookeeper_sources src/st_adaptor.c)

list(APPEND zookeeper_sources src/winport.c)

add_library(zookeeper STATIC ${zookeeper_sources})
target_include_directories(zookeeper PUBLIC include ${CMAKE_CURRENT_BINARY_DIR}/include generated)
target_link_libraries(zookeeper PUBLIC
  hashtable
  $<$<PLATFORM_ID:Linux>:rt> # clock_gettime
  $<$<PLATFORM_ID:Windows>:ws2_32>) # Winsock 2.0

# cli executable
add_executable(cli src/cli.c)
target_link_libraries(cli zookeeper)
