<script setup>
import NavBar from "./components/layout/NavBar.vue";
import { store } from "./store/state.js";
import ScannerView from "./components/views/ScannerView.vue";
import AnalyzeView from "./components/views/AnalyzeView.vue";
import ToolsView from "./components/views/ToolsView.vue";
import GuideModal from "./components/common/GuideModal.vue";
import GeneratorView from "./components/views/GeneratorView.vue";
import LogsView from "./components/views/LogsView.vue";
import SettingsView from "./components/views/SettingsView.vue";
import RadioView from "./components/views/RadioView.vue";
import ToastNotification from "./components/common/ToastNotification.vue";
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from "vue";

const isDark = computed(() => store.config.darkMode);
const animationsEnabled = computed(() => store.config.animations !== false);

// Detect if mobile or desktop
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});

// Tab configuration
// Tab configuration
const tabs = [
  { id: "cam", component: "ScannerView" },
  { id: "file", component: "AnalyzeView" },
  { id: "gen", component: "GeneratorView" },
  { id: "tools", component: "ToolsView" },
  { id: "radio", component: "RadioView" },
  { id: "logs", component: "LogsView" },
  { id: "settings", component: "SettingsView" },
];

const scrollContainer = ref(null);
const isScrolling = ref(false);

// Scroll to tab when store changes
watch(
  () => store.currentTab,
  async (newTab) => {
    if (!isMobile.value || isScrolling.value) return;
    await nextTick();
    const index = tabs.findIndex((t) => t.id === newTab);
    if (scrollContainer.value && index >= 0) {
      const targetScroll = index * scrollContainer.value.offsetWidth;
      scrollContainer.value.scrollTo({
        left: targetScroll,
        behavior: animationsEnabled.value ? "smooth" : "auto",
      });
    }
  }
);

// Update active tab based on scroll position
const handleScroll = () => {
  if (!scrollContainer.value) return;
  isScrolling.value = true;

  const scrollLeft = scrollContainer.value.scrollLeft;
  const width = scrollContainer.value.offsetWidth;
  const index = Math.round(scrollLeft / width);

  if (
    index >= 0 &&
    index < tabs.length &&
    tabs[index] &&
    store.currentTab !== tabs[index].id
  ) {
    store.setTab(tabs[index].id);
  }

  clearTimeout(window.scrollEndTimer);
  window.scrollEndTimer = setTimeout(() => {
    isScrolling.value = false;
  }, 150);
};

onMounted(() => {
  // Initial scroll to current tab on mobile
  if (isMobile.value) {
    nextTick(() => {
      const index = tabs.findIndex((t) => t.id === store.currentTab);
      if (scrollContainer.value && index >= 0) {
        scrollContainer.value.scrollLeft =
          index * scrollContainer.value.offsetWidth;
      }
    });
  }
});
</script>

<template>
  <div
    :class="[
      'h-[100dvh] w-full overflow-hidden flex flex-col',
      isDark
        ? 'bg-gray-900'
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50',
      animationsEnabled ? 'motion-safe' : 'motion-reduce',
    ]"
  >
    <GuideModal />
    <ToastNotification />

    <!-- Main Container -->
    <div class="flex flex-col h-full w-full overflow-hidden relative z-10">
      <NavBar />

      <!-- Mobile: Horizontal Snap Scroll -->
      <div
        v-if="isMobile"
        ref="scrollContainer"
        class="flex-1 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden scrollbar-hide"
        @scroll="handleScroll"
      >
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="snap-center flex-shrink-0 w-full h-full overflow-y-auto p-4 pb-20"
          :class="[
            isDark ? 'bg-gray-900/95' : 'bg-white/80',
            animationsEnabled ? 'animate-fade-scale' : '',
          ]"
          style="
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          "
        >
          <ScannerView v-if="tab.id === 'cam'" />
          <AnalyzeView v-else-if="tab.id === 'file'" />
          <GeneratorView v-else-if="tab.id === 'gen'" />
          <RadioView v-else-if="tab.id === 'radio'" />
          <ToolsView v-else-if="tab.id === 'tools'" />
          <LogsView v-else-if="tab.id === 'logs'" />
          <SettingsView v-else-if="tab.id === 'settings'" />
        </div>
      </div>

      <!-- Desktop: Traditional Tab View -->
      <main
        v-else
        class="flex-1 overflow-y-auto overflow-x-hidden pb-0 p-4 md:px-8 md:py-6"
        :class="isDark ? 'bg-gray-900/90' : 'bg-white/70'"
        style="backdrop-filter: blur(10px)"
      >
        <Transition
          :enter-active-class="animationsEnabled ? 'animate-slide-in' : ''"
          :leave-active-class="
            animationsEnabled ? 'animate-slide-out' : 'hidden'
          "
          mode="out-in"
        >
          <ScannerView v-if="store.currentTab === 'cam'" :key="'scan'" />
          <AnalyzeView v-else-if="store.currentTab === 'file'" :key="'file'" />
          <GeneratorView v-else-if="store.currentTab === 'gen'" :key="'gen'" />
          <RadioView v-else-if="store.currentTab === 'radio'" :key="'radio'" />
          <ToolsView v-else-if="store.currentTab === 'tools'" :key="'tools'" />
          <LogsView v-else-if="store.currentTab === 'logs'" :key="'logs'" />
          <SettingsView
            v-else-if="store.currentTab === 'settings'"
            :key="'settings'"
          />
        </Transition>
      </main>
    </div>
  </div>
</template>

<style>
/* Horizontal scroll hide for swipe nav */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* MOBILE: Hide vertical scrollbar - gesture is navigation */
@media (max-width: 767px) {
  .overflow-y-auto {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .overflow-y-auto::-webkit-scrollbar {
    display: none;
  }
}

/* DESKTOP: Show custom scrollbar - visual cue is important */
@media (min-width: 768px) {
  .overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: rgba(139, 92, 246, 0.4) transparent;
  }
  .overflow-y-auto::-webkit-scrollbar {
    width: 8px;
  }
  .overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
  }
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: linear-gradient(
      180deg,
      rgba(139, 92, 246, 0.5),
      rgba(236, 72, 153, 0.5)
    );
    border-radius: 4px;
  }
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(
      180deg,
      rgba(139, 92, 246, 0.7),
      rgba(236, 72, 153, 0.7)
    );
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-20px);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-slide-in {
  animation: slideIn 0.25s ease-out;
}
.animate-slide-out {
  animation: slideOut 0.2s ease-in;
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes fadeScale {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-scale {
  animation: fadeScale 0.3s ease-out;
}

.motion-reduce * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}
</style>
