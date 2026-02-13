<script setup>
import { store } from "../../store/state.js";
import { ref } from "vue";
import ConfirmModal from "../common/ConfirmModal.vue";

defineProps({
  openSection: String,
  animationsEnabled: Boolean,
  isDark: Boolean,
  t: Object,
});

const emit = defineEmits(["toggle"]);

const updateConfig = (key, value) => {
  store.setConfig(key, value);
};

const showConfirm = ref(false);
const showSuccess = ref(false);

const requestClear = () => {
  showConfirm.value = true;
};

const handleConfirm = async () => {
  showConfirm.value = false;
  await store.clearJunkData();
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 2000);
};
</script>

<template>
  <div
    :class="[
      'rounded-2xl shadow-sm border overflow-hidden',
      animationsEnabled ? 'transition-all duration-300 hover:shadow-md' : '',
      isDark
        ? 'bg-gray-800/90 border-gray-700'
        : 'bg-white/90 backdrop-blur border-gray-100',
    ]"
  >
    <button
      @click="$emit('toggle', 'storage')"
      class="w-full min-h-[56px] px-5 py-4 flex items-center justify-between cursor-pointer"
      :class="isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/20"
        >
          <Icon name="fa-database" class="text-emerald-500" />
        </div>
        <span
          class="font-semibold"
          :class="isDark ? 'text-white' : 'text-gray-800'"
        >
          {{ store.config.language === "id" ? "Penyimpanan" : "Storage" }}
        </span>
      </div>
      <Icon
        name="fa-chevron-down"
        class="transition-transform duration-300"
        :class="[
          openSection === 'storage' ? 'rotate-180' : '',
          isDark ? 'text-gray-500' : 'text-gray-400',
        ]"
      />
    </button>

    <div
      :class="[
        'overflow-hidden',
        animationsEnabled ? 'transition-all duration-300' : '',
      ]"
      :style="{ maxHeight: openSection === 'storage' ? '400px' : '0' }"
    >
      <div class="px-5 pb-5 space-y-5">
        <!-- Retention Days -->
        <div
          class="flex items-center justify-between min-h-[52px] flex-wrap gap-2"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center"
              :class="isDark ? 'bg-gray-700' : 'bg-gray-100'"
            >
              <Icon name="fa-calendar-days" class="text-emerald-500" />
            </div>
            <div>
              <p
                class="text-sm font-medium"
                :class="isDark ? 'text-white' : 'text-gray-700'"
              >
                {{
                  store.config.language === "id"
                    ? "Simpan Riwayat"
                    : "Keep History"
                }}
              </p>
              <p
                class="text-xs"
                :class="isDark ? 'text-gray-500' : 'text-gray-400'"
              >
                {{
                  store.config.language === "id"
                    ? "Hapus otomatis setelah"
                    : "Auto-delete after"
                }}
              </p>
            </div>
          </div>
          <select
            :value="store.config.logRetentionDays"
            @change="
              updateConfig('logRetentionDays', Number($event.target.value))
            "
            :class="[
              'min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium border cursor-pointer',
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-700',
            ]"
          >
            <option :value="0">
              {{ store.config.language === "id" ? "Selamanya" : "Forever" }}
            </option>
            <option :value="7">
              7 {{ store.config.language === "id" ? "hari" : "days" }}
            </option>
            <option :value="14">
              14 {{ store.config.language === "id" ? "hari" : "days" }}
            </option>
            <option :value="30">
              30 {{ store.config.language === "id" ? "hari" : "days" }}
            </option>
            <option :value="90">
              90 {{ store.config.language === "id" ? "hari" : "days" }}
            </option>
          </select>
        </div>

        <!-- Max Entries -->
        <div
          class="flex items-center justify-between min-h-[52px] flex-wrap gap-2"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center"
              :class="isDark ? 'bg-gray-700' : 'bg-gray-100'"
            >
              <Icon name="fa-list-ol" class="text-cyan-500" />
            </div>
            <div>
              <p
                class="text-sm font-medium"
                :class="isDark ? 'text-white' : 'text-gray-700'"
              >
                {{
                  store.config.language === "id" ? "Maks. Entri" : "Max Entries"
                }}
              </p>
              <p
                class="text-xs"
                :class="isDark ? 'text-gray-500' : 'text-gray-400'"
              >
                {{
                  store.config.language === "id"
                    ? "Batasi jumlah riwayat"
                    : "Limit history count"
                }}
              </p>
            </div>
          </div>
          <select
            :value="store.config.logMaxEntries"
            @change="updateConfig('logMaxEntries', Number($event.target.value))"
            :class="[
              'min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium border cursor-pointer',
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-700',
            ]"
          >
            <option :value="50">50</option>
            <option :value="100">100</option>
            <option :value="200">200</option>
            <option :value="500">500</option>
          </select>
        </div>

        <!-- Current usage info -->
        <div
          class="flex items-center justify-between p-3 rounded-xl"
          :class="isDark ? 'bg-gray-700/50' : 'bg-gray-50'"
        >
          <span
            class="text-xs"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          >
            {{
              store.config.language === "id"
                ? "Entri saat ini"
                : "Current entries"
            }}
          </span>
          <span
            class="text-sm font-bold"
            :class="isDark ? 'text-white' : 'text-gray-700'"
          >
            {{ store.history.length }} / {{ store.config.logMaxEntries }}
          </span>
        </div>
      </div>

      <div
        class="px-5 pb-5 border-t border-dashed"
        :class="isDark ? 'border-gray-700' : 'border-gray-200'"
      >
        <div class="mt-4">
          <button
            @click="requestClear"
            class="w-full py-3 rounded-xl border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/10 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
          >
            <div
              v-if="showSuccess"
              class="absolute inset-0 bg-green-500 flex items-center justify-center text-white animate-fade-in"
            >
              <Icon name="fa-check" class="mr-2" />
              {{ store.config.language === "id" ? "Berhasil!" : "Success!" }}
            </div>
            <template v-else>
              <Icon name="fa-trash-can" />
              {{
                store.config.language === "id"
                  ? "Hapus Cache & Sampah"
                  : "Clear Cache & Junk"
              }}
            </template>
          </button>
          <p
            class="text-xs text-center mt-2"
            :class="isDark ? 'text-gray-500' : 'text-gray-400'"
          >
            {{
              store.config.language === "id"
                ? "Menghapus riwayat & kasus, tetapi menyimpan pengaturan."
                : "Deletes history & cases, but keeps settings."
            }}
          </p>
        </div>
      </div>
    </div>
  </div>

  <ConfirmModal
    :show="showConfirm"
    type="danger"
    :title="store.config.language === 'id' ? 'Hapus Cache?' : 'Clear Cache?'"
    :message="
      store.config.language === 'id'
        ? 'Apakah Anda yakin ingin menghapus semua riwayat dan data kasus? Pengaturan tidak akan dihapus.'
        : 'Are you sure you want to clear all history and case data? Settings will not be deleted.'
    "
    :confirmText="store.config.language === 'id' ? 'Hapus' : 'Delete'"
    :cancelText="store.config.language === 'id' ? 'Batal' : 'Cancel'"
    @confirm="handleConfirm"
    @cancel="showConfirm = false"
  />
</template>
