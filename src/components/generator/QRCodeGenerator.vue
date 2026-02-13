<script setup>
import { ref, computed, watch } from "vue";
import QRCode from "qrcode";
import { store } from "../../store/state.js";
import TacticalPayloadForge from "./TacticalPayloadForge.vue";
import NFCWriterButton from "./NFCWriterButton.vue";
import { qrGeneratorStrings } from "../../i18n/generator.js";

const props = defineProps(["modelValue"]);
const emit = defineEmits(["openWifi"]);

const isDark = computed(() => store.config.darkMode);
const animationsEnabled = computed(() => store.config.animations !== false);

// QR Code state
const qrPayload = ref("");
const qrUrl = ref(null);
const qrColor = ref("#1d1d1f");
const qrBgColor = ref("#ffffff");
const qrErrorLevel = ref("H");
const qrLogo = ref(null);
const qrLogoSize = ref(20); // Percentage
const showOptions = ref(false);

const colorPresets = [
  { fg: "#1d1d1f", bg: "#ffffff", name: "Classic" },
  { fg: "#1e40af", bg: "#dbeafe", name: "Blue" },
  { fg: "#166534", bg: "#dcfce7", name: "Green" },
  { fg: "#9333ea", bg: "#f3e8ff", name: "Purple" },
  { fg: "#dc2626", bg: "#fef2f2", name: "Red" },
  { fg: "#ffffff", bg: "#1d1d1f", name: "Inverted" },
];

const qrTemplates = [
  {
    label: "WiFi",
    icon: "fa-wifi",
    value: "WIFI:T:WPA;S:NetworkName;P:Password;;",
  },
  { label: "Phone", icon: "fa-phone", value: "tel:+628123456789" },
  { label: "Email", icon: "fa-envelope", value: "mailto:email@example.com" },
  { label: "URL", icon: "fa-link", value: "https://example.com" },
];

// Generate QR Code
const generateQR = async () => {
  if (!qrPayload.value) {
    qrUrl.value = null;
    return;
  }
  try {
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, qrPayload.value, {
      width: 300,
      margin: 2,
      color: { dark: qrColor.value, light: qrBgColor.value },
      errorCorrectionLevel: qrErrorLevel.value,
    });

    if (qrLogo.value) {
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = qrLogo.value;
      await new Promise((resolve) => {
        img.onload = () => {
          // Calculate logo size
          const size = (canvas.width * qrLogoSize.value) / 100;
          const x = (canvas.width - size) / 2;
          const y = (canvas.height - size) / 2;
          ctx.drawImage(img, x, y, size, size);
          resolve();
        };
        img.onerror = resolve; // Continue even if logo fails
      });
    }

    qrUrl.value = canvas.toDataURL("image/png");
  } catch (err) {
    console.error(err);
    qrUrl.value = null;
  }
};

const handleLogoUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      qrLogo.value = e.target.result;
      generateQR();
    };
    reader.readAsDataURL(file);
  }
};

watch([qrColor, qrBgColor, qrErrorLevel, qrLogo, qrLogoSize], () => {
  if (qrPayload.value) generateQR();
});

const applyColorPreset = (preset) => {
  qrColor.value = preset.fg;
  qrBgColor.value = preset.bg;
};

// Downloads
const downloadQR = async (format) => {
  if (!qrPayload.value) return;

  if (format === "svg") {
    const svg = await QRCode.toString(qrPayload.value, {
      width: 300,
      margin: 2,
      color: { dark: qrColor.value, light: qrBgColor.value },
      errorCorrectionLevel: qrErrorLevel.value,
      type: "svg",
    });
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `qrcode_${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }, 100);
  } else {
    if (!qrUrl.value) return;
    const link = document.createElement("a");
    link.download = `qrcode_${Date.now()}.png`;
    link.href = qrUrl.value;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => document.body.removeChild(link), 100);
  }
};

const resetQR = () => {
  qrUrl.value = null;
  qrPayload.value = "";
};

const applyTacticalPayload = (payload) => {
  qrPayload.value = payload;
  generateQR();
};

const setPayload = (val) => {
  qrPayload.value = val;
  generateQR();
};

// Expose setPayload for parent to use (e.g. Wifi Modal)

const t = computed(
  () => qrGeneratorStrings[store.config.language] || qrGeneratorStrings.en
);

defineExpose({ setPayload });
</script>

<template>
  <div class="flex flex-col lg:grid lg:grid-cols-3 gap-4">
    <!-- Input & Options (2 columns on large) -->
    <div class="lg:col-span-2 space-y-4">
      <!-- Input Card -->
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
            class="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/20"
          >
            <Icon name="fa-qrcode" class="text-green-500" />
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

        <textarea
          v-model="qrPayload"
          @input="generateQR"
          rows="3"
          :class="[
            'w-full rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-0 transition-colors',
            isDark
              ? 'bg-gray-700/50 text-white placeholder-gray-500'
              : 'bg-gray-100 text-gray-800 placeholder-gray-400',
          ]"
          :placeholder="t.inputPlaceholder"
        ></textarea>

        <div class="flex flex-wrap gap-2 mt-4">
          <button
            v-for="template in qrTemplates"
            :key="template.label"
            @click="
              qrPayload = template.value;
              generateQR();
            "
            :class="[
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5',
              isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            <Icon :name="template.icon" class="text-xs opacity-70" />{{
              template.label
            }}
          </button>
        </div>

        <TacticalPayloadForge
          currentMode="qr"
          @apply="applyTacticalPayload"
          @openWifi="$emit('openWifi')"
        />
      </div>

      <!-- Options Toggle (List Item Style) -->
      <button
        @click="showOptions = !showOptions"
        :class="[
          'w-full px-5 py-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-sm border',
          isDark
            ? 'bg-gray-800/90 border-gray-700 hover:bg-gray-800'
            : 'bg-white/90 border-gray-100 hover:bg-white',
        ]"
      >
        <span
          class="flex items-center gap-3 font-semibold"
          :class="isDark ? 'text-gray-200' : 'text-gray-700'"
        >
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/10"
          >
            <Icon name="fa-sliders" class="text-purple-500 text-sm" />
          </div>
          {{ t.customize }}
        </span>
        <Icon
          name="fa-chevron-down"
          class="transition-transform duration-300"
          :class="[
            showOptions ? 'rotate-180' : '',
            isDark ? 'text-gray-500' : 'text-gray-400',
          ]"
        />
      </button>

      <!-- Options Panel -->
      <!-- Options Panel -->
      <div
        v-if="showOptions"
        :class="[
          'rounded-2xl p-5 shadow-sm border space-y-6',
          animationsEnabled ? 'animate-slide-down' : '',
          isDark
            ? 'bg-gray-800/90 border-gray-700 backdrop-blur'
            : 'bg-white/90 border-gray-100 backdrop-blur',
        ]"
      >
        <!-- Color Presets -->
        <div class="mb-4">
          <p
            class="text-xs font-semibold mb-2"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          >
            {{ t.colorPresets }}
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="preset in colorPresets"
              :key="preset.name"
              @click="applyColorPreset(preset)"
              :class="[
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all text-xs',
                qrColor === preset.fg && qrBgColor === preset.bg
                  ? 'ring-2 ring-green-500'
                  : '',
                isDark
                  ? 'border-gray-600 hover:border-gray-500'
                  : 'border-gray-200 hover:border-gray-300',
              ]"
            >
              <div
                class="w-4 h-4 rounded border flex items-center justify-center"
                :style="{
                  backgroundColor: preset.bg,
                  borderColor: preset.fg,
                }"
              >
                <div
                  class="w-1.5 h-1.5 rounded-sm"
                  :style="{ backgroundColor: preset.fg }"
                ></div>
              </div>
              <span :class="isDark ? 'text-gray-300' : 'text-gray-600'">{{
                preset.name
              }}</span>
            </button>
          </div>
        </div>

        <!-- Custom Colors -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <p
              class="text-xs font-semibold mb-1.5"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'"
            >
              {{ t.foreground }}
            </p>
            <div class="flex items-center gap-2">
              <input
                type="color"
                v-model="qrColor"
                class="w-8 h-8 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                v-model="qrColor"
                :class="[
                  'flex-1 px-2 py-1.5 rounded-lg text-xs font-mono border',
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-50 border-gray-200',
                ]"
              />
            </div>
          </div>
          <div>
            <p
              class="text-xs font-semibold mb-1.5"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'"
            >
              {{ t.background }}
            </p>
            <div class="flex items-center gap-2">
              <input
                type="color"
                v-model="qrBgColor"
                class="w-8 h-8 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                v-model="qrBgColor"
                :class="[
                  'flex-1 px-2 py-1.5 rounded-lg text-xs font-mono border',
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-50 border-gray-200',
                ]"
              />
            </div>
          </div>
        </div>

        <!-- Error Correction -->
        <div>
          <p
            class="text-xs font-semibold mb-1.5"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          >
            {{ t.errorCorrection }}
          </p>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="level in ['L', 'M', 'Q', 'H']"
              :key="level"
              @click="qrErrorLevel = level"
              :class="[
                'py-2 rounded-lg border text-xs font-bold cursor-pointer transition-all',
                qrErrorLevel === level
                  ? 'border-green-500 bg-green-500/10 text-green-500'
                  : isDark
                  ? 'border-gray-600 text-gray-400 hover:border-gray-500'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300',
              ]"
            >
              {{ level }}
            </button>
          </div>
        </div>

        <!-- Logo Embed -->
        <div
          class="mt-4 pt-4 border-t"
          :class="isDark ? 'border-gray-700' : 'border-gray-100'"
        >
          <div class="flex items-center justify-between mb-2">
            <p
              class="text-xs font-semibold"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'"
            >
              {{ t.embedLogo }}
            </p>
            <button
              v-if="qrLogo"
              @click="
                qrLogo = null;
                generateQR();
              "
              class="text-[10px] text-red-400 hover:text-red-500 font-bold"
            >
              {{ t.remove }}
            </button>
          </div>

          <div class="space-y-3">
            <!-- Upload Button -->
            <label
              class="flex items-center justify-center p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all bg-opacity-50"
              :class="[
                isDark
                  ? 'border-gray-600 hover:border-green-500 bg-gray-800'
                  : 'border-gray-300 hover:border-green-500 bg-gray-50',
              ]"
            >
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleLogoUpload"
              />
              <div class="flex flex-col items-center gap-1">
                  <Icon
                    v-if="!qrLogo"
                    name="fa-cloud-arrow-up"
                    class="text-lg text-gray-400"
                  />
                <img
                  v-else
                  :src="qrLogo"
                  class="w-8 h-8 object-contain rounded-md"
                />
                <span
                  class="text-[10px] font-medium"
                  :class="isDark ? 'text-gray-400' : 'text-gray-500'"
                >
                  {{ qrLogo ? t.changeImage : t.uploadImage }}
                </span>
              </div>
            </label>

            <!-- Size Slider -->
            <div v-if="qrLogo">
              <div class="flex justify-between mb-1">
                <span
                  class="text-[10px]"
                  :class="isDark ? 'text-gray-400' : 'text-gray-500'"
                  >{{ t.size }}</span
                >
                <span
                  class="text-[10px] font-bold"
                  :class="isDark ? 'text-gray-300' : 'text-gray-600'"
                  >{{ qrLogoSize }}%</span
                >
              </div>
              <input
                type="range"
                v-model.number="qrLogoSize"
                min="5"
                max="30"
                class="w-full accent-green-500 cursor-pointer"
              />
              <p
                class="text-[10px] text-orange-400 mt-1"
                v-if="qrLogoSize > 25 && qrErrorLevel !== 'H'"
              >
                <Icon name="fa-triangle-exclamation" class="mr-1" />
                >{{ t.highErrorWarn }}
              </p>
            </div>
          </div>
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
        <div v-if="qrUrl" class="space-y-3">
          <div
            class="rounded-xl overflow-hidden border"
            :class="isDark ? 'border-gray-600' : 'border-gray-200'"
          >
            <img
              :src="qrUrl"
              class="w-full aspect-square object-contain"
              :style="{ backgroundColor: qrBgColor }"
            />
          </div>

          <div class="flex gap-2">
            <div class="flex-1 flex gap-1">
              <button
                @click="downloadQR('png')"
                class="flex-1 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:shadow-lg transition-all"
              >
                PNG
              </button>
              <button
                @click="downloadQR('svg')"
                class="flex-1 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:shadow-lg transition-all"
              >
                SVG
              </button>
            </div>
            <button
              @click="resetQR"
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
            <NFCWriterButton :payload="qrPayload" type="text" />
          </div>
        </div>
        <div
          v-else
          :class="[
            'aspect-square flex flex-col items-center justify-center rounded-xl',
            isDark ? 'bg-gray-700' : 'bg-gray-100',
          ]"
        >
          <Icon
            name="fa-qrcode"
            class="text-3xl mb-2"
            :class="isDark ? 'text-gray-500' : 'text-gray-300'"
          />
          <p
            class="text-xs"
            :class="isDark ? 'text-gray-500' : 'text-gray-400'"
          >
            {{ t.preview }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
