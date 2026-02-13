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
      @click="$emit('toggle', 'api')"
      class="w-full min-h-[56px] px-5 py-4 flex items-center justify-between cursor-pointer"
      :class="isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/20"
        >
          <Icon name="fa-plug" class="text-amber-500" />
        </div>
        <span
          class="font-semibold"
          :class="isDark ? 'text-white' : 'text-gray-800'"
        >
          {{ t.api }}
        </span>
      </div>
      <Icon
        name="fa-chevron-down"
        class="transition-transform duration-300"
        :class="[
          openSection === 'api' ? 'rotate-180' : '',
          isDark ? 'text-gray-500' : 'text-gray-400',
        ]"
      />
    </button>

    <div
      :class="[
        'overflow-hidden',
        animationsEnabled ? 'transition-all duration-300' : '',
      ]"
      :style="{ maxHeight: openSection === 'api' ? '200px' : '0' }"
    >
      <div class="px-5 pb-5">
        <label
          class="block mb-2 text-sm font-medium"
          :class="isDark ? 'text-white' : 'text-gray-700'"
        >
          {{ t.vtProxy }}
        </label>
        <input
          type="url"
          :value="store.config.vtProxyUrl"
          @input="updateConfig('vtProxyUrl', $event.target.value)"
          placeholder="https://your-worker.workers.dev"
          :class="[
            'w-full min-h-[48px] px-4 py-3 rounded-xl border text-sm',
            isDark
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
              : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400',
          ]"
        />
        <p
          class="mt-2 text-xs"
          :class="isDark ? 'text-gray-500' : 'text-gray-400'"
        >
          {{ t.vtProxyDesc }}
        </p>
      </div>
    </div>
  </div>
</template>
