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
