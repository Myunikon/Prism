<script setup>
defineProps({
  exifData: Object,
  isDark: Boolean,
  t: Object,
});

const openGPS = (gps) => {
  if (gps) {
    const { lat, lon } = gps;
    window.open(`https://www.google.com/maps?q=${lat},${lon}`, "_blank");
  }
};
</script>

<template>
  <div
    v-if="exifData"
    :class="[
      'p-4 rounded-xl border mb-4',
      isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100',
    ]"
  >
    <h4
      class="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2"
      :class="isDark ? 'text-gray-400' : 'text-gray-500'"
    >
      <i class="fa-solid fa-camera text-green-500"></i>{{ t.exifMetadata }}
    </h4>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
      <div
        v-if="exifData.cameraMake || exifData.cameraModel"
        :class="['p-2 rounded-lg', isDark ? 'bg-gray-800' : 'bg-white']"
      >
        <p
          class="text-[10px] font-medium uppercase"
          :class="isDark ? 'text-gray-500' : 'text-gray-400'"
        >
          {{ t.camera }}
        </p>
        <p
          class="text-xs font-bold truncate"
          :class="isDark ? 'text-white' : 'text-gray-800'"
        >
          {{ exifData.cameraMake }} {{ exifData.cameraModel }}
        </p>
      </div>
      <div
        v-if="exifData.dateTimeOriginal"
        :class="['p-2 rounded-lg', isDark ? 'bg-gray-800' : 'bg-white']"
      >
        <p
          class="text-[10px] font-medium uppercase"
          :class="isDark ? 'text-gray-500' : 'text-gray-400'"
        >
          {{ t.taken }}
        </p>
        <p
          class="text-xs font-bold"
          :class="isDark ? 'text-white' : 'text-gray-800'"
        >
          {{ exifData.dateTimeOriginal }}
        </p>
      </div>
      <div
        v-if="exifData.exposureTime"
        :class="['p-2 rounded-lg', isDark ? 'bg-gray-800' : 'bg-white']"
      >
        <p
          class="text-[10px] font-medium uppercase"
          :class="isDark ? 'text-gray-500' : 'text-gray-400'"
        >
          {{ t.exposure }}
        </p>
        <p
          class="text-xs font-bold"
          :class="isDark ? 'text-white' : 'text-gray-800'"
        >
          {{ exifData.exposureTime }}
        </p>
      </div>
      <div
        v-if="exifData.aperture"
        :class="['p-2 rounded-lg', isDark ? 'bg-gray-800' : 'bg-white']"
      >
        <p
          class="text-[10px] font-medium uppercase"
          :class="isDark ? 'text-gray-500' : 'text-gray-400'"
        >
          {{ t.aperture }}
        </p>
        <p
          class="text-xs font-bold"
          :class="isDark ? 'text-white' : 'text-gray-800'"
        >
          {{ exifData.aperture }}
        </p>
      </div>
      <div
        v-if="exifData.iso"
        :class="['p-2 rounded-lg', isDark ? 'bg-gray-800' : 'bg-white']"
      >
        <p
          class="text-[10px] font-medium uppercase"
          :class="isDark ? 'text-gray-500' : 'text-gray-400'"
        >
          {{ t.iso }}
        </p>
        <p
          class="text-xs font-bold"
          :class="isDark ? 'text-white' : 'text-gray-800'"
        >
          {{ exifData.iso }}
        </p>
      </div>
      <div
        v-if="exifData.focalLength"
        :class="['p-2 rounded-lg', isDark ? 'bg-gray-800' : 'bg-white']"
      >
        <p
          class="text-[10px] font-medium uppercase"
          :class="isDark ? 'text-gray-500' : 'text-gray-400'"
        >
          {{ t.focal }}
        </p>
        <p
          class="text-xs font-bold"
          :class="isDark ? 'text-white' : 'text-gray-800'"
        >
          {{ exifData.focalLength }}
        </p>
      </div>
      <div
        v-if="exifData.software"
        :class="['p-2 rounded-lg', isDark ? 'bg-gray-800' : 'bg-white']"
      >
        <p
          class="text-[10px] font-medium uppercase"
          :class="isDark ? 'text-gray-500' : 'text-gray-400'"
        >
          {{ t.software }}
        </p>
        <p
          class="text-xs font-bold truncate"
          :class="isDark ? 'text-white' : 'text-gray-800'"
        >
          {{ exifData.software }}
        </p>
      </div>
    </div>

    <!-- GPS Location -->
    <div v-if="exifData.gps" class="mt-3">
      <button
        @click="openGPS(exifData.gps)"
        class="w-full p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold cursor-pointer flex items-center justify-center gap-2 hover:shadow-lg transition-all"
      >
        <i class="fa-solid fa-location-dot"></i>
        {{ t.viewMap }} ({{ exifData.gps.lat }}, {{ exifData.gps.lon }})
      </button>
    </div>
  </div>

  <div
    v-else
    :class="[
      'p-3 rounded-xl text-center text-xs',
      isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400',
    ]"
  >
    <i class="fa-solid fa-camera-slash mr-1"></i>{{ t.noExif }}
  </div>
</template>
