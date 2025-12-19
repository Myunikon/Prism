<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { Html5Qrcode } from "html5-qrcode";
import { store } from "../../store/state.js";
import ResultPanel from "../common/ResultPanel.vue";
import { scannerStrings } from "../../i18n/scanner.js";

const isDark = computed(() => store.config.darkMode);
const animationsEnabled = computed(() => store.config.animations !== false);
const isScanning = ref(false);
const scanResult = ref(null);
const errorMsg = ref(null);
const facingMode = ref(store.config.facingMode || "environment");
const cameras = ref([]);
let html5QrcodeScanner = null;

const loadCameras = async () => {
  try {
    cameras.value = await Html5Qrcode.getCameras();
  } catch (err) {
    console.warn("Error getting cameras", err);
  }
};

// Guard to preventing race conditions
const shouldScan = ref(false);

const startScanner = async () => {
  // 1. Set intent
  if (store.currentTab !== "cam") return;
  shouldScan.value = true;
  errorMsg.value = null;
  scanResult.value = null;

  // 2. Wait for UI
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 3. Check intent again after delay
  if (!shouldScan.value || store.currentTab !== "cam") return;

  const readerElement = document.getElementById("reader");
  if (!readerElement) {
    errorMsg.value = "scannerError";
    return;
  }

  try {
    // Determine config
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    const cameraId = store.config.cameraId;
    const cameraConfig = cameraId
      ? { deviceId: { exact: cameraId } }
      : { facingMode: facingMode.value };

    // 4. Create instance if needed
    if (!html5QrcodeScanner) {
      // Ensure verbose is off
      html5QrcodeScanner = new Html5Qrcode("reader", false);
    }

    // 5. Start only if still valid
    if (!shouldScan.value) return;

    await html5QrcodeScanner.start(
      cameraConfig,
      { fps: 10 },
      onScanSuccess,
      onScanFailure
    );

    // 6. Final check
    if (!shouldScan.value) {
      await stopScanner();
      return;
    }

    isScanning.value = true;
    store.isScanning = true;
  } catch (err) {
    // Ignore errors if we decided to stop or switched tabs
    if (!shouldScan.value) return;

    // Handle AbortError specifically (harmless interruption)
    if (err.name === "AbortError") return;

    errorMsg.value = "cameraError";
    console.error(err);
  }
};

const stopScanner = async () => {
  shouldScan.value = false; // Immediate guard

  if (!html5QrcodeScanner) {
    isScanning.value = false;
    store.isScanning = false;
    return;
  }

  try {
    // Robust cleanup sequence
    // Check if state is running/paused (2 or 3)
    let state;
    try {
      state = html5QrcodeScanner.getState();
    } catch (e) {
      state = 0;
    }

    if (state === 2 || state === 3) {
      try {
        await html5QrcodeScanner.stop();
      } catch (err) {
        // Ignore known harmless warnings
        const msg = err.message || "";
        const ignoredErrors = ["removeChild", "transition", "AbortError"];
        if (!ignoredErrors.some((e) => msg.includes(e))) {
          console.warn("Scanner stop warning:", err);
        }
      }
    }

    // Only clear if element still exists
    if (document.getElementById("reader")) {
      try {
        await html5QrcodeScanner.clear();
      } catch (err) {
        // Ignore clear errors
      }
    }
  } catch (err) {
    console.warn("Scanner cleanup high-level error:", err);
  }

  // Always clean up flags
  isScanning.value = false;
  store.isScanning = false;
};

const flipCamera = async () => {
  await stopScanner();
  facingMode.value =
    facingMode.value === "environment" ? "user" : "environment";
  store.setConfig("facingMode", facingMode.value);
  store.setConfig("cameraId", null); // Reset specific camera on flip
  // Force start
  if (store.currentTab === "cam") startScanner();
};

const setCamera = async (event) => {
  const deviceId = event.target.value;
  await stopScanner();
  store.setConfig("cameraId", deviceId);
  if (store.currentTab === "cam") startScanner();
};

const captureFrame = () => {
  const video = document.querySelector("#reader video");
  if (!video) return null;
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
};

const capturedImage = ref(null);

const onScanSuccess = async (decodedText, decodedResult) => {
  if (store.config.vibration && navigator.vibrate) {
    navigator.vibrate(100);
  }

  // Capture the frame immediately
  capturedImage.value = captureFrame();

  // Stop scanner BEFORE updating state that removes the DOM element to prevent cleanup errors
  await stopScanner();

  scanResult.value = decodedText;
  store.addHistory("SCAN", decodedText);
  store.setScanResult(decodedText, decodedResult);
};

const goToAnalyze = () => {
  if (capturedImage.value) {
    store.setPreviewImage(capturedImage.value);
    store.currentTab = "analyze";
  }
};

const onScanFailure = (error) => {};

const resetScan = () => {
  scanResult.value = null;
  capturedImage.value = null;
  startScanner();
};

// Watch for tab changes
watch(
  () => store.currentTab,
  (newTab) => {
    if (newTab === "cam" && !scanResult.value) {
      startScanner();
    } else {
      stopScanner();
    }
  },
  { immediate: false }
);

// Handle Page Visibility (Switching browser tabs/minimizing app)
const handleVisibilityChange = () => {
  if (document.hidden) {
    stopScanner();
  } else if (store.currentTab === "cam" && !scanResult.value) {
    startScanner();
  }
};

onMounted(() => {
  loadCameras();
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Only start if store state is fully restored
  if (store.isLoaded && store.currentTab === "cam") {
    startScanner();
  }
});

// Wait for store to load before starting scanner (prevents flash on wrong tab)
watch(
  () => store.isLoaded,
  (loaded) => {
    if (loaded && store.currentTab === "cam") {
      startScanner();
    }
  }
);

onUnmounted(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  stopScanner();
});

const t = computed(
  () => scannerStrings[store.config.language] || scannerStrings.en
);
</script>

<template>
  <div class="h-full flex flex-col gap-4">
    <!-- Scanner Container - needs height for camera -->
    <div v-if="!scanResult" class="flex-1 flex flex-col min-h-0">
      <!-- Camera View -->
      <div
        class="flex-1 relative rounded-2xl overflow-hidden"
        :class="isDark ? 'bg-black' : 'bg-gray-900'"
      >
        <!-- Video Container -->
        <div id="reader" class="scanner-container"></div>

        <!-- Scan Frame Overlay -->
        <div
          v-if="isScanning && !errorMsg"
          class="absolute inset-0 pointer-events-none flex items-center justify-center"
        >
          <div class="w-64 h-64 md:w-72 md:h-72 relative">
            <!-- Corner brackets -->
            <div
              class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"
            ></div>
            <div
              class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"
            ></div>
            <div
              class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"
            ></div>
            <div
              class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"
            ></div>

            <!-- Scan Line Animation -->
            <div v-if="animationsEnabled" class="scan-line-animation"></div>
          </div>
        </div>

        <!-- Camera Controls -->
        <div class="absolute top-4 right-4 z-10 flex gap-2">
          <!-- Camera Select (Desktop/Multiple Cameras) -->
          <div
            v-if="cameras.length > 0"
            class="relative max-w-[220px] md:max-w-none"
          >
            <select
              :value="store.config.cameraId"
              @change="setCamera"
              class="appearance-none w-full h-11 pl-4 pr-10 bg-black/50 backdrop-blur rounded-full text-white text-xs font-medium focus:outline-none cursor-pointer border border-white/20 truncate"
            >
              <option :value="null">{{ t.defaultCamera }}</option>
              <option v-for="cam in cameras" :key="cam.id" :value="cam.id">
                {{ cam.label || `Camera ${cam.id.substr(0, 5)}` }}
              </option>
            </select>
            <i
              class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-white/70 text-xs pointer-events-none"
            ></i>
          </div>

          <button
            @click="flipCamera"
            class="w-11 h-11 rounded-full bg-black/50 backdrop-blur flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors border border-white/20"
          >
            <i class="fa-solid fa-camera-rotate text-white"></i>
          </button>
        </div>

        <!-- Camera Mode Indicator -->
        <div
          v-if="isScanning && !errorMsg"
          class="absolute bottom-4 left-4 px-3 py-1.5 bg-black/50 backdrop-blur rounded-full z-10"
        >
          <span class="text-xs font-medium text-white">
            <i
              :class="[
                'fa-solid mr-1',
                facingMode === 'environment' ? 'fa-mobile-screen' : 'fa-user',
              ]"
            ></i>
            {{ facingMode === "environment" ? t.back : t.front }}
          </span>
        </div>

        <!-- Error State -->
        <div
          v-if="errorMsg"
          class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20"
          :class="isDark ? 'bg-gray-800' : 'bg-white'"
        >
          <div
            class="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg"
          >
            <i class="fa-solid fa-camera-slash text-white text-3xl"></i>
          </div>
          <p
            class="font-semibold mb-4"
            :class="isDark ? 'text-white' : 'text-gray-800'"
          >
            {{ t[errorMsg] || errorMsg }}
          </p>
          <button
            @click="startScanner"
            class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer"
          >
            <i class="fa-solid fa-rotate-right mr-2"></i>{{ t.tryAgain }}
          </button>
        </div>

        <!-- Scanning Indicator -->
        <div
          v-if="isScanning && !errorMsg"
          class="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-lg rounded-full z-10"
        >
          <div class="flex items-center gap-2 text-sm font-medium text-white">
            <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>{{ t.scanning }}</span>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="py-3 text-center">
        <p
          class="text-sm font-medium"
          :class="isDark ? 'text-gray-400' : 'text-gray-600'"
        >
          <i class="fa-solid fa-qrcode mr-2 text-purple-500"></i>
          {{ t.instruction }}
        </p>
      </div>
    </div>

    <!-- Result View -->
    <div v-else class="flex flex-col gap-4">
      <div
        :class="[
          'rounded-2xl p-4 shadow-sm border flex items-center justify-between flex-shrink-0',
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
        ]"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md"
          >
            <i class="fa-solid fa-check text-white text-xl"></i>
          </div>
          <div>
            <h2
              class="text-base font-bold"
              :class="isDark ? 'text-white' : 'text-gray-800'"
            >
              {{ t.scanComplete }}
            </h2>
            <p
              class="text-xs"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'"
            >
              {{ t.analysisReady }}
            </p>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            v-if="capturedImage"
            @click="goToAnalyze"
            class="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all cursor-pointer"
            :class="isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : ''"
            :title="t.fullAnalysis"
          >
            <i class="fa-solid fa-microscope"></i>
          </button>
          <button
            @click="resetScan"
            class="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer"
          >
            <i class="fa-solid fa-camera mr-2"></i>{{ t.scanAgain }}
          </button>
        </div>
      </div>

      <ResultPanel :data="scanResult" source="scan" />
    </div>
  </div>
</template>

<style scoped>
.scanner-container {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

.scanner-container :deep(video) {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}

.scanner-container :deep(#reader__scan_region) {
  min-height: 100% !important;
  background: transparent !important;
}

.scanner-container :deep(#reader__scan_region > img) {
  display: none !important;
}

.scanner-container :deep(#reader__dashboard),
.scanner-container :deep(#reader__dashboard_section),
.scanner-container :deep(#reader__dashboard_section_swaplink),
.scanner-container :deep(#reader__header_message) {
  display: none !important;
}
</style>
