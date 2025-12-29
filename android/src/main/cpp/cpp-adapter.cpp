#include <jni.h>
#include "sharedtransitionOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::sharedtransition::initialize(vm);
}
