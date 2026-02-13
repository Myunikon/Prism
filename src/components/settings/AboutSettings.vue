<script setup>
defineProps({
  openSection: String,
  animationsEnabled: Boolean,
  isDark: Boolean,
  t: Object,
  isMobile: Boolean,
});
</script>

<template>
  <div
    v-if="openSection === 'about' || !isMobile"
    :class="[
      'rounded-2xl p-5 shadow-sm border',
      animationsEnabled ? 'transition-all duration-300 hover:shadow-md' : '',
      isDark
        ? 'bg-gray-800/90 border-gray-700'
        : 'bg-white/90 backdrop-blur border-gray-100',
    ]"
  >
    <div class="flex items-center gap-3 mb-4 min-h-[56px]">
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-500/20"
      >
        <Icon name="fa-info-circle" class="text-gray-500" />
      </div>
      <span
        class="font-semibold"
        :class="isDark ? 'text-white' : 'text-gray-800'"
      >
        {{ t.about }}
      </span>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between min-h-[44px]">
        <span
          class="text-sm"
          :class="isDark ? 'text-gray-400' : 'text-gray-600'"
          >{{ t.version }}</span
        >
        <span
          :class="[
            'text-sm font-mono px-3 py-1.5 rounded-lg',
            isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700',
          ]"
        >
          2.0.0
        </span>
      </div>

      <div class="flex items-center justify-between min-h-[44px]">
        <span
          class="text-sm"
          :class="isDark ? 'text-gray-400' : 'text-gray-600'"
          >Developer</span
        >
        <a
          href="https://github.com/Myunikon"
          target="_blank"
          class="flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
        >
          <Icon name="fa-github" class="text-lg" />
          Myunikon
        </a>
      </div>

      <div
        class="pt-4 border-t"
        :class="isDark ? 'border-gray-700' : 'border-gray-100'"
      >
        <p
          class="text-xs text-center leading-relaxed"
          :class="isDark ? 'text-gray-500' : 'text-gray-400'"
        >
          Built for security and performance. <br />
          Thank you for using Prism.
        </p>
      </div>
    </div>
  </div>
</template>
