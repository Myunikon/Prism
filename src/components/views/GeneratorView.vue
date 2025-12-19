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
    <div
      :class="[
        'rounded-2xl p-1.5 shadow-sm border flex gap-1 mb-4',
        animationsEnabled ? 'animate-slide-down' : '',
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
      ]"
    >
      <button
        @click="generatorType = 'qr'"
        :class="[
          'flex-1 py-2.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 text-sm',
          generatorType === 'qr'
            ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
            : isDark
            ? 'text-gray-400 hover:text-white'
            : 'text-gray-500 hover:text-gray-700',
        ]"
      >
        <i class="fa-solid fa-qrcode"></i>{{ t.qrCode }}
      </button>
      <button
        @click="generatorType = 'barcode'"
        :class="[
          'flex-1 py-2.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 text-sm',
          generatorType === 'barcode'
            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
            : isDark
            ? 'text-gray-400 hover:text-white'
            : 'text-gray-500 hover:text-gray-700',
        ]"
      >
        <i class="fa-solid fa-barcode"></i>{{ t.barcode }}
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
