<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { store } from "../../store/state.js";

const props = defineProps({
  show: Boolean,
  message: { type: String, default: "" },
  type: { type: String, default: "success" }, // success, error, warning, info
  duration: { type: Number, default: 3000 },
});

const emit = defineEmits(["close"]);

const isDark = computed(() => store.config.darkMode);
const animationsEnabled = computed(() => store.config.animations !== false);

const iconClass = computed(() => {
  switch (props.type) {
    case "error":
      return "fa-solid fa-circle-xmark text-red-500";
    case "warning":
      return "fa-solid fa-exclamation-triangle text-amber-500";
    case "info":
      return "fa-solid fa-info-circle text-blue-500";
    default:
      return "fa-solid fa-circle-check text-green-500";
  }
});

const bgClass = computed(() => {
  switch (props.type) {
    case "error":
      return isDark.value
        ? "bg-red-900/90 border-red-700"
        : "bg-red-50 border-red-200";
    case "warning":
      return isDark.value
        ? "bg-amber-900/90 border-amber-700"
        : "bg-amber-50 border-amber-200";
    case "info":
      return isDark.value
        ? "bg-blue-900/90 border-blue-700"
        : "bg-blue-50 border-blue-200";
    default:
      return isDark.value
        ? "bg-green-900/90 border-green-700"
        : "bg-green-50 border-green-200";
  }
});

let timeout = null;

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen && props.duration > 0) {
      timeout = setTimeout(() => {
        emit("close");
      }, props.duration);
    } else if (!isOpen && timeout) {
      clearTimeout(timeout);
    }
  }
);

onUnmounted(() => {
  if (timeout) clearTimeout(timeout);
});
</script>

<template>
  <Teleport to="body">
    <Transition
      :enter-active-class="
        animationsEnabled ? 'transition-all duration-300 transform' : ''
      "
      :leave-active-class="
        animationsEnabled ? 'transition-all duration-200 transform' : ''
      "
      enter-from-class="opacity-0 -translate-y-4"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div
        v-if="show"
        class="fixed top-4 left-1/2 -translate-x-1/2 z-[110] w-full max-w-sm px-4"
      >
        <div
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm',
            bgClass,
          ]"
        >
          <i :class="[iconClass, 'text-lg flex-shrink-0']"></i>
          <p
            class="flex-1 text-sm font-medium"
            :class="isDark ? 'text-white' : 'text-gray-800'"
          >
            {{ message }}
          </p>
          <button
            @click="emit('close')"
            class="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:bg-black/10"
            :class="isDark ? 'text-gray-300' : 'text-gray-500'"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
