<script setup>
import { computed } from "vue";
import { useToast } from "../../composables/useToast.js";

const { state, hideToast } = useToast();

const typeClasses = computed(() => {
  switch (state.type) {
    case "success":
      return "bg-green-500 text-white shadow-green-500/20";
    case "error":
      return "bg-red-500 text-white shadow-red-500/20";
    case "warning":
      return "bg-orange-500 text-white shadow-orange-500/20";
    default:
      return "bg-gray-800 text-white shadow-gray-500/20";
  }
});

const iconClass = computed(() => {
  switch (state.type) {
    case "success":
      return "fa-check-circle";
    case "error":
      return "fa-triangle-exclamation";
    case "warning":
      return "fa-circle-exclamation";
    default:
      return "fa-info-circle";
  }
});
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0 scale-95"
    enter-to-class="translate-y-0 opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100 scale-100"
    leave-to-class="translate-y-full opacity-0 scale-95"
  >
    <div
      v-if="state.visible"
      class="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 pointer-events-none"
    >
      <div
        :class="[
          'px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 pointer-events-auto backdrop-blur-sm',
          typeClasses,
        ]"
      >
        <div class="flex items-center gap-3">
          <i :class="['fa-solid text-xl', iconClass]"></i>
          <p class="text-sm font-bold">{{ state.message }}</p>
        </div>
        <button
          @click="hideToast"
          class="p-1 rounded-lg hover:bg-white/20 transition-colors"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  </Transition>
</template>
