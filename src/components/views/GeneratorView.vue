<script setup>
import { ref, computed } from "vue";
import { store } from "../../store/state.js";
import WiFiConfigModal from "../generator/WiFiConfigModal.vue";
import QRCodeGenerator from "../generator/QRCodeGenerator.vue";
import BarcodeGenerator from "../generator/BarcodeGenerator.vue";

const isDark = computed(() => store.config.darkMode);
const animationsEnabled = computed(() => store.config.animations !== false);
const generatorType = ref("qr");
const showWifiModal = ref(false);

// Refs for child components to pass payload
const qrGenRef = ref(null);
const barcodeGenRef = ref(null);

const handleWifiGenerate = (wifiString) => {
  if (generatorType.value === "qr") {
    if (qrGenRef.value) {
      qrGenRef.value.setPayload(wifiString);
    }
  } else {
    if (barcodeGenRef.value) {
      barcodeGenRef.value.setPayload(wifiString);
    }
  }
  showWifiModal.value = false;
};
const strings = {
  en: {
    qrCode: "QR Code",
    barcode: "Barcode",
  },
  id: {
    qrCode: "Kode QR",
    barcode: "Barcode",
  },
};

const t = computed(() => strings[store.config.language] || strings.en);
</script>

<template>
  <div class="min-h-full pb-20">
    <!-- Type Selector -->
    <!-- Type Selector (Segmented Control) -->
    <div
      :class="[
        'p-1.5 rounded-xl flex gap-1 mb-4',
        isDark ? 'bg-gray-800' : 'bg-gray-100',
      ]"
    >
      <button
        @click="generatorType = 'qr'"
        :class="[
          'flex-1 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2',
          generatorType === 'qr'
            ? isDark
              ? 'bg-gray-600 text-white shadow-sm'
              : 'bg-white text-gray-800 shadow-sm'
            : isDark
            ? 'text-gray-400 hover:text-gray-200'
            : 'text-gray-500 hover:text-gray-700',
        ]"
      >
        <Icon name="fa-qrcode" class="text-xs" />{{ t.qrCode }}
      </button>
      <button
        @click="generatorType = 'barcode'"
        :class="[
          'flex-1 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2',
          generatorType === 'barcode'
            ? isDark
              ? 'bg-gray-600 text-white shadow-sm'
              : 'bg-white text-gray-800 shadow-sm'
            : isDark
            ? 'text-gray-400 hover:text-gray-200'
            : 'text-gray-500 hover:text-gray-700',
        ]"
      >
        <Icon name="fa-barcode" class="text-xs" />{{ t.barcode }}
      </button>
    </div>

    <!-- Generators -->
    <QRCodeGenerator
      v-if="generatorType === 'qr'"
      ref="qrGenRef"
      @openWifi="showWifiModal = true"
    />

    <BarcodeGenerator
      v-else
      ref="barcodeGenRef"
      @openWifi="showWifiModal = true"
    />

    <!-- WiFi Config Modal -->
    <WiFiConfigModal
      :show="showWifiModal"
      @close="showWifiModal = false"
      @generate="handleWifiGenerate"
    />
  </div>
</template>
