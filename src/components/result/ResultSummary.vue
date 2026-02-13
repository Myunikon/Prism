<script setup>
const props = defineProps({
  analysis: Object,
  data: String,
  t: Object,
  isDark: Boolean,
});

const emit = defineEmits(["scanVt"]);

const copyToClipboard = () => {
  navigator.clipboard.writeText(props.data);
};
</script>

<template>
  <div class="space-y-4">
    <div>
      <label
        class="text-xs font-bold uppercase tracking-wide mb-2 block"
        :class="isDark ? 'text-gray-400' : 'text-gray-500'"
      >
        <Icon name="fa-file-lines" class="mr-1" />{{ t.decodedContent }}
      </label>
      <div
        :class="[
          'p-4 rounded-xl text-sm font-mono break-all select-all',
          isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700',
        ]"
      >
        {{ data }}
      </div>
      <div class="flex gap-2 mt-3">
        <button
          @click="copyToClipboard"
          :class="[
            'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2',
            isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600',
          ]"
        >
          <Icon name="fa-copy" />{{ t.copy }}
        </button>
        <button
          v-if="analysis.type === 'URL'"
          @click="$emit('scanVt')"
          class="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Icon name="fa-virus-slash" />{{ t.scanUrl }}
        </button>
      </div>
    </div>

    <!-- Flags -->
    <div v-if="analysis.heuristics.flags.length > 0" class="space-y-2">
      <label
        class="text-xs font-bold uppercase tracking-wide"
        :class="isDark ? 'text-gray-400' : 'text-gray-500'"
      >
        <Icon name="fa-triangle-exclamation" class="mr-1 text-red-500" />
        >{{ t.riskFactors }}
      </label>
      <div
        v-for="(flag, idx) in analysis.heuristics.flags"
        :key="idx"
        :class="[
          'p-3 border-l-4 border-red-500 text-sm rounded-r-xl flex items-center gap-2',
          isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700',
        ]"
      >
        <Icon name="fa-circle-exclamation" />{{ flag }}
      </div>
    </div>
    <div
      v-else
      :class="[
        'p-4 rounded-xl text-center',
        isDark ? 'bg-green-900/20' : 'bg-green-50',
      ]"
    >
      <Icon name="fa-check-circle" class="text-green-500 text-xl mb-2" />
      <p class="text-sm font-medium text-green-600">{{ t.noThreats }}</p>
    </div>
  </div>
</template>
