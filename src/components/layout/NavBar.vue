<script setup>
import { store } from "../../store/state.js";
import { computed, ref } from "vue";

const isDark = computed(() => store.config.darkMode);
const animationsEnabled = computed(() => store.config.animations !== false);
const showMore = ref(false);

// Main tabs for bottom nav (Max 4 + More = 5)
const mainTabs = [
  { id: "cam", icon: "fa-camera", label: "Scan" },
  { id: "file", icon: "fa-file-lines", label: "Analyze" },
  { id: "gen", icon: "fa-qrcode", label: "Generate" },
  { id: "tools", icon: "fa-wrench", label: "Tools" },
];

// All tabs for desktop (unchanged)
const allTabs = [
  {
    id: "cam",
    icon: "fa-camera",
    label: "Scan",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "file",
    icon: "fa-file-lines",
    label: "Analyze",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "gen",
    icon: "fa-qrcode",
    label: "Generate",
    color: "from-green-500 to-teal-500",
  },
  {
    id: "radio",
    icon: "fa-tower-broadcast",
    label: "Radio",
    color: "from-blue-600 to-indigo-600",
  },
  {
    id: "tools",
    icon: "fa-wrench",
    label: "Tools",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "logs",
    icon: "fa-clock-rotate-left",
    label: "History",
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "settings",
    icon: "fa-gear",
    label: "Settings",
    color: "from-gray-500 to-gray-700",
  },
];

// Secondary items for "More" menu
const moreItems = [
  { id: "radio", icon: "fa-tower-broadcast", label: "Radio" },
  { id: "logs", icon: "fa-clock-rotate-left", label: "History" },
  { id: "settings", icon: "fa-gear", label: "Settings" },
  { id: "help", icon: "fa-circle-question", label: "Help", action: "guide" },
];

// Tab indicator position
const tabOrder = ["cam", "file", "gen", "tools"];
const currentTabIndex = computed(() => tabOrder.indexOf(store.currentTab));
const indicatorStyle = computed(() => ({
  transform: `translateX(${currentTabIndex.value * 100}%)`,
  width: "20%", // 100% / 5 items
}));

const switchTab = (id) => {
  store.setTab(id);
  showMore.value = false;
};

const handleMoreItem = (item) => {
  if (item.action === "guide") {
    store.isGuideOpen = true;
  } else {
    store.setTab(item.id);
  }
  showMore.value = false;
};
</script>

<template>
  <!-- Desktop Header with Animated Gradient -->
  <header
    role="navigation"
    aria-label="Main navigation"
    :class="[
      'hidden md:flex items-center justify-between px-6 py-4 sticky top-0 z-50 shadow-lg',
      animationsEnabled ? 'animate-gradient' : '',
    ]"
    style="
      background: linear-gradient(135deg, #667eea, #764ba2);
      background-size: 200% 200%;
    "
  >
    <div class="flex items-center gap-3 group">
      <div
        :class="[
          'w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center',
          animationsEnabled ? 'group-hover:animate-wiggle' : '',
        ]"
      >
        <i class="fa-solid fa-shield-halved text-white text-lg"></i>
      </div>
      <div>
        <h1 class="text-lg font-bold text-white">PRISM</h1>
        <p class="text-[10px] text-white/70">Tactical Security Scanner</p>
      </div>
    </div>

    <nav
      role="tablist"
      aria-label="App sections"
      class="flex items-center gap-1 bg-white/10 backdrop-blur rounded-xl p-1"
    >
      <button
        v-for="tab in allTabs"
        :key="tab.id"
        role="tab"
        :aria-selected="store.currentTab === tab.id"
        :aria-label="tab.label"
        @click="switchTab(tab.id)"
        :class="[
          'px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer flex items-center gap-2 btn-press',
          animationsEnabled ? 'transition-all duration-200' : '',
          store.currentTab === tab.id
            ? 'bg-white text-gray-800 shadow-lg'
            : 'text-white/80 hover:text-white hover:bg-white/10',
        ]"
      >
        <i
          :class="[
            'fa-solid text-base',
            tab.icon,
            store.currentTab === tab.id && animationsEnabled
              ? 'animate-bounce-in'
              : '',
          ]"
        ></i>
        <span>{{ tab.label }}</span>
      </button>
    </nav>

    <button
      @click="store.isGuideOpen = true"
      aria-label="Help"
      :class="[
        'flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl cursor-pointer font-semibold btn-press',
        animationsEnabled ? 'transition-all duration-200 hover:scale-105' : '',
      ]"
    >
      <i class="fa-solid fa-circle-question text-lg"></i>
      <span class="text-sm">Help</span>
    </button>
  </header>

  <!-- Mobile Bottom Nav with Glass Effect -->
  <nav
    role="navigation"
    aria-label="Mobile navigation"
    :class="[
      'fixed bottom-0 left-0 right-0 z-50 md:hidden border-t glass-strong pb-[env(safe-area-inset-bottom)]',
      isDark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200',
    ]"
  >
    <!-- Active Tab Indicator -->
    <div
      v-if="currentTabIndex >= 0"
      class="absolute top-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
      :style="{
        width: '20%',
        left: `calc(${currentTabIndex * 20}%)`,
      }"
    ></div>

    <!-- More Menu Popup -->
    <Transition
      :enter-active-class="
        animationsEnabled ? 'transition-all duration-200 ease-out' : ''
      "
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      :leave-active-class="
        animationsEnabled ? 'transition-all duration-150 ease-in' : ''
      "
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showMore"
        :class="[
          'absolute bottom-full right-2 mb-2 rounded-2xl shadow-2xl overflow-hidden border min-w-[180px]',
          isDark
            ? 'bg-gray-800/95 border-gray-700 backdrop-blur-lg'
            : 'bg-white/95 border-gray-200 backdrop-blur-lg',
        ]"
      >
        <button
          v-for="(item, idx) in moreItems"
          :key="item.id"
          @click="handleMoreItem(item)"
          :class="[
            'w-full px-4 py-3.5 flex items-center gap-3 cursor-pointer text-left btn-press',
            animationsEnabled ? 'transition-all duration-150' : '',
            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
          ]"
          :style="animationsEnabled ? { animationDelay: `${idx * 50}ms` } : {}"
        >
          <div
            :class="[
              'w-8 h-8 rounded-lg flex items-center justify-center',
              isDark ? 'bg-gray-700' : 'bg-gray-100',
            ]"
          >
            <i
              :class="[
                'fa-solid',
                item.icon,
                isDark ? 'text-gray-300' : 'text-gray-600',
              ]"
            ></i>
          </div>
          <span
            class="text-sm font-medium"
            :class="isDark ? 'text-white' : 'text-gray-700'"
            >{{ item.label }}</span
          >
        </button>
      </div>
    </Transition>

    <!-- Nav Items -->
    <div class="grid grid-cols-5 h-16 w-full relative">
      <!-- Main Tabs -->
      <button
        v-for="tab in mainTabs"
        :key="tab.id"
        role="tab"
        :aria-selected="store.currentTab === tab.id"
        :aria-label="tab.label"
        @click="switchTab(tab.id)"
        :class="[
          'flex flex-col items-center justify-center gap-1 cursor-pointer btn-press relative',
          animationsEnabled ? 'transition-all duration-200' : '',
          store.currentTab === tab.id
            ? isDark
              ? 'text-blue-400'
              : 'text-blue-600'
            : isDark
            ? 'text-gray-400'
            : 'text-gray-500',
        ]"
      >
        <i
          :class="[
            'fa-solid text-lg',
            tab.icon,
            store.currentTab === tab.id && animationsEnabled
              ? 'animate-bounce-in'
              : '',
          ]"
        ></i>
        <span class="text-[11px] font-medium">{{ tab.label }}</span>
      </button>

      <!-- More Button -->
      <button
        @click="showMore = !showMore"
        aria-label="More options"
        :aria-expanded="showMore"
        :class="[
          'flex flex-col items-center justify-center gap-1 cursor-pointer relative btn-press',
          animationsEnabled ? 'transition-all duration-200' : '',
          showMore
            ? isDark
              ? 'text-blue-400'
              : 'text-blue-600'
            : isDark
            ? 'text-gray-500'
            : 'text-gray-400',
        ]"
      >
        <i
          :class="[
            'fa-solid text-xl',
            showMore ? 'fa-xmark' : 'fa-ellipsis',
            animationsEnabled ? 'transition-transform duration-200' : '',
            showMore ? 'rotate-90' : '',
          ]"
        ></i>
        <span class="text-[10px] font-medium">More</span>
      </button>
    </div>
  </nav>

  <!-- Overlay for closing more menu -->
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-150"
    leave-to-class="opacity-0"
  >
    <div
      v-if="showMore"
      @click="showMore = false"
      class="fixed inset-0 z-40 md:hidden bg-black/20"
    ></div>
  </Transition>
</template>
