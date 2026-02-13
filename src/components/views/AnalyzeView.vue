<script setup>
import { computed, ref, watch, nextTick } from "vue";
import { store } from "../../store/state.js";
import ResultPanel from "../common/ResultPanel.vue";
import { performELA } from "../../utils/ela.js";
import { performLSBAnalysis } from "../../utils/stego.js";
import { calculateHash } from "../../utils/forensics.js";
import { extractExif } from "../../utils/exif.js";
import { extractImageMeta } from "../../utils/imageMeta.js";
import { Html5Qrcode } from "html5-qrcode";
import ExifDataPanel from "../analyze/ExifDataPanel.vue";
import AnalyzeUpload from "../analyze/AnalyzeUpload.vue";
// Tesseract and Leaflet are loaded dynamically when needed
let L = null;
import { analyzeStrings } from "../../i18n/analyze.js";

const isDark = computed(() => store.config.darkMode);
const animationsEnabled = computed(() => store.config.animations !== false);
const isDragging = ref(false);
const fileData = ref(null);
const fileInfo = ref(null);
const previewUrl = ref(null);
const elaUrl = ref(null);
const fileHash = ref(null);
const isProcessing = ref(false);
const imageMeta = ref(null);
const exifData = ref(null);
const lsbUrl = ref(null);
const ocrText = ref(null);
const isOcrLoading = ref(false);
const mapContainer = ref(null);
let mapInstance = null;

const onDrop = async (e) => {
  isDragging.value = false;
  const file = e.dataTransfer.files[0];
  if (file) await processFile(file);
};

const onFileSelect = async (e) => {
  const file = e.target.files[0];
  if (file) await processFile(file);
};

const processFile = async (file) => {
  isProcessing.value = true;
  fileInfo.value = {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: new Date(file.lastModified).toLocaleString(),
  };

  try {
    fileHash.value = await calculateHash(file);
  } catch (e) {
    fileHash.value = "Error calculating hash";
  }

  if (file.type.startsWith("image/")) {
    previewUrl.value = URL.createObjectURL(file);

    // Extract image metadata
    imageMeta.value = await extractImageMeta(file);

    // Extract EXIF data
    try {
      exifData.value = await extractExif(file);
    } catch (e) {
      console.log("EXIF extraction failed", e);
      exifData.value = null;
    }

    try {
      elaUrl.value = await performELA(file);
    } catch (e) {
      console.error("ELA Error", e);
    }

    try {
      const html5QrCode = new Html5Qrcode("reader-hidden");
      const result = await html5QrCode.scanFileV2(file, true);
      fileData.value = result.decodedText;
      if (result) {
        store.setScanResult(result.decodedText, result);
        store.addHistory("FILE_SCAN", result.decodedText, {
          fileName: file.name,
        });
      }
    } catch (err) {
      // Expected if image has no QR code
      console.info("Info: No QR/Barcode detected in image (Forensics only).");
      fileData.value = "FORENSIC_ONLY";
    }
  } else {
    previewUrl.value = null;
    elaUrl.value = null;
    imageMeta.value = null;
    exifData.value = null;
    const text = await file.text();
    fileData.value = text;
    store.addHistory("FILE_ANALYZE", text.substring(0, 100), {
      fileName: file.name,
    });
  }
  isProcessing.value = false;
};

const resetAnalysis = () => {
  fileData.value = null;
  fileInfo.value = null;
  previewUrl.value = null;
  elaUrl.value = null;
  fileHash.value = null;
  imageMeta.value = null;
  imageMeta.value = null;
  exifData.value = null;
  lsbUrl.value = null;
  ocrText.value = null;
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
};

const runLSB = async () => {
  if (!previewUrl.value) return;
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = previewUrl.value;
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const lsbData = performLSBAnalysis(imageData);
    ctx.putImageData(lsbData, 0, 0);
    lsbUrl.value = canvas.toDataURL();
  };
};

const preprocessImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      // Get raw data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Convert to Grayscale & Binarize (Thresholding)
      // Threshold level: 128 is standard, but adjustable.
      // Using a simple luminance formula: 0.299R + 0.587G + 0.114B
      for (let i = 0; i < data.length; i += 4) {
        const grayscale =
          data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;

        // Simple binarization: if > 128 white, else black
        // This makes text sharp black on white background
        const val = grayscale > 128 ? 255 : 0;

        data[i] = val; // R
        data[i + 1] = val; // G
        data[i + 2] = val; // B
        // Alpha (i+3) stays same
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
  });
};

const runOCR = async () => {
  if (!previewUrl.value) return;
  isOcrLoading.value = true;
  ocrText.value = null;

  try {
    // Stage 1: Pre-process image for high contrast
    const processedImage = await preprocessImage(previewUrl.value);

    // Stage 2: Recognize with multiple languages just in case
    // Using 'eng+ind' if possible or just 'eng' then 'ind'
    // For now we stick to 'eng' but pre-processing changes everything.
    // Dynamically load tesseract.js only when OCR is requested
    const Tesseract = (await import("tesseract.js")).default;
    const result = await Tesseract.recognize(processedImage, "eng", {
      logger: (m) => console.log(m),
    });

    ocrText.value = result.data.text.trim();

    if (result.data.text.length < 5) {
      ocrText.value += "\n\n(Low confidence result - try a cleared image)";
    }
  } catch (e) {
    ocrText.value = t.value.ocrFailed + e.message;
    console.error(e);
  } finally {
    isOcrLoading.value = false;
  }
};

const initMap = async () => {
  if (!exifData.value || !exifData.value.gps || !mapContainer.value) return;

  const lat = parseFloat(exifData.value.gps.lat);
  const lon = parseFloat(exifData.value.gps.lon);

  if (lat && lon) {
    if (mapInstance) mapInstance.remove();

    // Dynamically load Leaflet only when map is needed
    if (!L) {
      await import("leaflet/dist/leaflet.css");
      L = (await import("leaflet")).default;
    }

    mapInstance = L.map(mapContainer.value).setView([lat, lon], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapInstance);
    L.marker([lat, lon])
      .addTo(mapInstance)
      .bindPopup(`Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}`)
      .openPopup();
  }
};

// Watch for passed image from Scanner
watch(
  () => store.previewImage,
  async (newVal) => {
    if (newVal && !fileData.value) {
      // Convert base64 to File object
      const res = await fetch(newVal);
      const blob = await res.blob();
      const file = new File([blob], "captured_scan.png", { type: "image/png" });
      store.setPreviewImage(null); // Clear it
      await processFile(file);
    }
  },
  { immediate: true }
);


// Watch for exif data to init map
watch(exifData, async (newVal) => {
  if (newVal && newVal.gps) {
    await nextTick();
    initMap();
  }
});

const t = computed(
  () => analyzeStrings[store.config.language] || analyzeStrings.en
);
</script>

<template>
  <div
    :class="[
      'space-y-4 pb-20 min-h-full flex flex-col',
      animationsEnabled ? 'animate-fade-in' : '',
    ]"
  >
    <!-- Hidden Reader -->
    <div id="reader-hidden" class="absolute top-[-9999px] left-[-9999px]"></div>

    <!-- Upload State -->
    <AnalyzeUpload
      v-if="!fileData"
      :is-dragging="isDragging"
      :is-dark="isDark"
      :t="t"
      @update:is-dragging="isDragging = $event"
      @drop="onDrop"
      @file-select="onFileSelect"
    />

    <!-- Analysis State -->
    <div v-else class="space-y-4">
      <!-- File Header -->
      <div
        :class="[
          'rounded-2xl p-4 shadow-sm border flex items-center justify-between',
          isDark
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white/90 backdrop-blur border-gray-100',
        ]"
      >
        <div class="flex items-center gap-3 min-w-0 pr-2">
          <div
            class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md flex-shrink-0"
          >
            <Icon name="fa-file" class="text-white text-lg" />
          </div>
          <div class="min-w-0 flex-1">
            <h4
              class="text-sm font-bold truncate"
              :class="isDark ? 'text-white' : 'text-gray-800'"
              :title="fileInfo?.name"
            >
              {{ fileInfo?.name }}
            </h4>
            <p
              class="text-xs truncate"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'"
            >
              {{ (fileInfo?.size / 1024).toFixed(1) }} KB · {{ fileInfo?.type }}
            </p>
          </div>
        </div>
        <button
          @click="resetAnalysis"
          class="p-2.5 rounded-xl transition-colors cursor-pointer flex-shrink-0"
          :class="
            isDark
              ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30'
              : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
          "
        >
          <Icon name="fa-xmark" class="text-lg" />
        </button>
      </div>

      <!-- Image Forensics Section -->
      <div
        v-if="previewUrl"
        :class="[
          'rounded-2xl p-5 shadow-sm border',
          isDark
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white/90 backdrop-blur border-gray-100',
        ]"
      >
        <h3
          class="text-sm font-bold mb-4 flex items-center gap-2"
          :class="isDark ? 'text-white' : 'text-gray-800'"
        >
          <Icon name="fa-microscope" class="text-purple-500" />
          {{ t.imageForensics }}
        </h3>

        <!-- Image Preview and ELA -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <p
              class="text-xs font-medium mb-2"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'"
            >
              {{ t.original }}
            </p>
            <img
              :src="previewUrl"
              :class="[
                'w-full h-32 sm:h-40 md:h-48 object-contain rounded-xl border',
                isDark
                  ? 'bg-gray-900 border-gray-600'
                  : 'bg-gray-100 border-gray-200',
              ]"
            />
          </div>
          <div>
            <p class="text-xs font-medium mb-2 text-purple-500">
              {{ t.ela }}
            </p>
            <img
              v-if="elaUrl"
              :src="elaUrl"
              class="w-full h-32 sm:h-40 md:h-48 object-contain bg-gray-900 rounded-xl cursor-pointer hover:scale-105 transition-transform"
              @click="store.setPreviewImage(elaUrl)"
            />
            <div
              v-else
              :class="[
                'w-full h-32 sm:h-40 md:h-48 flex items-center justify-center rounded-xl text-sm',
                isDark
                  ? 'bg-gray-700 text-gray-400'
                  : 'bg-gray-100 text-gray-400',
              ]"
            >
              <Icon name="fa-spinner" class="animate-spin mr-2" />
              {{ t.processing }}
            </div>
          </div>
        </div>

        <!-- Advanced Forensics Controls -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <button
            @click="runLSB"
            class="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            <Icon name="fa-layer-group" class="mr-2" />{{ t.stegoCheck }}
          </button>
          <button
            @click="runOCR"
            :disabled="isOcrLoading"
            class="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            <Icon
              :name="isOcrLoading ? 'fa-spinner' : 'fa-font'"
              :class="isOcrLoading ? 'animate-spin' : ''"
            />
            {{ t.extractText }}
          </button>
        </div>

        <!-- LSB & OCR Results -->
        <div
          v-if="lsbUrl || ocrText"
          class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
        >
          <div v-if="lsbUrl">
            <p class="text-xs font-bold mb-2 text-indigo-400">
              {{ t.lsbNoise }}
            </p>
            <img
              :src="lsbUrl"
              class="w-full h-32 sm:h-40 md:h-48 object-contain bg-black rounded-xl border border-indigo-500/30"
            />
          </div>
          <div v-if="ocrText" class="relative">
            <p class="text-xs font-bold mb-2 text-emerald-400">
              {{ t.extractedText }}
            </p>
            <textarea
              readonly
              class="w-full h-32 sm:h-40 md:h-48 bg-gray-900 text-white text-xs p-3 rounded-xl font-mono resize-none border border-emerald-500/30"
              >{{ ocrText }}</textarea
            >
            <button
              @click="navigator.clipboard.writeText(ocrText)"
              class="absolute top-8 right-2 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded text-xs"
            >
              <Icon name="fa-copy" />
            </button>
          </div>
        </div>

        <!-- GPS Map -->
        <div v-if="exifData?.gps" class="mb-4">
          <p class="text-xs font-bold mb-2 text-orange-400">
            <Icon name="fa-map-location-dot" class="mr-2" />{{ t.gpsLocation }}
          </p>
          <div
            ref="mapContainer"
            class="w-full h-48 rounded-xl z-0 border border-gray-600"
          ></div>
        </div>

        <!-- Basic Image Metadata -->
        <div
          :class="[
            'p-4 rounded-xl border mb-4',
            isDark
              ? 'bg-gray-900 border-gray-700'
              : 'bg-gray-50 border-gray-100',
          ]"
        >
          <h4
            class="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          >
            <Icon name="fa-image" class="text-blue-500" />{{ t.imageInfo }}
          </h4>
          <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
            <div
              :class="[
                'p-2 rounded-lg text-center',
                isDark ? 'bg-gray-800' : 'bg-white',
              ]"
            >
              <p
                class="text-[10px] font-medium uppercase"
                :class="isDark ? 'text-gray-500' : 'text-gray-400'"
              >
                {{ t.size }}
              </p>
              <p
                class="text-xs font-bold"
                :class="isDark ? 'text-white' : 'text-gray-800'"
              >
                {{ imageMeta?.width }}×{{ imageMeta?.height }}
              </p>
            </div>
            <div
              :class="[
                'p-2 rounded-lg text-center',
                isDark ? 'bg-gray-800' : 'bg-white',
              ]"
            >
              <p
                class="text-[10px] font-medium uppercase"
                :class="isDark ? 'text-gray-500' : 'text-gray-400'"
              >
                {{ t.mp }}
              </p>
              <p
                class="text-xs font-bold"
                :class="isDark ? 'text-white' : 'text-gray-800'"
              >
                {{ imageMeta?.megapixels }}
              </p>
            </div>
            <div
              :class="[
                'p-2 rounded-lg text-center',
                isDark ? 'bg-gray-800' : 'bg-white',
              ]"
            >
              <p
                class="text-[10px] font-medium uppercase"
                :class="isDark ? 'text-gray-500' : 'text-gray-400'"
              >
                {{ t.ratio }}
              </p>
              <p
                class="text-xs font-bold"
                :class="isDark ? 'text-white' : 'text-gray-800'"
              >
                {{ imageMeta?.aspectRatio }}
              </p>
            </div>
            <div
              :class="[
                'p-2 rounded-lg text-center',
                isDark ? 'bg-gray-800' : 'bg-white',
              ]"
            >
              <p
                class="text-[10px] font-medium uppercase"
                :class="isDark ? 'text-gray-500' : 'text-gray-400'"
              >
                {{ t.orient }}
              </p>
              <p
                class="text-xs font-bold"
                :class="isDark ? 'text-white' : 'text-gray-800'"
              >
                {{ imageMeta?.orientation }}
              </p>
            </div>
            <div
              :class="[
                'p-2 rounded-lg text-center',
                isDark ? 'bg-gray-800' : 'bg-white',
              ]"
            >
              <p
                class="text-[10px] font-medium uppercase"
                :class="isDark ? 'text-gray-500' : 'text-gray-400'"
              >
                {{ t.format }}
              </p>
              <p
                class="text-xs font-bold"
                :class="isDark ? 'text-white' : 'text-gray-800'"
              >
                {{ imageMeta?.mimeType?.split("/")[1]?.toUpperCase() }}
              </p>
            </div>
            <div
              :class="[
                'p-2 rounded-lg text-center',
                isDark ? 'bg-gray-800' : 'bg-white',
              ]"
            >
              <p
                class="text-[10px] font-medium uppercase"
                :class="isDark ? 'text-gray-500' : 'text-gray-400'"
              >
                {{ t.file }}
              </p>
              <p
                class="text-xs font-bold"
                :class="isDark ? 'text-white' : 'text-gray-800'"
              >
                {{ imageMeta?.fileSizeFormatted }}
              </p>
            </div>
          </div>
        </div>

        <!-- EXIF Data (if available) -->
        <ExifDataPanel :exifData="exifData" :isDark="isDark" :t="t" />

        <!-- Hash -->
        <div
          :class="[
            'mt-4 p-3 rounded-xl border',
            isDark
              ? 'bg-gray-900 border-gray-700'
              : 'bg-gray-50 border-gray-100',
          ]"
        >
          <p
            class="text-xs font-medium mb-1 flex items-center gap-1"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          >
            <Icon name="fa-fingerprint" class="text-cyan-500" />{{ t.shaHash }}
          </p>
          <p
            class="text-xs font-mono break-all select-all"
            :class="isDark ? 'text-gray-300' : 'text-gray-700'"
          >
            {{ fileHash || t.calculating }}
          </p>
        </div>

        <!-- QR/Barcode Status -->
        <div
          :class="[
            'mt-4 p-4 rounded-xl flex items-center gap-3',
            fileData && fileData !== 'FORENSIC_ONLY'
              ? isDark
                ? 'bg-green-900/20'
                : 'bg-green-50'
              : isDark
              ? 'bg-gray-700'
              : 'bg-gray-100',
          ]"
        >
          <Icon
            :name="fileData && fileData !== 'FORENSIC_ONLY' ? 'fa-check-circle' : 'fa-qrcode'"
            :class="[
              'text-xl',
              fileData && fileData !== 'FORENSIC_ONLY'
                ? 'text-green-500'
                : 'text-gray-400',
            ]"
          />
          <div>
            <p
              class="text-sm font-medium"
              :class="
                fileData && fileData !== 'FORENSIC_ONLY'
                  ? 'text-green-600'
                  : isDark
                  ? 'text-gray-400'
                  : 'text-gray-500'
              "
            >
              {{
                fileData && fileData !== "FORENSIC_ONLY"
                  ? t.qrDetected
                  : t.noQrFound
              }}
            </p>
            <p
              class="text-xs"
              :class="isDark ? 'text-gray-500' : 'text-gray-400'"
            >
              {{
                fileData && fileData !== "FORENSIC_ONLY"
                  ? t.decodedAvailable
                  : t.onlyImageAnalysis
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- Detection Result -->
      <ResultPanel
        v-if="fileData && fileData !== 'FORENSIC_ONLY'"
        :data="fileData"
        :source="'FILE_SCAN'"
      />
    </div>
  </div>
</template>
