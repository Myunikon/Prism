<script setup>
import { computed } from "vue";
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

// Font size display
const fontSizes = computed(() => [
  { key: "small", label: "S", size: "text-xs" },
  { key: "medium", label: "M", size: "text-sm" },
  { key: "large", label: "L", size: "text-base" },
]);
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
    <!-- Section Header -->
    <button
      @click="$emit('toggle', 'appearance')"
      class="w-full min-h-[56px] px-5 py-4 flex items-center justify-between cursor-pointer"
      :class="isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/20"
        >
          <Icon name="fa-palette" class="text-purple-500" />
        </div>
        <span
          class="font-semibold"
          :class="isDark ? 'text-white' : 'text-gray-800'"
        >
          {{ t.appearance }}
        </span>
      </div>
      <Icon
        name="fa-chevron-down"
        class="transition-transform duration-300"
        :class="[
          openSection === 'appearance' ? 'rotate-180' : '',
          isDark ? 'text-gray-500' : 'text-gray-400',
        ]"
      />
    </button>

    <!-- Section Content -->
    <div
      :class="[
        'overflow-hidden',
        animationsEnabled ? 'transition-all duration-300' : '',
      ]"
      :style="{ maxHeight: openSection === 'appearance' ? '600px' : '0' }"
    >
      <div class="px-5 pb-5 space-y-5">
        <!-- Dark Mode -->
        <div
          class="flex items-center justify-between min-h-[52px] flex-wrap gap-2"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center"
              :class="isDark ? 'bg-gray-700' : 'bg-gray-100'"
            >
              <Icon
                name="fa-moon"
                :class="isDark ? 'text-yellow-400' : 'text-gray-500'"
              />
            </div>
            <div>
              <p
                class="text-sm font-medium"
                :class="isDark ? 'text-white' : 'text-gray-700'"
              >
                {{ t.darkMode }}
              </p>
              <p
                class="text-xs"
                :class="isDark ? 'text-gray-500' : 'text-gray-400'"
              >
                {{ t.darkModeDesc }}
              </p>
            </div>
          </div>
          <!-- Custom Toggle -->
          <button
            @click="updateConfig('darkMode', !store.config.darkMode)"
            :class="[
              'relative w-14 h-8 rounded-full cursor-pointer',
              animationsEnabled ? 'transition-colors duration-300' : '',
              store.config.darkMode ? 'bg-purple-500' : 'bg-gray-300',
            ]"
          >
            <div
              :class="[
                'absolute top-1 w-6 h-6 bg-white rounded-full shadow-md',
                animationsEnabled ? 'transition-transform duration-300' : '',
                store.config.darkMode ? 'translate-x-7' : 'translate-x-1',
              ]"
            ></div>
          </button>
        </div>

        <!-- Language -->
        <div
          class="flex items-center justify-between min-h-[52px] flex-wrap gap-2"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center"
              :class="isDark ? 'bg-gray-700' : 'bg-gray-100'"
            >
              <Icon name="fa-globe" class="text-blue-500" />
            </div>
            <p
              class="text-sm font-medium"
              :class="isDark ? 'text-white' : 'text-gray-700'"
            >
              {{ t.language }}
            </p>
          </div>
          <select
            :value="store.config.language"
            @change="updateConfig('language', $event.target.value)"
            :class="[
              'min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium border cursor-pointer',
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-700',
            ]"
          >
            <option value="en">English</option>
            <option value="id">Bahasa Indonesia</option>
          </select>
        </div>

        <!-- Font Size -->
        <div
          class="flex items-center justify-between min-h-[52px] flex-wrap gap-2"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center"
              :class="isDark ? 'bg-gray-700' : 'bg-gray-100'"
            >
              <Icon name="fa-text-height" class="text-green-500" />
            </div>
            <p
              class="text-sm font-medium"
              :class="isDark ? 'text-white' : 'text-gray-700'"
            >
              {{ t.fontSize }}
            </p>
          </div>
          <div class="flex gap-2">
            <button
              v-for="fs in fontSizes"
              :key="fs.key"
              @click="updateConfig('fontSize', fs.key)"
              :class="[
                'min-w-[44px] min-h-[44px] px-3 rounded-xl font-bold cursor-pointer',
                animationsEnabled
                  ? 'transition-all duration-200 hover:scale-105'
                  : '',
                fs.size,
                store.config.fontSize === fs.key
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              ]"
            >
              {{ fs.label }}
            </button>
          </div>
        </div>

        <!-- Animations -->
        <div
          class="flex items-center justify-between min-h-[52px] flex-wrap gap-2"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center"
              :class="isDark ? 'bg-gray-700' : 'bg-gray-100'"
            >
              <Icon
                name="fa-wand-magic-sparkles"
                class="text-pink-500"
                :class="animationsEnabled ? 'animate-pulse' : ''"
              />
            </div>
            <div>
              <p
                class="text-sm font-medium"
                :class="isDark ? 'text-white' : 'text-gray-700'"
              >
                {{ t.animations }}
              </p>
              <p
                class="text-xs"
                :class="isDark ? 'text-gray-500' : 'text-gray-400'"
              >
                {{ t.animationsDesc }}
              </p>
            </div>
          </div>
          <button
            @click="
              updateConfig(
                'animations',
                store.config.animations === true ? false : true
              )
            "
            :class="[
              'relative w-14 h-8 rounded-full cursor-pointer',
              animationsEnabled ? 'transition-colors duration-300' : '',
              store.config.animations === true ? 'bg-pink-500' : 'bg-gray-300',
            ]"
          >
            <div
              :class="[
                'absolute top-1 w-6 h-6 bg-white rounded-full shadow-md',
                animationsEnabled ? 'transition-transform duration-300' : '',
                store.config.animations === true
                  ? 'translate-x-7'
                  : 'translate-x-1',
              ]"
            ></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
