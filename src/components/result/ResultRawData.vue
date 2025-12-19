<script setup>
import { getHexdump } from "../../utils/forensics.js";

defineProps({
  data: String,
  t: Object,
  isDark: Boolean,
});
</script>

<template>
  <div class="space-y-4">
    <div>
      <label
        class="text-xs font-bold uppercase tracking-wide mb-2 block"
        :class="isDark ? 'text-gray-400' : 'text-gray-500'"
        >Raw Data</label
      >
      <pre
        :class="[
          'text-xs font-mono whitespace-pre-wrap break-all select-all p-4 rounded-xl',
          isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700',
        ]"
        >{{ data }}</pre
      >
    </div>
    <div>
      <label
        class="text-xs font-bold uppercase tracking-wide mb-2 block"
        :class="isDark ? 'text-gray-400' : 'text-gray-500'"
      >
        <i class="fa-solid fa-hashtag mr-1"></i>{{ t.hexDump }}
      </label>
      <pre
        :class="[
          'text-[10px] font-mono p-4 rounded-xl overflow-x-auto',
          isDark ? 'bg-gray-900 text-gray-400' : 'bg-gray-900 text-gray-400',
        ]"
        >{{ getHexdump(data) }}</pre
      >
    </div>
  </div>
</template>
