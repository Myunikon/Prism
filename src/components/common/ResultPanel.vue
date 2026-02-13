<script setup>
import { computed, ref, watch } from "vue";
import { store } from "../../store/state.js";
import { useCase } from "../../composables/useCase.js";
import { analyzeQRIS } from "../../utils/qris.js";
import {
  analyzeHeuristics,
  calculateEntropy,
  parseUrlDetails,
} from "../../utils/forensics.js";
import { checkUrlWithVT } from "../../utils/network.js";
import { parseQRProtocol } from "../../utils/protocols.js";
import {
  resultPanelStrings,
  typeExplanations,
} from "../../i18n/resultPanel.js";

// Sub-components
import ResultSummary from "../result/ResultSummary.vue";
import ResultDetails from "../result/ResultDetails.vue";
import ResultVirusTotal from "../result/ResultVirusTotal.vue";
import ResultRawData from "../result/ResultRawData.vue";

const props = defineProps({
  data: { type: String, required: true },
  source: { type: String, default: "scan" },
});

const isDark = computed(() => store.config.darkMode);
const lang = computed(() => store.config.language);

// Translations for user-friendly display
const t = computed(
  () => resultPanelStrings[lang.value] || resultPanelStrings.en
);

const activeTab = ref("summary");
const analysis = ref(null);
const vtResult = ref(null);
const isLoadingVT = ref(false);
const { addCaseItem } = useCase();
const isAdded = ref(false);
const isDuplicate = ref(false);

const handleAddToCase = async () => {
  // Capture the full analysis object (heuristics, qris, url details, etc.)
  // We explicitly spread analysis.value to save all derived data
  const fullMetadata = {
    ...analysis.value,
    timestamp: new Date().toISOString(),
    addedFrom: props.source,
  };

  const result = await addCaseItem({
    type: analysis.value.type,
    content: props.data,
    metadata: fullMetadata,
  });

  if (!result) {
    // Duplicate detected
    isDuplicate.value = true;
    setTimeout(() => {
      isDuplicate.value = false;
    }, 2000);
    return;
  }

  isAdded.value = true;
  setTimeout(() => {
    isAdded.value = false;
  }, 2000);
};

// Type explanations imported from i18n/resultPanel.js

const analyzeData = () => {
  const raw = props.data;
  let type = "TEXT";
  let qrisData = null;
  let urlData = null;
  let protocolData = null;

  // QRIS Check
  if (raw.startsWith("000201")) {
    qrisData = analyzeQRIS(raw);
    if (qrisData.isQRIS) type = "QRIS";
  }

  // URL Check
  if (type === "TEXT") {
    try {
      const u = new URL(raw);
      if (["http:", "https:", "ftp:", "mailto:"].includes(u.protocol)) {
        type = "URL";
        urlData = parseUrlDetails(raw);
      }
    } catch (e) {}
  }

  // Protocol Check
  if (type === "TEXT") {
    protocolData = parseQRProtocol(raw);
    if (protocolData.type !== "TEXT") {
      type = protocolData.type;
    }
  }

  const heuristics = analyzeHeuristics(raw);
  const entropy = calculateEntropy(raw);
  const size = new Blob([raw]).size;

  let metadata = null;
  if (
    store.lastResult &&
    store.lastResult.text === raw &&
    store.lastResult.metadata
  ) {
    metadata = store.lastResult.metadata;
  }

  analysis.value = {
    type,
    qris: qrisData,
    url: urlData,
    protocol: protocolData,
    heuristics,
    entropy,
    size,
    metadata,
  };
};

watch(() => props.data, analyzeData, { immediate: true });

const startVTScan = async () => {
  if (analysis.value.type !== "URL") return;
  isLoadingVT.value = true;
  activeTab.value = "vt";
  try {
    const res = await checkUrlWithVT(props.data);
    vtResult.value = res;
  } catch (e) {
    vtResult.value = { error: e.message };
  } finally {
    isLoadingVT.value = false;
  }
};

const getThreatLevel = (score) => {
  if (score > 5)
    return {
      level: "danger",
      label: t.value.highRisk,
      explain: t.value.dangerExplain,
      icon: "fa-shield-xmark",
      gradient: "from-red-500 to-pink-500",
    };
  if (score > 0)
    return {
      level: "warning",
      label: t.value.suspicious,
      explain: t.value.suspiciousExplain,
      icon: "fa-triangle-exclamation",
      gradient: "from-orange-500 to-amber-500",
    };
  return {
    level: "safe",
    label: t.value.safe,
    explain: t.value.safeExplain,
    icon: "fa-shield-check",
    gradient: "from-green-500 to-emerald-500",
  };
};

const threat = computed(() =>
  analysis.value ? getThreatLevel(analysis.value.heuristics.score) : null
);
const typeExplain = computed(() => {
  if (!analysis.value) return "";
  const exps = typeExplanations[lang.value] || typeExplanations.en;
  return exps[analysis.value.type] || exps.TEXT;
});

const copyToClipboard = () => {
  navigator.clipboard.writeText(props.data);
};
</script>

<template>
  <div
    v-if="analysis"
    :class="[
      'rounded-2xl shadow-lg overflow-hidden border',
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100',
    ]"
  >
    <!-- Header with clear threat indicator -->
    <div :class="['p-5', `bg-gradient-to-r ${threat.gradient}`]">
      <div class="flex items-center gap-4">
        <div
          class="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center"
        >
          <Icon :name="threat.icon" class="text-2xl text-white" />
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span
              class="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-lg"
            >
              {{ analysis.type }}
            </span>
            <span
              v-if="analysis.metadata?.result?.format"
              class="px-2 py-0.5 bg-white/10 text-white/80 text-xs rounded-lg"
            >
              {{ analysis.metadata.result.format.formatName }}
            </span>
          </div>
          <h2 class="text-lg font-bold text-white">{{ threat.label }}</h2>
          <p class="text-sm text-white/80">{{ threat.explain }}</p>
        </div>

        <!-- Add to Case Button -->
        <button
          @click="handleAddToCase"
          :disabled="isAdded"
          class="flex flex-col items-center justify-center w-14 h-14 bg-white/20 hover:bg-white/30 backdrop-blur rounded-2xl transition-all cursor-pointer text-white"
        >
          <Icon
            :name="
              isAdded
                ? 'fa-check'
                : isDuplicate
                ? 'fa-triangle-exclamation'
                : 'fa-folder-plus'
            "
            class="text-xl"
            :class="isDuplicate ? 'text-yellow-300' : ''"
          />
          <span class="text-[10px] font-bold mt-1">{{
            isAdded ? t.saved : isDuplicate ? t.exists : t.save
          }}</span>
        </button>
      </div>
    </div>

    <!-- Simple explanation for non-tech users -->
    <div
      :class="[
        'px-5 py-3 border-b flex items-center gap-3',
        isDark
          ? 'bg-gray-700/50 border-gray-700'
          : 'bg-gray-50 border-gray-100',
      ]"
    >
      <Icon name="fa-lightbulb" class="text-yellow-500" />
      <p class="text-sm" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
        <strong>{{ t.whatIsThis }}</strong> {{ typeExplain }}
      </p>
    </div>

    <!-- Tabs -->
    <div
      :class="['flex border-b', isDark ? 'border-gray-700' : 'border-gray-200']"
    >
      <button
        @click="activeTab = 'summary'"
        :class="[
          'flex-1 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2',
          activeTab === 'summary'
            ? 'border-blue-500 text-blue-500'
            : isDark
            ? 'border-transparent text-gray-500 hover:text-gray-300'
            : 'border-transparent text-gray-400 hover:text-gray-600',
        ]"
      >
        <Icon name="fa-list-check" />{{ t.summary }}
      </button>
      <button
        @click="activeTab = 'details'"
        :class="[
          'flex-1 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2',
          activeTab === 'details'
            ? 'border-blue-500 text-blue-500'
            : isDark
            ? 'border-transparent text-gray-500 hover:text-gray-300'
            : 'border-transparent text-gray-400 hover:text-gray-600',
        ]"
      >
        <Icon name="fa-magnifying-glass" />{{ t.details }}
      </button>
      <button
        v-if="analysis.type === 'URL'"
        @click="activeTab = 'vt'"
        :class="[
          'flex-1 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2',
          activeTab === 'vt'
            ? 'border-blue-500 text-blue-500'
            : isDark
            ? 'border-transparent text-gray-500 hover:text-gray-300'
            : 'border-transparent text-gray-400 hover:text-gray-600',
        ]"
      >
        <Icon name="fa-virus-slash" />{{ t.virusTotal }}
      </button>
      <button
        @click="activeTab = 'raw'"
        :class="[
          'flex-1 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2',
          activeTab === 'raw'
            ? 'border-blue-500 text-blue-500'
            : isDark
            ? 'border-transparent text-gray-500 hover:text-gray-300'
            : 'border-transparent text-gray-400 hover:text-gray-600',
        ]"
      >
        <Icon name="fa-code" />{{ t.raw }}
      </button>
    </div>

    <!-- Body -->
    <div class="p-5">
      <ResultSummary
        v-if="activeTab === 'summary'"
        :analysis="analysis"
        :data="data"
        :t="t"
        :isDark="isDark"
        @scanVt="startVTScan"
      />

      <ResultDetails
        v-if="activeTab === 'details'"
        :analysis="analysis"
        :t="t"
        :isDark="isDark"
      />

      <ResultVirusTotal
        v-if="activeTab === 'vt'"
        :vtResult="vtResult"
        :isLoadingVT="isLoadingVT"
        :t="t"
        :isDark="isDark"
        @startScan="startVTScan"
      />

      <ResultRawData
        v-if="activeTab === 'raw'"
        :data="data"
        :t="t"
        :isDark="isDark"
      />
    </div>
  </div>
</template>
