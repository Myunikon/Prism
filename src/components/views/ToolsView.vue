<script setup>
import { ref, computed } from "vue";
import { store } from "../../store/state.js";
import { useTools } from "../../composables/useTools.js";

const isDark = computed(() => store.config.darkMode);
const animationsEnabled = computed(() => store.config.animations !== false);
const input = ref("");
const output = ref("");
const activeTool = ref(null);

const { tools, runTool: executeTool } = useTools();

const runTool = async (toolId) => {
  activeTool.value = toolId;
  output.value = await executeTool(toolId, input.value);
};

const autoDetect = async () => {
  if (!input.value) return;
  const s = input.value.trim();

  // Heuristics
  if (/^[A-Za-z0-9+/=]+$/.test(s) && s.length % 4 === 0) {
    // Likely Base64
    activeCategory.value = "decode";
    await runTool("b64_decode");
  } else if (s.includes("%") && !s.includes(" ")) {
    // Likely URL Encoded
    activeCategory.value = "decode";
    await runTool("url_decode");
  } else if (/^\d{10}$/.test(s) || /^\d{13}$/.test(s)) {
    // Likely Unix Timestamp
    activeCategory.value = "util";
    await runTool("time_multi");
  } else if (s.startsWith("http")) {
    // Likely URL -> Defang?
    activeCategory.value = "security";
    await runTool("defang_url");
  } else {
    // Default to Base64 (try)
    activeCategory.value = "decode";
    await runTool("b64_decode");
  }
};

const strings = {
  en: {
    input: "Input",
    output: "Output",
    chars: "chars",
    magicWand: "Auto-detect & Decode",
    pasteHere: "Paste text here...",
    resultHere: "Result will appear here...",
    copy: "Copy",
    useAsInput: "Use as Input",
    cat_decode: "Decode",
    cat_encode: "Encode",
    cat_cipher: "Cipher",
    cat_security: "Security",
    cat_osint: "OSINT",
    cat_network: "Network",
    cat_hash: "Hash",
    cat_extract: "Extract",
    cat_format: "Format",
    cat_util: "Utils",
  },
  id: {
    input: "Masukan",
    output: "Keluaran",
    chars: "karakter",
    magicWand: "Deteksi & Decode Otomatis",
    pasteHere: "Tempel teks di sini...",
    resultHere: "Hasil akan muncul di sini...",
    copy: "Salin",
    useAsInput: "Gunakan sebagai Input",
    cat_decode: "Dekode",
    cat_encode: "Enkode",
    cat_cipher: "Sandi",
    cat_security: "Keamanan",
    cat_osint: "OSINT",
    cat_network: "Jaringan",
    cat_hash: "Hash",
    cat_extract: "Ekstrak",
    cat_format: "Format",
    cat_util: "Utilitas",
  },
};

const t = computed(() => strings[store.config.language] || strings.en);

const categories = [
  { id: "decode", icon: "fa-unlock" },
  { id: "encode", icon: "fa-lock" },
  { id: "cipher", icon: "fa-mask" },
  { id: "security", icon: "fa-shield-virus" },
  { id: "osint", icon: "fa-user-secret" },
  { id: "network", icon: "fa-network-wired" },
  { id: "hash", icon: "fa-fingerprint" },
  { id: "extract", icon: "fa-filter" },
  { id: "format", icon: "fa-code" },
  { id: "util", icon: "fa-screwdriver-wrench" },
];

const activeCategory = ref("decode");
const filteredTools = computed(() =>
  tools.filter((t) => t.category === activeCategory.value)
);
</script>

<template>
  <div
    :class="[
      'min-h-full flex flex-col gap-4 pb-20',
      animationsEnabled ? 'animate-fade-in' : '',
    ]"
  >
    <!-- Input -->
    <div
      :class="[
        'rounded-2xl p-5 shadow-sm border flex-shrink-0 relative',
        animationsEnabled ? 'animate-slide-down' : '',
        isDark
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white/90 backdrop-blur border-gray-100',
      ]"
    >
      <div class="flex items-center gap-2 mb-3">
        <i class="fa-solid fa-keyboard text-orange-500 text-lg"></i>
        <label
          class="text-sm font-bold"
          :class="isDark ? 'text-white' : 'text-gray-800'"
          >{{ t.input }}</label
        >
        <div class="ml-auto flex items-center gap-3">
          <span
            class="text-xs"
            :class="isDark ? 'text-gray-500' : 'text-gray-400'"
            >{{ input.length }} {{ t.chars }}</span
          >
          <button
            @click="autoDetect"
            :class="[
              'p-1.5 rounded-lg transition-all hover:scale-110 shadow-sm border',
              isDark
                ? 'bg-gray-700 border-gray-600 text-yellow-400 hover:bg-gray-600'
                : 'bg-white border-gray-200 text-yellow-500 hover:bg-gray-50',
            ]"
            :title="t.magicWand"
          >
            <i class="fa-solid fa-wand-magic-sparkles text-xs"></i>
          </button>
        </div>
      </div>
      <textarea
        v-model="input"
        rows="4"
        :class="[
          'w-full border rounded-xl p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none',
          isDark
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
            : 'bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400',
        ]"
        :placeholder="t.pasteHere"
      ></textarea>
    </div>

    <!-- Category Tabs -->
    <div class="flex gap-1 overflow-x-auto pb-1 flex-shrink-0 min-h-[40px]">
      <button
        v-for="cat in categories"
        :key="cat.id"
        @click="activeCategory = cat.id"
        :class="[
          'px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
          activeCategory === cat.id
            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
            : isDark
            ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        ]"
      >
        <i :class="['fa-solid', cat.icon]"></i>{{ t["cat_" + cat.id] }}
      </button>
    </div>

    <!-- Tools Grid -->
    <div
      :class="[
        'rounded-2xl p-4 shadow-sm border',
        isDark
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white/90 backdrop-blur border-gray-100',
      ]"
    >
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          v-for="tool in filteredTools"
          :key="tool.id"
          @click="runTool(tool.id)"
          :class="[
            'px-2 py-3 text-xs md:text-sm font-semibold rounded-xl transition-all cursor-pointer flex flex-col md:flex-row items-center justify-center gap-2 text-center h-full',
            activeTool === tool.id
              ? 'bg-gradient-to-r ' +
                tool.color +
                ' text-white shadow-lg scale-105'
              : isDark
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          ]"
        >
          <i :class="['fa-solid text-sm md:text-base', tool.icon]"></i>
          <span class="break-words w-full">{{ tool.name }}</span>
        </button>
      </div>
    </div>

    <!-- Output -->
    <div
      :class="[
        'rounded-2xl p-5 shadow-sm border flex-1 flex flex-col',
        isDark
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white/90 backdrop-blur border-gray-100',
      ]"
    >
      <div class="flex items-center gap-2 mb-3">
        <i class="fa-solid fa-terminal text-green-500 text-lg"></i>
        <label
          class="text-sm font-bold"
          :class="isDark ? 'text-white' : 'text-gray-800'"
          >{{ t.output }}</label
        >
        <span
          v-if="activeTool"
          class="text-xs ml-auto px-2 py-0.5 rounded-lg"
          :class="
            isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
          "
        >
          {{ tools.find((t) => t.id === activeTool)?.name }}
        </span>
      </div>
      <textarea
        v-model="output"
        readonly
        :class="[
          'flex-1 min-h-[120px] border rounded-xl p-4 text-sm font-mono resize-none',
          isDark
            ? 'bg-gray-700 border-gray-600 text-white'
            : 'bg-gray-50 border-gray-200 text-gray-700',
        ]"
        :placeholder="t.resultHere"
      ></textarea>
      <div class="flex gap-2 mt-3">
        <button
          v-if="output"
          @click="navigator.clipboard.writeText(output)"
          class="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <i class="fa-regular fa-copy"></i>{{ t.copy }}
        </button>
        <button
          v-if="output"
          @click="
            input = output;
            output = '';
            activeTool = null;
          "
          :class="[
            'py-2.5 px-4 text-sm font-medium rounded-xl transition-colors cursor-pointer',
            isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600',
          ]"
        >
          <i class="fa-solid fa-arrow-up"></i> {{ t.useAsInput }}
        </button>
      </div>
    </div>
  </div>
</template>
