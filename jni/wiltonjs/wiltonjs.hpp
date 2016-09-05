/* 
 * File:   wiltonjs.hpp
 * Author: alex
 *
 * Created on August 21, 2016, 1:15 PM
 */

#ifndef WILTONJS_WILTONJS_HPP
#define	WILTONJS_WILTONJS_HPP

#include <cstdint>
#include <mutex>
#include <string>
#include <unordered_set>
#include <vector>

#include "staticlib/serialization.hpp"

#include "wiltonjs/WiltonJsException.hpp"

namespace wiltonjs {

// Mustache

std::string mustache_render(const std::string& data, void* object);

// HttpClient

std::string httpclient_create(const std::string& data, void* object);

std::string httpclient_close(const std::string& data, void* object);

std::string httpclient_execute(const std::string& data, void* object);

std::string httpclient_send_temp_file(const std::string& data, void* object);

// Logger

std::string logger_initialize(const std::string& data, void* object);

std::string logger_log(const std::string& data, void* object);

std::string logger_is_level_enabled(const std::string& data, void* object);

// DB

std::string db_connection_open(const std::string& data, void* object);

std::string db_connection_query(const std::string& data, void* object);

std::string db_connection_execute(const std::string& data, void* object);

std::string db_connection_close(const std::string& data, void* object);

std::string db_transaction_start(const std::string& data, void* object);

std::string db_transaction_commit(const std::string& data, void* object);

std::string db_transaction_rollback(const std::string& data, void* object);

// Server

std::string server_create(const std::string& data, void* object);

std::string server_stop(const std::string& data, void* object);

std::string request_get_metadata(const std::string& data, void* object);

std::string request_get_data(const std::string& data, void* object);

std::string request_get_data_filename(const std::string& data, void* object);

std::string request_set_response_metadata(const std::string& data, void* object);

std::string request_send_response(const std::string& data, void* object);

std::string request_send_temp_file(const std::string& data, void* object);

std::string request_send_mustache(const std::string& data, void* object);

std::string request_send_later(const std::string& data, void* object);

std::string request_send_with_response_writer(const std::string& data, void* object);


// internal

namespace detail {

// shortcuts

void throw_wilton_error(char* err, const std::string& msg);

std::string wrap_wilton_output(char* out, int out_len);

// json parse

const std::string& get_json_string(const staticlib::serialization::JsonField& field);

int64_t get_json_handle(const staticlib::serialization::JsonField& field);

const staticlib::serialization::JsonValue& get_json_object(
        const staticlib::serialization::JsonField& field);

// JNI

void* /* JNIEnv* */ get_jni_env();

void* /* jmethodID */ get_gateway_method();

template<typename T>
class handle_registry {
    std::unordered_set<T*> registry;
    std::mutex mutex;

public:
    int64_t put(T* ptr) {
        std::lock_guard<std::mutex> lock(mutex);
        auto pair = registry.insert(ptr);
        return pair.second ? reinterpret_cast<int64_t> (ptr) : 0;
    }

    T* remove(int64_t handle) {
        std::lock_guard<std::mutex> lock(mutex);
        T* ptr = reinterpret_cast<T*> (handle);
        auto erased = registry.erase(ptr);
        return 1 == erased ? ptr : nullptr;
    }
};

} // namespace

} // namespace

#endif	/* WILTONJS_WILTONJS_HPP */
