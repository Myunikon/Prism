<script setup>
import { store } from "../../store/state.js";
import { computed, ref, onMounted, onUnmounted } from "vue";
import AppearanceSettings from "../settings/AppearanceSettings.vue";
import ScannerSettings from "../settings/ScannerSettings.vue";
import StorageSettings from "../settings/StorageSettings.vue";
import ApiSettings from "../settings/ApiSettings.vue";
import AboutSettings from "../settings/AboutSettings.vue";

const isDark = computed(() => store.config.darkMode);
const animationsEnabled = computed(() => store.config.animations !== false);

// Mobile check
const isMobile = ref(window.innerWidth < 768);
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};
onMounted(() => window.addEventListener("resize", checkMobile));
onUnmounted(() => window.removeEventListener("resize", checkMobile));

// Accordion state for mobile
const openSection = ref("appearance");

const toggleSection = (section) => {
  openSection.value = openSection.value === section ? "" : section;
};

const translations = {
  en: {
    title: "Settings",
    subtitle: "Configure your preferences",
    appearance: "Appearance",
    darkMode: "Dark Mode",
    darkModeDesc: "Switch to dark theme",
    language: "Language",
    fontSize: "Font Size",
    small: "S",
    medium: "M",
    large: "L",
    scanner: "Scanner",
    autoScan: "Auto-scan",
    autoScanDesc: "Automatically process detected codes",
    haptic: "Haptic Feedback",
    hapticDesc: "Vibrate on successful scan",
    animations: "Animations",
    animationsDesc: "Enable smooth transitions & effects",
    api: "API Integration",
    vtProxy: "VirusTotal Proxy URL",
    vtProxyDesc: "Required for URL threat analysis",
    about: "About",
    version: "Version",
  },
  id: {
    title: "Pengaturan",
    subtitle: "Konfigurasi preferensi Anda",
    appearance: "Tampilan",
    darkMode: "Mode Gelap",
    darkModeDesc: "Beralih ke tema gelap",
    language: "Bahasa",
    fontSize: "Ukuran Font",
    small: "K",
    medium: "S",
    large: "B",
    scanner: "Pemindai",
    autoScan: "Pindai Otomatis",
    autoScanDesc: "Otomatis memproses kode yang terdeteksi",
    haptic: "Umpan Balik Haptic",
    hapticDesc: "Getarkan saat pemindaian berhasil",
    animations: "Animasi",
    animationsDesc: "Aktifkan transisi & efek halus",
    api: "Integrasi API",
    vtProxy: "URL Proxy VirusTotal",
    vtProxyDesc: "Diperlukan untuk analisis ancaman URL",
    about: "Tentang",
    version: "Versi",
  },
};

const t = computed(
  () => translations[store.config.language] || translations.en
);
</script>

<template>
  <div :class="['space-y-4 pb-4', animationsEnabled ? 'animate-fade-in' : '']">
    <!-- Header -->
    <div
      :class="[
        'flex items-center gap-4',
        animationsEnabled ? 'animate-slide-up' : '',
      ]"
    >
      <div
        class="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg"
      >
        <i class="fa-solid fa-gear text-white text-xl md:text-2xl"></i>
      </div>
      <div>
        <h2
          class="text-xl md:text-2xl font-bold"
          :class="isDark ? 'text-white' : 'text-gray-800'"
        >
          {{ t.title }}
        </h2>
        <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
          {{ t.subtitle }}
        </p>
      </div>
    </div>

    <!-- Appearance Section -->
    <AppearanceSettings
      :open-section="openSection"
      :animations-enabled="animationsEnabled"
      :is-dark="isDark"
      :t="t"
      @toggle="toggleSection"
    />

    <!-- Scanner Section -->
    <ScannerSettings
      :open-section="openSection"
      :animations-enabled="animationsEnabled"
      :is-dark="isDark"
      :t="t"
      @toggle="toggleSection"
    />

    <!-- Storage Section -->
    <StorageSettings
      :open-section="openSection"
      :animations-enabled="animationsEnabled"
      :is-dark="isDark"
      :t="t"
      @toggle="toggleSection"
    />

    <!-- API Section -->
    <ApiSettings
      :open-section="openSection"
      :animations-enabled="animationsEnabled"
      :is-dark="isDark"
      :t="t"
      @toggle="toggleSection"
    />

    <!-- About Section -->
    <AboutSettings
      :open-section="openSection"
      :animations-enabled="animationsEnabled"
      :is-dark="isDark"
      :t="t"
      :is-mobile="isMobile"
    />
  </div>
</template>
