<script setup>
import { ref, computed } from "vue";
import { store } from "../../store/state.js";

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(["close", "generate"]);

const isDark = computed(() => store.config.darkMode);
const wifiConfig = ref({ ssid: "", password: "", type: "WPA", hidden: false });

const generate = () => {
  // WIFI:T:WPA;S:mynetwork;P:mypass;;
  let s = `WIFI:T:${wifiConfig.value.type};S:${wifiConfig.value.ssid};P:${wifiConfig.value.password};`;
  if (wifiConfig.value.hidden) s += "H:true;";
  s += ";";
  emit("generate", s);
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
  >
    <div
      class="w-full max-w-sm rounded-2xl shadow-2xl border p-5 animate-scale-in"
      :class="
        isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      "
    >
      <h3
        class="text-lg font-bold mb-4 flex items-center gap-2"
        :class="isDark ? 'text-white' : 'text-gray-900'"
      >
        <i class="fa-solid fa-wifi text-blue-500"></i> Wi-Fi Config Builder
      </h3>

      <div class="space-y-3">
        <div>
          <label
            class="text-xs font-semibold block mb-1"
            :class="isDark ? 'text-gray-400' : 'text-gray-600'"
            >SSID (Network Name)</label
          >
          <input
            v-model="wifiConfig.ssid"
            type="text"
            class="w-full p-2 rounded-lg border text-sm"
            :class="
              isDark
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-300'
            "
            placeholder="MyNetwork"
          />
        </div>
        <div>
          <label
            class="text-xs font-semibold block mb-1"
            :class="isDark ? 'text-gray-400' : 'text-gray-600'"
            >Password</label
          >
          <input
            v-model="wifiConfig.password"
            type="text"
            class="w-full p-2 rounded-lg border text-sm"
            :class="
              isDark
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-300'
            "
            placeholder="SecretKey"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label
              class="text-xs font-semibold block mb-1"
              :class="isDark ? 'text-gray-400' : 'text-gray-600'"
              >Encryption</label
            >
            <select
              v-model="wifiConfig.type"
              class="w-full p-2 rounded-lg border text-sm"
              :class="
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-300'
              "
            >
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">Open</option>
            </select>
          </div>
          <div>
            <label
              class="text-xs font-semibold block mb-1"
              :class="isDark ? 'text-gray-400' : 'text-gray-600'"
              >Visibility</label
            >
            <div
              @click="wifiConfig.hidden = !wifiConfig.hidden"
              class="flex items-center gap-2 p-2 border rounded-lg cursor-pointer h-[38px]"
              :class="[
                isDark ? 'border-gray-600' : 'border-gray-300',
                wifiConfig.hidden ? 'bg-blue-500/20 border-blue-500' : '',
              ]"
            >
              <div
                class="w-4 h-4 rounded border flex items-center justify-center"
                :class="
                  wifiConfig.hidden
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-400'
                "
              >
                <i
                  v-if="wifiConfig.hidden"
                  class="fa-solid fa-check text-white text-[10px]"
                ></i>
              </div>
              <span
                class="text-xs"
                :class="isDark ? 'text-gray-300' : 'text-gray-600'"
                >Hidden</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-2 mt-6">
        <button
          @click="$emit('close')"
          class="flex-1 py-2 text-sm font-medium rounded-xl"
          :class="
            isDark
              ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          "
        >
          Cancel
        </button>
        <button
          @click="generate"
          class="flex-1 py-2 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30"
        >
          Generate Config
        </button>
      </div>
    </div>
  </div>
</template>
