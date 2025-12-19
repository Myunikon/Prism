<script setup>
import { computed, ref, onMounted } from "vue";
import { store } from "../../store/state.js";
import { useCase } from "../../composables/useCase.js";
import ResultPanel from "../common/ResultPanel.vue";
import ConfirmModal from "../common/ConfirmModal.vue";
import Toast from "../common/Toast.vue";
import { logsStrings } from "../../i18n/logs.js";

const isDark = computed(() => store.config.darkMode);
const animationsEnabled = computed(() => store.config.animations !== false);
const logs = computed(() => store.history.slice().reverse());
const {
  caseItems,
  loadCases,
  deleteCaseItem,
  clearCase,
  exportReport,
  isExporting,
} = useCase();
const selectedLog = ref(null);
const activeTab = ref("history"); // 'history' or 'cases'

// Modal and toast state
const showClearConfirm = ref(false);
const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref("success");

const t = computed(() => logsStrings[store.config.language] || logsStrings.en);

onMounted(() => {
  loadCases();
});

const clearLogs = () => {
  showClearConfirm.value = true;
};

const confirmClear = () => {
  if (activeTab.value === "history") {
    store.clearHistory();
  } else {
    clearCase();
  }
  showClearConfirm.value = false;
  showNotification(t.value.cleared, "success");
};

const cancelClear = () => {
  showClearConfirm.value = false;
};

const showNotification = (message, type = "success") => {
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  showNotification(t.value.copied, "success");
};

const formatTime = (ts) => new Date(ts).toLocaleTimeString();
const formatDate = (ts) => new Date(ts).toLocaleDateString();

const selectLog = (log) => {
  selectedLog.value = log;
  store.setScanResult(log.value || log.data, log.metadata);
};

const closeDetail = () => {
  selectedLog.value = null;
};

const getTypeIcon = (type) => {
  const icons = {
    SCAN: "fa-camera",
    FILE_SCAN: "fa-file-image",
    FILE_ANALYZE: "fa-file-lines",
  };
  return icons[type] || "fa-qrcode";
};

const getTypeColor = (type) => {
  const colors = {
    SCAN: "text-blue-500 bg-blue-500/10",
    FILE_SCAN: "text-purple-500 bg-purple-500/10",
    FILE_ANALYZE: "text-green-500 bg-green-500/10",
  };
  return colors[type] || "text-gray-500 bg-gray-500/10";
};
</script>

<template>
  <div
    :class="['flex flex-col gap-4', animationsEnabled ? 'animate-fade-in' : '']"
  >
    <!-- Confirm Modal -->
    <ConfirmModal
      :show="showClearConfirm"
      :title="t.confirmTitle"
      :message="t.confirmMessage"
      :confirmText="t.confirmBtn"
      :cancelText="t.cancel"
      type="danger"
      @confirm="confirmClear"
      @cancel="cancelClear"
    />

    <!-- Toast Notification -->
    <Toast
      :show="showToast"
      :message="toastMessage"
      :type="toastType"
      @close="showToast = false"
    />

    <!-- Detail View (when log selected) -->
    <div
      v-if="selectedLog"
      :class="[
        'flex flex-col gap-4',
        animationsEnabled ? 'animate-slide-up' : '',
      ]"
    >
      <!-- Back button -->
      <div
        :class="[
          'rounded-xl p-4 shadow-sm border flex items-center justify-between',
          isDark
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white/90 backdrop-blur border-gray-100',
        ]"
      >
        <button
          @click="closeDetail"
          :class="[
            'flex items-center gap-2 text-sm font-semibold cursor-pointer min-h-[44px]',
            isDark
              ? 'text-gray-300 hover:text-white'
              : 'text-gray-600 hover:text-gray-800',
          ]"
        >
          <i class="fa-solid fa-arrow-left"></i>{{ t.backTo }}
        </button>
        <div class="flex items-center gap-3">
          <span
            :class="[
              'text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1',
              getTypeColor(selectedLog.type),
            ]"
          >
            <i :class="['fa-solid', getTypeIcon(selectedLog.type)]"></i>
            {{ selectedLog.type }}
          </span>
          <span
            class="text-xs"
            :class="isDark ? 'text-gray-500' : 'text-gray-400'"
          >
            {{ formatDate(selectedLog.timestamp) }}
            {{ formatTime(selectedLog.timestamp) }}
          </span>
        </div>
      </div>

      <!-- Metadata if available -->
      <div
        v-if="selectedLog.metadata"
        :class="[
          'rounded-xl p-4 shadow-sm border',
          isDark
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white/90 border-gray-100',
        ]"
      >
        <div
          class="flex items-center gap-2 text-sm"
          :class="isDark ? 'text-gray-300' : 'text-gray-600'"
        >
          <i class="fa-solid fa-file text-purple-500"></i>
          <span class="font-medium">{{
            selectedLog.metadata.fileName || "Unknown file"
          }}</span>
        </div>
      </div>

      <!-- Full Analysis -->
      <ResultPanel
        :data="selectedLog.value || selectedLog.data"
        source="history"
      />
    </div>

    <!-- List View -->
    <div v-else class="flex flex-col gap-4">
      <!-- Header -->
      <div
        :class="[
          'rounded-2xl p-5 shadow-sm border flex items-center justify-between',
          animationsEnabled ? 'animate-slide-up' : '',
          isDark
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white/90 backdrop-blur border-gray-100',
        ]"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg"
          >
            <i class="fa-solid fa-clock-rotate-left text-white text-xl"></i>
          </div>
          <div>
            <h2
              class="text-lg font-bold"
              :class="isDark ? 'text-white' : 'text-gray-800'"
            >
              {{ t.title }}
            </h2>
            <p
              class="text-sm"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'"
            ></p>
          </div>
        </div>
      </div>

      <!-- Tab Switcher -->
      <div class="px-1">
        <div class="flex p-1 bg-gray-200/50 dark:bg-gray-800 rounded-xl">
          <button
            @click="activeTab = 'history'"
            :class="[
              'flex-1 py-2 text-sm font-semibold rounded-lg transition-all',
              activeTab === 'history'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400',
            ]"
          >
            {{ t.history }}
          </button>
          <button
            @click="activeTab = 'cases'"
            :class="[
              'flex-1 py-2 text-sm font-semibold rounded-lg transition-all',
              activeTab === 'cases'
                ? 'bg-white text-purple-600 shadow-sm dark:bg-gray-700 dark:text-purple-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400',
            ]"
          >
            {{ t.cases }}
          </button>
        </div>
      </div>

      <!-- Action Bar (Clear/Export) -->
      <div class="flex items-center justify-between px-1">
        <p
          class="text-xs font-medium"
          :class="isDark ? 'text-gray-500' : 'text-gray-400'"
        >
          {{ activeTab === "history" ? logs.length : caseItems.length }}
          {{ t.items }}
        </p>
        <div class="flex gap-2">
          <button
            v-if="activeTab === 'cases' && caseItems.length"
            @click="exportReport"
            :disabled="isExporting"
            :class="[
              'px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2',
              isExporting ? 'opacity-50 cursor-not-allowed' : '',
            ]"
          >
            <i
              class="fa-solid"
              :class="
                isExporting ? 'fa-spinner animate-spin' : 'fa-file-export'
              "
            ></i>
            {{ isExporting ? t.exporting : t.export }}
          </button>
          <button
            v-if="
              (activeTab === 'history' && logs.length) ||
              (activeTab === 'cases' && caseItems.length)
            "
            @click="clearLogs"
            :class="[
              'px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center gap-2',
            ]"
          >
            <i class="fa-solid fa-trash-can"></i>{{ t.clear }}
          </button>
        </div>
      </div>

      <!-- History List -->
      <div v-if="activeTab === 'history'" class="space-y-2">
        <div
          v-if="logs.length === 0"
          class="flex flex-col items-center justify-center h-full text-center py-12"
        >
          <div
            class="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
            :class="isDark ? 'bg-gray-700' : 'bg-gray-100'"
          >
            <i
              class="fa-solid fa-inbox text-4xl"
              :class="isDark ? 'text-gray-500' : 'text-gray-300'"
            ></i>
          </div>
          <p
            class="font-medium"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          >
            {{ t.empty }}
          </p>
          <p
            class="text-sm"
            :class="isDark ? 'text-gray-500' : 'text-gray-400'"
          >
            {{ t.emptyHint }}
          </p>
        </div>

        <button
          v-for="(log, idx) in logs"
          :key="idx"
          @click="selectLog(log)"
          :class="[
            'w-full text-left rounded-xl p-4 shadow-sm border cursor-pointer group',
            animationsEnabled
              ? 'transition-all duration-200 hover:shadow-md hover:scale-[1.01]'
              : '',
            isDark
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              : 'bg-white/90 backdrop-blur border-gray-100 hover:bg-gray-50',
          ]"
          :style="animationsEnabled ? { animationDelay: `${idx * 50}ms` } : {}"
        >
          <div class="flex justify-between items-start mb-2">
            <span
              :class="[
                'text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1',
                getTypeColor(log.type),
              ]"
            >
              <i :class="['fa-solid', getTypeIcon(log.type)]"></i>
              {{ log.type }}
            </span>
            <span
              class="text-xs"
              :class="isDark ? 'text-gray-500' : 'text-gray-400'"
              >{{ formatTime(log.timestamp) }}</span
            >
          </div>

          <!-- File name if available -->
          <p
            v-if="log.metadata?.fileName"
            class="text-xs mb-1 flex items-center gap-1"
            :class="isDark ? 'text-gray-500' : 'text-gray-400'"
          >
            <i class="fa-solid fa-file"></i>{{ log.metadata.fileName }}
          </p>

          <p
            class="text-sm font-mono break-all line-clamp-2"
            :class="isDark ? 'text-gray-300' : 'text-gray-700'"
          >
            {{ log.value || log.data }}
          </p>

          <div
            class="flex items-center justify-between mt-3 pt-3 border-t"
            :class="isDark ? 'border-gray-700' : 'border-gray-200'"
          >
            <span
              :class="[
                'text-xs text-blue-500 font-medium',
                animationsEnabled
                  ? 'opacity-0 group-hover:opacity-100 transition-opacity'
                  : '',
              ]"
            >
              <i class="fa-solid fa-arrow-right mr-1"></i>{{ t.viewFull }}
            </span>
            <button
              @click.stop="copyToClipboard(log.value || log.data)"
              :class="[
                'text-xs font-medium px-2 py-1 rounded-lg min-h-[32px]',
                animationsEnabled ? 'transition-colors' : '',
                isDark
                  ? 'text-gray-400 hover:bg-gray-700'
                  : 'text-gray-500 hover:bg-gray-100',
              ]"
            >
              <i class="fa-regular fa-copy mr-1"></i>{{ t.copy }}
            </button>
          </div>
        </button>
      </div>

      <!-- Cases List -->
      <div v-if="activeTab === 'cases'" class="space-y-2">
        <div
          v-if="caseItems.length === 0"
          class="flex flex-col items-center justify-center h-full text-center py-12"
        >
          <!-- Empty State for Cases -->
          <div
            class="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
            :class="isDark ? 'bg-gray-700' : 'bg-gray-100'"
          >
            <i
              class="fa-solid fa-briefcase text-4xl"
              :class="isDark ? 'text-gray-500' : 'text-gray-300'"
            ></i>
          </div>
          <p
            class="font-medium"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          >
            {{ t.emptyCases }}
          </p>
          <p
            class="text-sm"
            :class="isDark ? 'text-gray-500' : 'text-gray-400'"
          >
            {{ t.emptyCasesHint }}
          </p>
        </div>

        <button
          v-for="(item, idx) in caseItems"
          :key="item.id"
          @click="
            selectLog({
              value: item.content,
              type: item.type,
              metadata: item.metadata,
              timestamp: item.timestamp,
            })
          "
          :class="[
            'w-full text-left rounded-xl p-4 shadow-sm border cursor-pointer group relative',
            animationsEnabled
              ? 'transition-all duration-200 hover:shadow-md hover:scale-[1.01]'
              : '',
            isDark
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              : 'bg-white/90 backdrop-blur border-gray-100 hover:bg-gray-50',
          ]"
        >
          <!-- Delete Single Item Button -->
          <div
            @click.stop="deleteCaseItem(item.id)"
            class="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1 z-10"
          >
            <i class="fa-solid fa-xmark"></i>
          </div>

          <div class="flex justify-between items-start mb-2 pr-6">
            <span
              :class="[
                'text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1',
                getTypeColor(item.type),
              ]"
            >
              <i :class="['fa-solid', getTypeIcon(item.type)]"></i
              >{{ item.type }}
            </span>
            <span
              class="text-xs"
              :class="isDark ? 'text-gray-500' : 'text-gray-400'"
              >{{ formatTime(item.timestamp) }}</span
            >
          </div>
          <p
            v-if="item.metadata?.fileName"
            class="text-xs mb-1 flex items-center gap-1"
            :class="isDark ? 'text-gray-500' : 'text-gray-400'"
          >
            <i class="fa-solid fa-file"></i>{{ item.metadata.fileName }}
          </p>
          <p
            class="text-sm font-mono break-all line-clamp-2"
            :class="isDark ? 'text-gray-300' : 'text-gray-700'"
          >
            {{ item.content }}
          </p>
        </button>
      </div>
    </div>
  </div>
</template>
