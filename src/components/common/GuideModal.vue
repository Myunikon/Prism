<script setup>
import { store } from "../../store/state.js";
import { computed } from "vue";
import { guideContent } from "../../i18n/guide.js";

const isDark = computed(() => store.config.darkMode);
const animationsEnabled = computed(() => store.config.animations !== false);
const lang = computed(() => store.config.language);

const t = computed(() => guideContent[lang.value] || guideContent.en);
</script>

<template>
  <Transition :enter-active-class="animationsEnabled ? 'animate-fade-in' : ''">
    <div
      v-if="store.isGuideOpen"
      class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="store.isGuideOpen = false"
    >
      <div
        :class="[
          'w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col',
          animationsEnabled ? 'animate-scale-in' : '',
          isDark ? 'bg-gray-800' : 'bg-white',
        ]"
      >
        <!-- Header -->
        <div
          class="p-5 border-b flex justify-between items-center shrink-0"
          :class="isDark ? 'border-gray-700' : 'border-gray-200'"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
            >
              <Icon name="fa-book-open" class="text-white text-xl" />
            </div>
            <div>
              <h2
                class="text-lg font-bold"
                :class="isDark ? 'text-white' : 'text-gray-800'"
              >
                {{ t.title }}
              </h2>
              <p
                class="text-xs"
                :class="isDark ? 'text-gray-400' : 'text-gray-500'"
              >
                {{ t.subtitle }}
              </p>
            </div>
          </div>
          <button
            @click="store.isGuideOpen = false"
            :class="[
              'p-2.5 rounded-xl transition-colors cursor-pointer',
              isDark
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
            ]"
          >
            <Icon name="fa-xmark" class="text-lg" />
          </button>
        </div>

        <!-- Body - Scrollable -->
        <div class="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          <!-- Main Sections -->
          <div
            v-for="(section, idx) in t.sections"
            :key="idx"
            :class="[
              'p-4 rounded-2xl',
              isDark ? 'bg-gray-700/50' : 'bg-gray-50',
            ]"
          >
            <h3
              class="text-sm font-bold mb-2 flex items-center gap-2"
              :class="isDark ? 'text-white' : 'text-gray-800'"
            >
              <Icon :name="section.icon" :class="[section.iconColor]" />
              {{ section.title }}
            </h3>
            <p
              class="text-sm mb-3"
              :class="isDark ? 'text-gray-300' : 'text-gray-600'"
            >
              {{ section.description }}
            </p>
            <ul class="space-y-1.5">
              <li
                v-for="(bullet, bidx) in section.bullets"
                :key="bidx"
                class="text-sm flex items-start gap-2"
                :class="isDark ? 'text-gray-400' : 'text-gray-500'"
              >
                <Icon name="fa-check" class="text-green-500 mt-1 text-xs" />
                <span>{{ bullet }}</span>
              </li>
            </ul>
          </div>

          <!-- Threat Levels -->
          <div>
            <h3
              class="text-sm font-bold mb-3 flex items-center gap-2"
              :class="isDark ? 'text-white' : 'text-gray-800'"
            >
              <Icon name="fa-gauge" class="text-cyan-500" />
              {{ t.threatLevels.title }}
            </h3>
            <div class="grid grid-cols-3 gap-2">
              <div
                v-for="level in t.threatLevels.levels"
                :key="level.name"
                :class="[
                  'p-3 rounded-xl text-center',
                  isDark ? `bg-${level.color}-900/30` : `bg-${level.color}-50`,
                ]"
              >
                <div
                  :class="[
                    'w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md',
                    `from-${level.color}-500 to-${level.color}-600`,
                  ]"
                >
                  <Icon :name="level.icon" class="text-white" />
                </div>
                <p :class="['text-xs font-bold', `text-${level.color}-600`]">
                  {{ level.name }}
                </p>
                <p
                  class="text-[10px]"
                  :class="isDark ? 'text-gray-400' : 'text-gray-500'"
                >
                  {{ level.desc }}
                </p>
              </div>
            </div>
          </div>

          <!-- Protocols -->
          <div>
            <h3
              class="text-sm font-bold mb-3 flex items-center gap-2"
              :class="isDark ? 'text-white' : 'text-gray-800'"
            >
              <Icon name="fa-code" class="text-purple-500" />
              {{ t.protocols.title }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="proto in t.protocols.list"
                :key="proto"
                :class="[
                  'px-3 py-1.5 text-xs font-medium rounded-lg',
                  isDark
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-600',
                ]"
              >
                {{ proto }}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="p-5 border-t shrink-0"
          :class="isDark ? 'border-gray-700' : 'border-gray-200'"
        >
          <button
            @click="store.isGuideOpen = false"
            class="w-full py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all cursor-pointer"
          >
            {{ t.close }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
