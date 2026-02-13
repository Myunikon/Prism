<script setup>
defineProps({
  analysis: Object,
  t: Object,
  isDark: Boolean,
});
</script>

<template>
  <div class="space-y-4">
    <!-- QRIS -->
    <div v-if="analysis.type === 'QRIS' && analysis.qris">
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div
          :class="[
            'p-4 rounded-xl text-center',
            isDark ? 'bg-gray-700' : 'bg-gray-100',
          ]"
        >
          <p
            class="text-xs font-medium mb-1"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          >
            {{ t.claimedCRC }}
          </p>
          <p
            class="text-lg font-mono font-bold"
            :class="isDark ? 'text-white' : 'text-gray-800'"
          >
            {{ analysis.qris.claimedCRC }}
          </p>
        </div>
        <div
          :class="[
            'p-4 rounded-xl text-center',
            analysis.qris.isValid
              ? isDark
                ? 'bg-green-900/30'
                : 'bg-green-100'
              : isDark
              ? 'bg-red-900/30'
              : 'bg-red-100',
          ]"
        >
          <p
            class="text-xs font-medium mb-1"
            :class="analysis.qris.isValid ? 'text-green-600' : 'text-red-600'"
          >
            {{ t.calculatedCRC }}
          </p>
          <p
            :class="[
              'text-lg font-mono font-bold',
              analysis.qris.isValid ? 'text-green-600' : 'text-red-600',
            ]"
          >
            {{ analysis.qris.calculatedCRC }}
            <Icon
              :name="analysis.qris.isValid ? 'fa-check' : 'fa-xmark'"
              class="ml-1"
            />
          </p>
        </div>
      </div>
      <div class="space-y-2">
        <div
          v-for="node in analysis.qris.structure"
          :key="node.id"
          :class="[
            'p-3 rounded-xl border',
            isDark
              ? 'bg-gray-700/50 border-gray-600'
              : 'bg-gray-50 border-gray-200',
          ]"
        >
          <div class="flex justify-between items-center mb-1">
            <span
              class="text-xs font-semibold"
              :class="isDark ? 'text-gray-300' : 'text-gray-600'"
              >{{ node.name }}</span
            >
            <span
              class="text-[10px] px-1.5 py-0.5 rounded"
              :class="
                isDark
                  ? 'bg-gray-600 text-gray-400'
                  : 'bg-gray-200 text-gray-500'
              "
              >Tag {{ node.id }}</span
            >
          </div>
          <p
            class="text-sm font-mono truncate"
            :class="isDark ? 'text-gray-200' : 'text-gray-700'"
          >
            {{ node.val }}
          </p>
        </div>
      </div>
    </div>

    <!-- URL -->
    <div v-else-if="analysis.type === 'URL' && analysis.url">
      <div class="space-y-2">
        <div
          v-for="node in analysis.url.structure"
          :key="node.id"
          :class="[
            'p-3 rounded-xl border flex justify-between items-center',
            isDark
              ? 'bg-gray-700/50 border-gray-600'
              : 'bg-gray-50 border-gray-200',
          ]"
        >
          <span
            class="text-xs font-semibold"
            :class="isDark ? 'text-gray-300' : 'text-gray-600'"
            >{{ node.name }}</span
          >
          <span
            class="text-sm font-mono truncate max-w-[60%]"
            :class="isDark ? 'text-gray-200' : 'text-gray-700'"
            >{{ node.val }}</span
          >
        </div>
      </div>
    </div>

    <!-- Protocol (WiFi, vCard, etc.) -->
    <div v-else-if="analysis.protocol && analysis.protocol.type !== 'TEXT'">
      <div
        :class="[
          'flex items-center gap-3 mb-4 p-4 rounded-xl',
          isDark ? 'bg-blue-900/20' : 'bg-blue-50',
        ]"
      >
        <div
          class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center"
        >
          <Icon
            :name="analysis.protocol.icon || 'fa-qrcode'"
            class="text-xl text-white"
          />
        </div>
        <div>
          <h3
            class="text-sm font-bold"
            :class="isDark ? 'text-white' : 'text-gray-800'"
          >
            {{ analysis.protocol.type }} {{ t.qrCode }}
          </h3>
          <p
            class="text-xs"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          >
            {{ t.parsedData }}
          </p>
        </div>
      </div>
      <div class="space-y-2">
        <div
          v-for="(field, idx) in analysis.protocol.fields"
          :key="idx"
          :class="[
            'p-3 rounded-xl border',
            isDark
              ? 'bg-gray-700/50 border-gray-600'
              : 'bg-gray-50 border-gray-200',
          ]"
        >
          <p
            class="text-xs font-medium mb-1"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          >
            {{ field.label }}
          </p>
          <p
            :class="[
              'text-sm font-mono',
              field.important
                ? isDark
                  ? 'text-white font-semibold'
                  : 'text-gray-800 font-semibold'
                : isDark
                ? 'text-gray-300'
                : 'text-gray-600',
              field.sensitive
                ? 'blur-sm hover:blur-none cursor-pointer transition-all'
                : '',
            ]"
          >
            <a
              v-if="field.isLink"
              :href="field.value"
              target="_blank"
              class="text-blue-500 hover:underline"
              >{{ field.value }}</a
            >
            <span v-else>{{ field.value }}</span>
          </p>
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center py-8"
      :class="isDark ? 'text-gray-500' : 'text-gray-400'"
    >
      <Icon name="fa-info-circle" class="text-3xl mb-2" />
      <p class="text-sm">{{ t.noStructuredData }}</p>
    </div>

    <!-- Stats -->
    <div
      :class="[
        'pt-4 border-t flex justify-between text-xs',
        isDark
          ? 'border-gray-700 text-gray-500'
          : 'border-gray-200 text-gray-400',
      ]"
    >
      <span
        ><Icon name="fa-chart-line" class="mr-1" />{{ t.entropy }}:
        {{
          typeof analysis.entropy === "number"
            ? analysis.entropy.toFixed(2)
            : "N/A"
        }}</span
      >
      <span
        ><Icon name="fa-weight-scale" class="mr-1" />{{ t.size }}:
        {{ analysis.size }} {{ t.bytes }}</span
      >
    </div>
  </div>
</template>
