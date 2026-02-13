<script setup>
import { ref, computed, watch, nextTick } from "vue";
import jsbarcode from "jsbarcode";
import bwipjs from "bwip-js";
import { store } from "../../store/state.js";
import TacticalPayloadForge from "./TacticalPayloadForge.vue";
import NFCWriterButton from "./NFCWriterButton.vue";

const emit = defineEmits(["openWifi"]);

const isDark = computed(() => store.config.darkMode);
const animationsEnabled = computed(() => store.config.animations !== false);

// Barcode state
const barcodePayload = ref("");
const barcodeFormat = ref("CODE128");
const barcodeHeight = ref(80);
const barcodeShowText = ref(true);
const barcodeError = ref(null);
const barcodeGenerated = ref(false);

const barcodeFormats = [
  { id: "CODE128", name: "Code 128", desc: "Any text", validate: () => true },
  {
    id: "EAN13",
    name: "EAN-13",
    desc: "12-13 digits",
    validate: (v) => /^\d{12,13}$/.test(v),
  },
  {
    id: "EAN8",
    name: "EAN-8",
    desc: "7-8 digits",
    validate: (v) => /^\d{7,8}$/.test(v),
  },
  {
    id: "UPC",
    name: "UPC-A",
    desc: "11-12 digits",
    validate: (v) => /^\d{11,12}$/.test(v),
  },
  {
    id: "CODE39",
    name: "Code 39",
    desc: "A-Z, 0-9",
    validate: (v) => /^[A-Z0-9\-. $/+%]+$/i.test(v),
  },
  {
    id: "pdf417",
    name: "PDF417",
    desc: "ID/Travel (2D)",
    validate: () => true,
  },
  {
    id: "datamatrix",
    name: "Data Matrix",
    desc: "Small Items (2D)",
    validate: () => true,
  },
  {
    id: "azteccode",
    name: "Aztec",
    desc: "Transport (2D)",
    validate: () => true,
  },
  {
    id: "ITF14",
    name: "ITF-14",
    desc: "14 digits",
    validate: (v) => /^\d{14}$/.test(v),
  },
  {
    id: "codabar",
    name: "Codabar",
    desc: "0-9, -$:/+.",
    validate: (v) => /^[0-9\-\$\:\/\+\.]+$/.test(v),
  },
  {
    id: "msi",
    name: "MSI",
    desc: "Digits only",
    validate: (v) => /^\d+$/.test(v),
  },
];

const currentFormat = computed(() =>
  barcodeFormats.find((f) => f.id === barcodeFormat.value)
);

const barcodeExamples = {
  CODE128: "ABC-12345",
  EAN13: "5901234123457",
  EAN8: "96385074",
  UPC: "012345678905",
  CODE39: "CODE39",
  ITF14: "10012345678902",
  codabar: "A123456789B",
  msi: "1234567890",
  pdf417: "M1Kenneth V.41400",
  datamatrix: "PRISM-TACTICAL-2025",
  azteccode: "Aztec Code Sample",
};

// Generate Barcode
const generateBarcode = async () => {
  barcodeError.value = null;
  barcodeGenerated.value = false;
  if (!barcodePayload.value) return;

  const format = barcodeFormats.find((f) => f.id === barcodeFormat.value);
  if (format && !format.validate(barcodePayload.value)) {
    barcodeError.value = `Invalid format. ${format.name} requires: ${format.desc}`;
    return;
  }

  await nextTick();
  const canvas = document.getElementById("barcode-canvas");
  if (!canvas) return;

  try {
    const isBwipFormat = ["pdf417", "datamatrix", "azteccode"].includes(
      barcodeFormat.value
    );

    if (isBwipFormat) {
      // Use BWIP-JS for 2D/Complex formats
      bwipjs.toCanvas(canvas, {
        bcid: barcodeFormat.value, // Barcode type
        text: barcodePayload.value, // Text to encode
        scale: 2, // 3x scaling factor
        height: barcodeHeight.value / 4, // Bar height, in millimeters
        incluetext: barcodeShowText.value, // Show human-readable text
        textxalign: "center", // Always good to set this
        backgroundcolor: "ffffff",
      });
      barcodeGenerated.value = true;
    } else {
      // Use JsBarcode for standard 1D
      jsbarcode(canvas, barcodePayload.value, {
        format: barcodeFormat.value,
        width: 2,
        height: barcodeHeight.value,
        displayValue: barcodeShowText.value,
        fontSize: 14,
        margin: 10,
        background: "#ffffff",
        lineColor: "#1d1d1f",
      });
      barcodeGenerated.value = true;
    }
  } catch (err) {
    barcodeError.value = err.message || "Invalid barcode value";
  }
};

watch([barcodeFormat, barcodeHeight, barcodeShowText], () => {
  if (barcodePayload.value) generateBarcode();
});

const fillExample = () => {
  barcodePayload.value = barcodeExamples[barcodeFormat.value] || "";
  generateBarcode();
};

const applyTacticalPayload = (payload) => {
  barcodePayload.value = payload;
  generateBarcode();
};

const setPayload = (val) => {
  barcodePayload.value = val;
  generateBarcode();
};

const resetBarcode = () => {
  barcodePayload.value = "";
  barcodeError.value = null;
  barcodeGenerated.value = false;
};

const downloadBarcode = async (format) => {
  if (!barcodeGenerated.value) return;

  if (format === "svg") {
    // Re-generate as SVG
    try {
      const isBwipFormat = ["pdf417", "datamatrix", "azteccode"].includes(
        barcodeFormat.value
      );
      let svgStr = "";

      if (isBwipFormat) {
        svgStr = await bwipjs.toSVG({
          bcid: barcodeFormat.value,
          text: barcodePayload.value,
          mobile: true, // Generate slightly clearer SVG
          scale: 2,
          height: barcodeHeight.value / 4,
          incluetext: barcodeShowText.value,
          textxalign: "center",
          backgroundcolor: "ffffff",
        });
      } else {
        const div = document.createElement("div");
        const svgNode = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        div.appendChild(svgNode);

        jsbarcode(svgNode, barcodePayload.value, {
          format: barcodeFormat.value,
          width: 2,
          height: barcodeHeight.value,
          displayValue: barcodeShowText.value,
          fontSize: 14,
          margin: 10,
          background: "#ffffff",
          lineColor: "#1d1d1f",
        });
        svgStr = new XMLSerializer().serializeToString(svgNode);
      }

      const blob = new Blob([svgStr], { type: "image/svg+xml" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `barcode_${barcodeFormat.value}_${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }, 100);
    } catch (e) {
      console.error("SVG Export failed", e);
    }
  } else {
    // PNG from Canvas
    const canvas = document.getElementById("barcode-canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `barcode_${barcodeFormat.value}_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    setTimeout(() => document.body.removeChild(link), 100);
  }
};

// Localizations
const strings = {
  en: {
    generatorTitle: "Barcode Generator",
    generatorDesc: "Create standard 1D barcodes",
    format: "Format",
    height: "Height",
    showText: "Show Text",
    example: "Example",
  },
  id: {
    generatorTitle: "Pembuat Barcode",
    generatorDesc: "Buat barcode 1D standar",
    format: "Format",
    height: "Tinggi",
    showText: "Tampilkan Teks",
    example: "Contoh",
  },
};

const t = computed(() => strings[store.config.language] || strings.en);

defineExpose({ setPayload });
</script>

<template>
  <div class="flex flex-col lg:grid lg:grid-cols-3 gap-4">
    <!-- Input (2 columns) -->
    <div class="lg:col-span-2">
      <div
        :class="[
          'rounded-2xl p-5 shadow-sm border',
          animationsEnabled ? 'animate-fade-in' : '',
          isDark
            ? 'bg-gray-800/90 border-gray-700 backdrop-blur'
            : 'bg-white/90 border-gray-100 backdrop-blur',
        ]"
      >
        <div class="flex items-center gap-3 mb-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-500/20"
          >
            <Icon name="fa-barcode" class="text-orange-500" />
          </div>
          <div>
            <h3
              class="font-semibold text-base"
              :class="isDark ? 'text-white' : 'text-gray-800'"
            >
              {{ t.generatorTitle }}
            </h3>
            <p
              class="text-xs"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'"
            >
              {{ t.generatorDesc }}
            </p>
          </div>
        </div>

        <!-- Format Selector -->
        <div class="mb-3">
          <p
            class="text-xs font-semibold mb-2"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          >
            {{ t.format }}
          </p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="f in barcodeFormats"
              :key="f.id"
              @click="barcodeFormat = f.id"
              :class="[
                'px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all',
                barcodeFormat === f.id
                  ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                  : isDark
                  ? 'border-gray-600 text-gray-400 hover:border-gray-500'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300',
              ]"
            >
              {{ f.name }}
            </button>
          </div>
        </div>

        <!-- Barcode Options -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div
            :class="[
              'p-3 rounded-xl border',
              isDark ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50 border-gray-100',
            ]"
          >
            <p
              class="text-xs font-semibold mb-2"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'"
            >
              {{ t.height }} ({{ barcodeHeight }})
            </p>
            <input
              type="range"
              v-model.number="barcodeHeight"
              min="30"
              max="150"
              class="w-full accent-orange-500 cursor-pointer"
            />
          </div>
          <div
            :class="[
              'p-3 rounded-xl border flex items-center justify-between',
              isDark ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50 border-gray-100',
            ]"
          >
            <p
              class="text-xs font-semibold"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'"
            >
              {{ t.showText }}
            </p>
            <!-- Custom Toggle -->
            <button
              @click="barcodeShowText = !barcodeShowText"
              :class="[
                'relative w-12 h-7 rounded-full cursor-pointer transition-colors duration-300',
                barcodeShowText
                  ? 'bg-orange-500'
                  : isDark
                  ? 'bg-gray-600'
                  : 'bg-gray-300',
              ]"
            >
              <div
                :class="[
                  'absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300',
                  barcodeShowText ? 'translate-x-6' : 'translate-x-1',
                ]"
              ></div>
            </button>
          </div>
        </div>

        <!-- Input -->
        <div class="flex gap-2 items-center mb-2">
          <input
            v-model="barcodePayload"
            @input="generateBarcode"
            :class="[
              'flex-1 rounded-xl p-4 text-sm focus:outline-none focus:ring-0 transition-colors',
              barcodeError ? 'bg-red-500/10 text-red-500 placeholder-red-400' : '',
              isDark && !barcodeError
                ? 'bg-gray-700/50 text-white placeholder-gray-500'
                : !barcodeError
                ? 'bg-gray-100 text-gray-800 placeholder-gray-400'
                : '',
            ]"
            :placeholder="currentFormat?.desc || 'Enter value...'"
          />
          <button
            @click="fillExample"
            :class="[
              'px-3 py-3 rounded-xl text-xs font-medium cursor-pointer',
              isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            {{ t.example }}
          </button>
        </div>

        <TacticalPayloadForge
          :barcodeFormat="barcodeFormat"
          currentMode="barcode"
          @apply="applyTacticalPayload"
          @openWifi="$emit('openWifi')"
        />

        <div
          v-if="barcodeError"
          class="p-2 rounded-lg bg-red-500/10 text-red-500 text-xs mt-2"
        >
          <Icon name="fa-exclamation-circle" class="mr-1" />{{ barcodeError }}
        </div>
      </div>
    </div>

    <!-- Preview (1 column) -->
    <div>
      <div
        :class="[
          'rounded-2xl p-5 shadow-sm border sticky top-4',
          animationsEnabled ? 'animate-slide-left' : '',
          isDark
            ? 'bg-gray-800/90 border-gray-700 backdrop-blur'
            : 'bg-white/90 border-gray-100 backdrop-blur',
        ]"
      >
        <div
          class="bg-white rounded-xl p-3 mb-3 flex items-center justify-center min-h-[100px]"
        >
          <canvas id="barcode-canvas"></canvas>
        </div>
        <div class="flex gap-2">
          <div class="flex-1 flex gap-1">
            <button
              @click="downloadBarcode('png')"
              :disabled="!barcodeGenerated"
              :class="[
                'flex-1 py-2 text-xs font-bold rounded-xl transition-all',
                barcodeGenerated
                  ? 'bg-blue-500 text-white cursor-pointer hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed',
              ]"
            >
              PNG
            </button>
            <button
              @click="downloadBarcode('svg')"
              :disabled="!barcodeGenerated"
              :class="[
                'flex-1 py-2 text-xs font-bold rounded-xl transition-all',
                barcodeGenerated
                  ? 'bg-purple-500 text-white cursor-pointer hover:bg-purple-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed',
              ]"
            >
              SVG
            </button>
          </div>
          <button
            @click="resetBarcode"
            :class="[
              'py-2 px-3 rounded-xl cursor-pointer',
              isDark
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-100 text-gray-600',
            ]"
          >
            <Icon name="fa-redo" class="text-xs" />
          </button>
        </div>
        <div class="mt-3">
          <NFCWriterButton :payload="barcodePayload" type="text" />
        </div>
      </div>
    </div>
  </div>
</template>
