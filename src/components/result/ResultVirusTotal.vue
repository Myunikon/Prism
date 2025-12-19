<script setup>
defineProps({
  vtResult: Object,
  isLoadingVT: Boolean,
  t: Object,
  isDark: Boolean,
});

const emit = defineEmits(["startScan"]);
</script>

<template>
  <div class="min-h-[200px] flex items-center justify-center">
    <div v-if="isLoadingVT" class="text-center">
      <div
        class="w-10 h-10 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"
      ></div>
      <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
        {{ t.scanning }}
      </p>
    </div>
    <div v-else-if="vtResult" class="w-full">
      <div
        v-if="vtResult.error"
        :class="[
          'p-4 text-sm rounded-xl',
          isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700',
        ]"
      >
        <i class="fa-solid fa-circle-exclamation mr-2"></i>Error:
        {{ vtResult.error }}
      </div>
      <div v-else class="grid grid-cols-2 gap-4">
        <div
          :class="[
            'text-center p-6 rounded-2xl',
            isDark ? 'bg-red-900/30' : 'bg-red-100',
          ]"
        >
          <p class="text-4xl font-bold text-red-500 mb-1">
            {{ vtResult.malicious || 0 }}
          </p>
          <p class="text-sm font-medium text-red-600">{{ t.malicious }}</p>
        </div>
        <div
          :class="[
            'text-center p-6 rounded-2xl',
            isDark ? 'bg-green-900/30' : 'bg-green-100',
          ]"
        >
          <p class="text-4xl font-bold text-green-500 mb-1">
            {{ vtResult.harmless || 0 }}
          </p>
          <p class="text-sm font-medium text-green-600">{{ t.harmless }}</p>
        </div>
      </div>
    </div>
    <button
      v-else
      @click="$emit('startScan')"
      class="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all cursor-pointer"
    >
      <i class="fa-solid fa-rocket mr-2"></i>{{ t.startScan }}
    </button>
  </div>
</template>
