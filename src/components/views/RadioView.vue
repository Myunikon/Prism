<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { store } from "../../store/state.js";

const isDark = computed(() => store.config.darkMode);
const animationsEnabled = computed(() => store.config.animations !== false);

// BLE State
const isScanningBLE = ref(false);
const bleDevices = ref([]);
const bleError = ref(null);

// Network State
const connectionInfo = ref(null);
const netInterval = ref(null);

// BLE Scanner
const startBLEScan = async () => {
  bleError.value = null;
  if (!navigator.bluetooth) {
    bleError.value = "Web Bluetooth is not supported on this browser/device.";
    return;
  }

  isScanningBLE.value = true;
  try {
    // Request device - note: this usually only picks ONE device the user selects
    // For a "Scanner" feel, we might request repeatedly or just show the picker
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [], // Add common services if needed
    });

    if (device) {
      // Check if already in list
      if (!bleDevices.value.find((d) => d.id === device.id)) {
        bleDevices.value.unshift({
          id: device.id,
          name: device.name || "Unknown Device",
          rssi: "N/A", // Web Bluetooth requestDevice doesn't expose RSSI directly after selection usually
          time: new Date().toLocaleTimeString(),
        });
        store.addHistory("BLE_SCAN", `Found: ${device.name || device.id}`);
      }
    }
  } catch (err) {
    if (err.name !== "NotFoundError") {
      // NotFoundError is when user cancels the picker
      bleError.value = err.message || "Scan failed";
    }
  } finally {
    isScanningBLE.value = false;
  }
};

// Network Monitor
const updateNetworkInfo = () => {
  const conn =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  if (conn) {
    connectionInfo.value = {
      type: conn.effectiveType || "Unknown", // 4g, 3g, etc
      downlink: conn.downlink || 0, // Mb/s
      rtt: conn.rtt || 0, // ms
      saveData: conn.saveData || false,
    };
  }
};

onMounted(() => {
  updateNetworkInfo();
  // Monitor changes
  const conn =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  if (conn) {
    conn.addEventListener("change", updateNetworkInfo);
  }
  netInterval.value = setInterval(updateNetworkInfo, 2000);
});

onUnmounted(() => {
  const conn =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  if (conn) {
    conn.removeEventListener("change", updateNetworkInfo);
  }
  if (netInterval.value) clearInterval(netInterval.value);
});
</script>

<template>
  <div
    :class="[
      'min-h-full pb-24 flex flex-col gap-6',
      animationsEnabled ? 'animate-fade-in' : '',
    ]"
  >
    <!-- Header -->
    <div
      :class="[
        'rounded-2xl p-6 shadow-sm border relative overflow-hidden',
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100',
      ]"
    >
      <div class="absolute top-0 right-0 p-4 opacity-10">
        <Icon name="fa-tower-broadcast" class="text-6xl" />
      </div>
      <h2
        class="text-xl font-bold mb-1 z-10 relative"
        :class="isDark ? 'text-white' : 'text-gray-800'"
      >
        Radio Intelligence
      </h2>
      <p
        class="text-sm z-10 relative"
        :class="isDark ? 'text-gray-400' : 'text-gray-500'"
      >
        Signal Intelligence & Hardware Recon
      </p>
    </div>

    <!-- Bluetooth Scanner -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3
          class="font-bold text-sm uppercase tracking-wider flex items-center gap-2"
          :class="isDark ? 'text-blue-400' : 'text-blue-600'"
        >
          <Icon name="fa-bluetooth-b" class="text-lg" /> BLE Radar
        </h3>
        <button
          @click="startBLEScan"
          :disabled="isScanningBLE"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
            isScanningBLE
              ? isDark
                ? 'bg-blue-900/50 text-blue-300'
                : 'bg-blue-100 text-blue-400'
              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/25 active:scale-95',
          ]"
        >
          <Icon
            :name="isScanningBLE ? 'fa-spinner' : 'fa-radar'"
            :class="isScanningBLE ? 'animate-spin' : ''"
          />
          {{ isScanningBLE ? "Scanning..." : "Scan Area" }}
        </button>
      </div>

      <!-- Radar Visualizer (Mock/Animation) -->
      <div
        v-if="isScanningBLE"
        class="relative h-40 rounded-2xl overflow-hidden flex items-center justify-center bg-black"
      >
        <div
          class="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,#003300_100%)]"
        ></div>
        <!-- Grid -->
        <div
          class="absolute inset-0"
          style="
            background-image: radial-gradient(#0f0 1px, transparent 1px);
            background-size: 20px 20px;
            opacity: 0.2;
          "
        ></div>
        <!-- Sweep line -->
        <div
          class="w-full h-full absolute animate-[spin_3s_linear_infinite] origin-bottom-right"
        >
          <div
            class="w-1/2 h-1/2 bg-gradient-to-tl from-green-500/50 to-transparent border-t border-l border-green-500/80 rounded-tl-full absolute top-0 left-0 origin-bottom-right"
          ></div>
        </div>
        <div class="text-green-500 font-mono text-xs z-10 animate-pulse">
          ACQUIRING TARGETS...
        </div>
      </div>

      <!-- Device List -->
      <div
        v-if="bleError"
        class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs"
      >
        <Icon name="fa-triangle-exclamation" class="mr-2" />{{ bleError }}
      </div>

      <div v-else-if="bleDevices.length > 0" class="grid gap-2">
        <div
          v-for="dev in bleDevices"
          :key="dev.id"
          :class="[
            'p-3 rounded-xl border flex items-center justify-between',
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100',
            animationsEnabled ? 'animate-slide-in' : '',
          ]"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center"
            >
              <Icon name="fa-bluetooth" />
            </div>
            <div>
              <h4
                class="text-sm font-bold"
                :class="isDark ? 'text-white' : 'text-gray-800'"
              >
                {{ dev.name }}
              </h4>
              <p
                class="text-[10px] font-mono"
                :class="isDark ? 'text-gray-500' : 'text-gray-400'"
              >
                ID: {{ dev.id }}
              </p>
            </div>
          </div>
          <span
            class="text-[10px]"
            :class="isDark ? 'text-gray-500' : 'text-gray-400'"
            >{{ dev.time }}</span
          >
        </div>
      </div>
      <div
        v-else-if="!isScanningBLE"
        class="text-center py-6 border-2 border-dashed rounded-xl"
        :class="
          isDark
            ? 'border-gray-700 text-gray-500'
            : 'border-gray-200 text-gray-400'
        "
      >
        <p class="text-xs">No devices logged yet. Start a scan.</p>
      </div>
    </div>

    <!-- Wifi Analyzer -->
    <div class="space-y-4">
      <h3
        class="font-bold text-sm uppercase tracking-wider flex items-center gap-2"
        :class="isDark ? 'text-purple-400' : 'text-purple-600'"
      >
        <Icon name="fa-wifi" class="text-lg" /> Network Signal (Active)
      </h3>

      <div
        :class="[
          'p-5 rounded-2xl border relative overflow-hidden',
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100',
        ]"
      >
        <!-- Background pulse -->
        <div
          class="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
        ></div>

        <div class="grid grid-cols-2 gap-4 relative z-10">
          <div>
            <p class="text-[10px] uppercase font-bold text-gray-500">
              Connection
            </p>
            <p
              class="text-2xl font-bold"
              :class="isDark ? 'text-white' : 'text-gray-800'"
            >
              {{ connectionInfo?.type.toUpperCase() || "UNKNOWN" }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-[10px] uppercase font-bold text-gray-500">
              Latency (RTT)
            </p>
            <p
              class="text-2xl font-bold font-mono"
              :class="
                !connectionInfo
                  ? 'text-gray-500'
                  : connectionInfo.rtt < 50
                  ? 'text-green-500'
                  : connectionInfo.rtt < 150
                  ? 'text-yellow-500'
                  : 'text-red-500'
              "
            >
              {{ connectionInfo?.rtt }}ms
            </p>
          </div>
          <div class="col-span-2 mt-2">
            <p class="text-[10px] uppercase font-bold text-gray-500 mb-1">
              Downlink Speed
            </p>
            <div
              class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
            >
              <div
                class="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                :style="{
                  width:
                    Math.min(
                      ((connectionInfo?.downlink || 0) / 10) * 100,
                      100
                    ) + '%',
                }"
              ></div>
            </div>
            <p
              class="text-right text-xs mt-1 font-mono"
              :class="isDark ? 'text-gray-300' : 'text-gray-600'"
            >
              {{ connectionInfo?.downlink }} Mbps
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
