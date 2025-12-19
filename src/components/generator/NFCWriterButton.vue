<script setup>
import { ref, onMounted } from "vue";
import { useNFC } from "../../composables/useNFC.js";

const props = defineProps({
  payload: { type: String, required: true },
  type: { type: String, default: "text" }, // text or url
});

const { isSupported, writeTag } = useNFC();
const supported = ref(false);
const isWriting = ref(false);

onMounted(() => {
  supported.value = isSupported();
});

const handleWrite = async () => {
  if (!props.payload) return;
  isWriting.value = true;
  await writeTag(props.payload, props.type);
  isWriting.value = false;
};
</script>

<template>
  <div v-if="supported">
    <button
      @click="handleWrite"
      class="w-full py-3 px-6 bg-gray-800 hover:bg-cyan-500 border border-cyan-500/30 text-cyan-500 hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
    >
      <i
        class="fa-solid fa-wifi rotate-90 group-hover:animate-pulse transition-transform"
      ></i>
      WRITE NFC
    </button>

    <!-- Overlay during write (optional, visual feedback) -->
    <div
      v-if="isWriting"
      class="fixed inset-0 bg-black/80 z-[60] flex flex-col items-center justify-center animate-fade-in"
    >
      <div class="text-cyan-500 text-6xl animate-ping mb-8">
        <i class="fa-solid fa-wifi rotate-90"></i>
      </div>
      <p class="text-white font-mono text-xl animate-pulse">APPROACH TAG...</p>
      <p class="text-gray-500 text-sm mt-2">Hold device near NFC sticker</p>
      <button
        @click="isWriting = false"
        class="mt-8 px-6 py-2 border border-white/20 rounded-lg text-white/50 hover:text-white text-sm"
      >
        Cancel
      </button>
    </div>
  </div>
</template>
