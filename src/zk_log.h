/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include <stdio.h>
#include <stdarg.h>

#ifndef ZK_LOG_H_
#define ZK_LOG_H_

#include <zookeeper.h>

#ifdef __cplusplus
extern "C" {
#endif

extern ZOOAPI ZooLogLevel logLevel;
#define LOGSTREAM NULL

#define LOG_ERROR(...) if(logLevel>=ZOO_LOG_LEVEL_ERROR) \
    WriteFormatted(__VA_ARGS__)
#define LOG_WARN(...) if(logLevel>=ZOO_LOG_LEVEL_WARN) \
    WriteFormatted(__VA_ARGS__)
#define LOG_INFO(...) if(logLevel>=ZOO_LOG_LEVEL_INFO) \
    WriteFormatted(__VA_ARGS__)
#define LOG_DEBUG(...) if(logLevel==ZOO_LOG_LEVEL_DEBUG) \
    WriteFormatted(__VA_ARGS__)


void WriteFormatted(const char * format, ...)
{
  va_list args;
  va_start(args, format);
  vprintf(format, args);
  va_end(args);
}

#ifdef __cplusplus
}
#endif

#endif /*ZK_LOG_H_*/
