<script setup>
defineProps({
  isDragging: Boolean,
  isDark: Boolean,
  t: Object,
});

const emit = defineEmits(["drop", "file-select", "update:isDragging"]);

const onDragOver = () => emit("update:isDragging", true);
const onDragLeave = () => emit("update:isDragging", false);
const onDrop = (e) => {
  emit("update:isDragging", false);
  emit("drop", e);
};
const onFileSelect = (e) => emit("file-select", e);
</script>

<template>
  <div
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
    :class="[
      'flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all cursor-pointer min-h-[60vh] md:min-h-0',
      isDragging
        ? 'border-purple-500 bg-purple-50/50'
        : isDark
        ? 'border-gray-600 bg-gray-800/50 hover:border-purple-500 hover:bg-purple-900/20'
        : 'border-gray-300 bg-white/80 backdrop-blur hover:border-purple-400 hover:bg-purple-50/30',
    ]"
  >
    <div class="text-center p-8">
      <div
        class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl"
      >
        <Icon name="fa-cloud-arrow-up" class="text-3xl text-white" />
      </div>
      <h3
        class="text-xl font-bold mb-2"
        :class="isDark ? 'text-white' : 'text-gray-800'"
      >
        {{ t.dropToAnalyze }}
      </h3>
      <p
        class="text-sm mb-6"
        :class="isDark ? 'text-gray-400' : 'text-gray-500'"
      >
        {{ t.supports }}
      </p>
      <label
        class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
      >
        <Icon name="fa-folder-open" />
        {{ t.browseFiles }}
        <input
          type="file"
          class="hidden"
          @change="onFileSelect"
          accept="image/*,.txt,.json,.xml"
        />
      </label>
      <div
        class="mt-6 flex items-center justify-center gap-4 text-xs"
        :class="isDark ? 'text-gray-500' : 'text-gray-400'"
      >
        <span>
          <Icon name="fa-image" class="mr-1 text-purple-500" />
          {{ t.images }}
        </span>
        <span>
          <Icon name="fa-qrcode" class="mr-1 text-blue-500" />
          {{ t.qrCodes }}
        </span>
        <span>
          <Icon name="fa-file-code" class="mr-1 text-green-500" />
          JSON/XML
        </span>
      </div>
    </div>
  </div>
</template>
