cmake_minimum_required(VERSION 3.13)
project(image_processor)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Emscripten 설정
set(CMAKE_TOOLCHAIN_FILE $ENV{EMSDK}/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake)

# 컴파일 옵션
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -s WASM=1 -s ALLOW_MEMORY_GROWTH=1")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s EXPORTED_RUNTIME_METHODS=['ccall','cwrap']")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s EXPORTED_FUNCTIONS=['_malloc','_free']")

# 소스 파일
add_executable(image_processor.js image_processor.cpp)

# 출력 설정
set_target_properties(image_processor.js PROPERTIES
    LINK_FLAGS "-s ENVIRONMENT='web' -s EXPORT_NAME='ImageProcessor' -s MODULARIZE=1"
    SUFFIX ".js"
) 