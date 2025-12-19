<script setup>
import { store } from "../../store/state.js";
import { computed } from "vue";

const isDark = computed(() => store.config.darkMode);
const animationsEnabled = computed(() => store.config.animations !== false);
const lang = computed(() => store.config.language);

const content = {
  en: {
    title: "User Guide",
    subtitle: "Complete documentation for QROPS",
    sections: [
      {
        icon: "fa-camera",
        iconColor: "text-blue-500",
        title: "Scan & Recon",
        description:
          "Point your camera at any QR code or barcode. The app supports:",
        bullets: [
          "QR Codes (including QRIS payments)",
          "EAN-13/EAN-8 (product barcodes)",
          "UPC-A/UPC-E (US product codes)",
          "Code 39/93/128 (industrial)",
          "Data Matrix, Aztec, PDF417",
        ],
      },
      {
        icon: "fa-tower-broadcast",
        iconColor: "text-pink-500",
        title: "Radio Intelligence",
        description: "Signal intelligence tools (requires capability):",
        bullets: [
          "BLE Radar: Detect nearby Bluetooth devices",
          "Wifi Analyzer: Signal latency & speed estimation",
          "Hardware Recon: Identify device types/IDs",
          "Real-time signal monitoring",
        ],
      },
      {
        icon: "fa-magnifying-glass-location",
        iconColor: "text-indigo-500",
        title: "OSINT Tools",
        description: "Open Source Intelligence gathering:",
        bullets: [
          "Google Dork Builder for advanced search",
          "Username Recon (Sherlock Lite)",
          "Exif Map Plotter (GPS visualization)",
          "MAC Address OUI Lookup",
          "WebRTC Leak Detector",
        ],
      },
      {
        icon: "fa-microscope",
        iconColor: "text-purple-500",
        title: "Forensics Lab",
        description: "Deep file analysis & extraction:",
        bullets: [
          "OCR: Extract text from images (Auto-enhanced)",
          "Steganography: LSB & Bit Plane Analysis",
          "ELA: Error Level Analysis for fakes",
          "Metadata Extraction (EXIF, XMP)",
          "File Hash Calculation (SHA-256)",
        ],
      },
      {
        icon: "fa-briefcase",
        iconColor: "text-amber-500",
        title: "Case Management",
        description: "Manage your investigation evidence:",
        bullets: [
          "Save scans & analysis results to Case",
          "Visual feedback for duplicate items",
          "Local persisted storage (IndexedDB)",
          "Generate professional PDF Reports",
          "Export evidence chains",
        ],
      },
      {
        icon: "fa-qrcode",
        iconColor: "text-green-500",
        title: "Generator",
        description: "Create custom QR codes and barcodes:",
        bullets: [
          "QR: URLs, WiFi, Phone, Email, Location",
          "Custom Colors: Foreground/Background",
          "Logo Embedding & Error Correction",
          "Tactical Payloads (WiFi Configs etc)",
          "Export as PNG or SVG",
        ],
      },
      {
        icon: "fa-wrench",
        iconColor: "text-orange-500",
        title: "Crypto Tools",
        description: "Built-in utilities for security analysis:",
        bullets: [
          "Base64, Hex, URL Encode/Decode",
          "ROT13, Caesar Ciphers",
          "Defang/Refang URLs",
          "Extract emails, IPs, URLs from text",
          "Magic Wand: Auto-detect & decode",
        ],
      },
    ],
    threatLevels: {
      title: "Threat Levels",
      levels: [
        {
          name: "Safe",
          desc: "No threats detected",
          color: "green",
          icon: "fa-shield-check",
        },
        {
          name: "Suspicious",
          desc: "Unusual patterns found",
          color: "orange",
          icon: "fa-triangle-exclamation",
        },
        {
          name: "High Risk",
          desc: "Known malicious patterns",
          color: "red",
          icon: "fa-shield-xmark",
        },
      ],
    },
    protocols: {
      title: "Supported Protocols",
      list: [
        "QRIS/EMV",
        "WiFi",
        "BLE",
        "vCard",
        "meCard",
        "Geo Location",
        "SMS",
        "Tel",
        "Email",
        "WebRTC",
      ],
    },
    close: "Got it",
  },
  id: {
    title: "Panduan Pengguna",
    subtitle: "Dokumentasi diperbarui untuk QROPS v2",
    sections: [
      {
        icon: "fa-camera",
        iconColor: "text-blue-500",
        title: "Pindai & Recon",
        description: "Arahkan kamera ke kode QR atau barcode. Mendukung:",
        bullets: [
          "Kode QR (termasuk pembayaran QRIS)",
          "EAN-13/EAN-8 (barcode produk)",
          "UPC-A/UPC-E (kode produk US)",
          "Code 39/93/128 (industri)",
          "Data Matrix, Aztec, PDF417",
        ],
      },
      {
        icon: "fa-tower-broadcast",
        iconColor: "text-pink-500",
        title: "Intelijen Radio",
        description: "Alat intelijen sinyal (memerlukan kapabilitas):",
        bullets: [
          "BLE Radar: Deteksi perangkat Bluetooth sekitar",
          "Wifi Analyzer: Estimasi latensi & kecepatan",
          "Recon Perangkat Keras: Identifikasi ID/Tipe",
          "Pemantauan sinyal real-time",
        ],
      },
      {
        icon: "fa-magnifying-glass-location",
        iconColor: "text-indigo-500",
        title: "Alat OSINT",
        description: "Open Source Intelligence gathering:",
        bullets: [
          "Google Dork Builder untuk pencarian lanjut",
          "Username Recon (Sherlock Lite)",
          "Exif Map Plotter (Visualisasi GPS)",
          "Pencarian OUI Alamat MAC",
          "Detektor Kebocoran WebRTC",
        ],
      },
      {
        icon: "fa-microscope",
        iconColor: "text-purple-500",
        title: "Lab Forensik",
        description: "Analisis & ekstraksi file mendalam:",
        bullets: [
          "OCR: Ekstrak teks dari gambar (Auto-enhanced)",
          "Steganografi: Analisis LSB & Bit Plane",
          "ELA: Error Level Analysis untuk manipulasi",
          "Ekstraksi Metadata (EXIF, XMP)",
          "Kalkulasi Hash File (SHA-256)",
        ],
      },
      {
        icon: "fa-briefcase",
        iconColor: "text-amber-500",
        title: "Manajemen Kasus",
        description: "Kelola bukti investigasi Anda:",
        bullets: [
          "Simpan hasil scan & analisis ke Kasus",
          "Feedback visual untuk item duplikat",
          "Penyimpanan lokal persisten (IndexedDB)",
          "Buat Laporan PDF Profesional",
          "Ekspor rantai bukti",
        ],
      },
      {
        icon: "fa-qrcode",
        iconColor: "text-green-500",
        title: "Generator",
        description: "Buat kode QR dan barcode kustom:",
        bullets: [
          "QR: URL, WiFi, Telepon, Email, Lokasi",
          "Warna Kustom: Depan/Belakang",
          "Embed Logo & Koreksi Error",
          "Payload Taktis (Config WiFi dll)",
          "Ekspor sebagai PNG atau SVG",
        ],
      },
      {
        icon: "fa-wrench",
        iconColor: "text-orange-500",
        title: "Alat Kripto",
        description: "Utilitas bawaan untuk analisis keamanan:",
        bullets: [
          "Base64, Hex, URL Encode/Decode",
          "ROT13, Caesar Ciphers",
          "Defang/Refang URL",
          "Ekstrak email, IP, URL dari teks",
          "Tongkat Ajaib: Auto-detect & decode",
        ],
      },
    ],
    threatLevels: {
      title: "Tingkat Ancaman",
      levels: [
        {
          name: "Aman",
          desc: "Tidak ada ancaman",
          color: "green",
          icon: "fa-shield-check",
        },
        {
          name: "Mencurigakan",
          desc: "Pola tidak biasa",
          color: "orange",
          icon: "fa-triangle-exclamation",
        },
        {
          name: "Risiko Tinggi",
          desc: "Pola berbahaya",
          color: "red",
          icon: "fa-shield-xmark",
        },
      ],
    },
    protocols: {
      title: "Protokol yang Didukung",
      list: [
        "QRIS/EMV",
        "WiFi",
        "BLE",
        "vCard",
        "meCard",
        "Lokasi Geo",
        "SMS",
        "Tel",
        "Email",
        "WebRTC",
      ],
    },
    close: "Mengerti",
  },
};

const t = computed(() => content[lang.value] || content.en);
</script>

<template>
  <Transition :enter-active-class="animationsEnabled ? 'animate-fade-in' : ''">
    <div
      v-if="store.isGuideOpen"
      class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="store.isGuideOpen = false"
    >
      <div
        :class="[
          'w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col',
          animationsEnabled ? 'animate-scale-in' : '',
          isDark ? 'bg-gray-800' : 'bg-white',
        ]"
      >
        <!-- Header -->
        <div
          class="p-5 border-b flex justify-between items-center shrink-0"
          :class="isDark ? 'border-gray-700' : 'border-gray-200'"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
            >
              <i class="fa-solid fa-book-open text-white text-xl"></i>
            </div>
            <div>
              <h2
                class="text-lg font-bold"
                :class="isDark ? 'text-white' : 'text-gray-800'"
              >
                {{ t.title }}
              </h2>
              <p
                class="text-xs"
                :class="isDark ? 'text-gray-400' : 'text-gray-500'"
              >
                {{ t.subtitle }}
              </p>
            </div>
          </div>
          <button
            @click="store.isGuideOpen = false"
            :class="[
              'p-2.5 rounded-xl transition-colors cursor-pointer',
              isDark
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
            ]"
          >
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Body - Scrollable -->
        <div class="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          <!-- Main Sections -->
          <div
            v-for="(section, idx) in t.sections"
            :key="idx"
            :class="[
              'p-4 rounded-2xl',
              isDark ? 'bg-gray-700/50' : 'bg-gray-50',
            ]"
          >
            <h3
              class="text-sm font-bold mb-2 flex items-center gap-2"
              :class="isDark ? 'text-white' : 'text-gray-800'"
            >
              <i :class="['fa-solid', section.icon, section.iconColor]"></i>
              {{ section.title }}
            </h3>
            <p
              class="text-sm mb-3"
              :class="isDark ? 'text-gray-300' : 'text-gray-600'"
            >
              {{ section.description }}
            </p>
            <ul class="space-y-1.5">
              <li
                v-for="(bullet, bidx) in section.bullets"
                :key="bidx"
                class="text-sm flex items-start gap-2"
                :class="isDark ? 'text-gray-400' : 'text-gray-500'"
              >
                <i class="fa-solid fa-check text-green-500 mt-1 text-xs"></i>
                <span>{{ bullet }}</span>
              </li>
            </ul>
          </div>

          <!-- Threat Levels -->
          <div>
            <h3
              class="text-sm font-bold mb-3 flex items-center gap-2"
              :class="isDark ? 'text-white' : 'text-gray-800'"
            >
              <i class="fa-solid fa-gauge text-cyan-500"></i>
              {{ t.threatLevels.title }}
            </h3>
            <div class="grid grid-cols-3 gap-2">
              <div
                v-for="level in t.threatLevels.levels"
                :key="level.name"
                :class="[
                  'p-3 rounded-xl text-center',
                  isDark ? `bg-${level.color}-900/30` : `bg-${level.color}-50`,
                ]"
              >
                <div
                  :class="[
                    'w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md',
                    `from-${level.color}-500 to-${level.color}-600`,
                  ]"
                >
                  <i :class="['fa-solid text-white', level.icon]"></i>
                </div>
                <p :class="['text-xs font-bold', `text-${level.color}-600`]">
                  {{ level.name }}
                </p>
                <p
                  class="text-[10px]"
                  :class="isDark ? 'text-gray-400' : 'text-gray-500'"
                >
                  {{ level.desc }}
                </p>
              </div>
            </div>
          </div>

          <!-- Protocols -->
          <div>
            <h3
              class="text-sm font-bold mb-3 flex items-center gap-2"
              :class="isDark ? 'text-white' : 'text-gray-800'"
            >
              <i class="fa-solid fa-code text-purple-500"></i>
              {{ t.protocols.title }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="proto in t.protocols.list"
                :key="proto"
                :class="[
                  'px-3 py-1.5 text-xs font-medium rounded-lg',
                  isDark
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-600',
                ]"
              >
                {{ proto }}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="p-5 border-t shrink-0"
          :class="isDark ? 'border-gray-700' : 'border-gray-200'"
        >
          <button
            @click="store.isGuideOpen = false"
            class="w-full py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all cursor-pointer"
          >
            {{ t.close }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
