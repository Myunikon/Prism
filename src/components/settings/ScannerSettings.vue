<script setup>
import { store } from "../../store/state.js";

defineProps({
  openSection: String,
  animationsEnabled: Boolean,
  isDark: Boolean,
  t: Object,
});

const emit = defineEmits(["toggle"]);

const updateConfig = (key, value) => {
  store.setConfig(key, value);
};
</script>

<template>
  <div
    :class="[
      'rounded-2xl shadow-sm border overflow-hidden',
      animationsEnabled ? 'transition-all duration-300 hover:shadow-md' : '',
      isDark
        ? 'bg-gray-800/90 border-gray-700'
        : 'bg-white/90 backdrop-blur border-gray-100',
    ]"
  >
    <button
      @click="$emit('toggle', 'scanner')"
      class="w-full min-h-[56px] px-5 py-4 flex items-center justify-between cursor-pointer"
      :class="isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/20"
        >
          <i class="fa-solid fa-camera text-blue-500"></i>
        </div>
        <span
          class="font-semibold"
          :class="isDark ? 'text-white' : 'text-gray-800'"
        >
          {{ t.scanner }}
        </span>
      </div>
      <i
        :class="[
          'fa-solid fa-chevron-down transition-transform duration-300',
          openSection === 'scanner' ? 'rotate-180' : '',
          isDark ? 'text-gray-500' : 'text-gray-400',
        ]"
      ></i>
    </button>

    <div
      :class="[
        'overflow-hidden',
        animationsEnabled ? 'transition-all duration-300' : '',
      ]"
      :style="{ maxHeight: openSection === 'scanner' ? '300px' : '0' }"
    >
      <div class="px-5 pb-5 space-y-5">
        <!-- Auto-scan -->
        <div class="flex items-center justify-between min-h-[52px]">
          <div class="flex items-center gap-3">
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center"
              :class="isDark ? 'bg-gray-700' : 'bg-gray-100'"
            >
              <i class="fa-solid fa-bolt text-yellow-500"></i>
            </div>
            <div>
              <p
                class="text-sm font-medium"
                :class="isDark ? 'text-white' : 'text-gray-700'"
              >
                {{ t.autoScan }}
              </p>
              <p
                class="text-xs"
                :class="isDark ? 'text-gray-500' : 'text-gray-400'"
              >
                {{ t.autoScanDesc }}
              </p>
            </div>
          </div>
          <button
            @click="updateConfig('autoScan', !store.config.autoScan)"
            :class="[
              'relative w-14 h-8 rounded-full cursor-pointer',
              animationsEnabled ? 'transition-colors duration-300' : '',
              store.config.autoScan ? 'bg-blue-500' : 'bg-gray-300',
            ]"
          >
            <div
              :class="[
                'absolute top-1 w-6 h-6 bg-white rounded-full shadow-md',
                animationsEnabled ? 'transition-transform duration-300' : '',
                store.config.autoScan ? 'translate-x-7' : 'translate-x-1',
              ]"
            ></div>
          </button>
        </div>

        <!-- Haptic -->
        <div class="flex items-center justify-between min-h-[52px]">
          <div class="flex items-center gap-3">
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center"
              :class="isDark ? 'bg-gray-700' : 'bg-gray-100'"
            >
              <i class="fa-solid fa-mobile-screen-button text-orange-500"></i>
            </div>
            <div>
              <p
                class="text-sm font-medium"
                :class="isDark ? 'text-white' : 'text-gray-700'"
              >
                {{ t.haptic }}
              </p>
              <p
                class="text-xs"
                :class="isDark ? 'text-gray-500' : 'text-gray-400'"
              >
                {{ t.hapticDesc }}
              </p>
            </div>
          </div>
          <button
            @click="updateConfig('vibration', !store.config.vibration)"
            :class="[
              'relative w-14 h-8 rounded-full cursor-pointer',
              animationsEnabled ? 'transition-colors duration-300' : '',
              store.config.vibration ? 'bg-orange-500' : 'bg-gray-300',
            ]"
          >
            <div
              :class="[
                'absolute top-1 w-6 h-6 bg-white rounded-full shadow-md',
                animationsEnabled ? 'transition-transform duration-300' : '',
                store.config.vibration ? 'translate-x-7' : 'translate-x-1',
              ]"
            ></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
