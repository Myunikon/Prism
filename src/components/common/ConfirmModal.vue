<script setup>
import { ref, computed, watch } from "vue";
import { store } from "../../store/state.js";

const props = defineProps({
  show: Boolean,
  title: { type: String, default: "Confirm" },
  message: { type: String, default: "Are you sure?" },
  confirmText: { type: String, default: "Yes" },
  cancelText: { type: String, default: "Cancel" },
  type: { type: String, default: "warning" }, // warning, danger, info
});

const emit = defineEmits(["confirm", "cancel"]);

const isDark = computed(() => store.config.darkMode);
const animationsEnabled = computed(() => store.config.animations !== false);

const iconClass = computed(() => {
  switch (props.type) {
    case "danger":
      return "fa-trash";
    case "info":
      return "fa-info-circle";
    default:
      return "fa-exclamation-triangle";
  }
});

const iconBg = computed(() => {
  switch (props.type) {
    case "danger":
      return "bg-red-500/20";
    case "info":
      return "bg-blue-500/20";
    default:
      return "bg-amber-500/20";
  }
});

const confirmBtnClass = computed(() => {
  switch (props.type) {
    case "danger":
      return "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600";
    case "info":
      return "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600";
    default:
      return "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600";
  }
});

const handleConfirm = () => {
  emit("confirm");
};

const handleCancel = () => {
  emit("cancel");
};

// Close on escape
const handleKeydown = (e) => {
  if (e.key === "Escape" && props.show) {
    handleCancel();
  }
};

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeydown);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = "";
    }
  }
);
</script>

<template>
  <Teleport to="body">
    <Transition
      :enter-active-class="
        animationsEnabled ? 'transition-opacity duration-200' : ''
      "
      :leave-active-class="
        animationsEnabled ? 'transition-opacity duration-150' : ''
      "
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="handleCancel"
        ></div>

        <!-- Modal -->
        <Transition
          :enter-active-class="
            animationsEnabled ? 'transition-all duration-200' : ''
          "
          :leave-active-class="
            animationsEnabled ? 'transition-all duration-150' : ''
          "
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="show"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-message"
            :class="[
              'relative w-full max-w-sm rounded-2xl shadow-2xl p-6',
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white',
            ]"
          >
            <!-- Icon -->
            <div class="flex justify-center mb-4">
              <div
                :class="[
                  'w-16 h-16 rounded-full flex items-center justify-center',
                  iconBg,
                ]"
              >
                <Icon :name="iconClass" class="text-2xl" :class="[type === 'danger' ? 'text-red-500' : type === 'info' ? 'text-blue-500' : 'text-amber-500']" />
              </div>
            </div>

            <!-- Title -->
            <h3
              id="confirm-modal-title"
              class="text-lg font-bold text-center mb-2"
              :class="isDark ? 'text-white' : 'text-gray-800'"
            >
              {{ title }}
            </h3>

            <!-- Message -->
            <p
              id="confirm-modal-message"
              class="text-sm text-center mb-6"
              :class="isDark ? 'text-gray-300' : 'text-gray-500'"
            >
              {{ message }}
            </p>

            <!-- Actions -->
            <div class="flex gap-3">
              <button
                @click="handleCancel"
                :class="[
                  'flex-1 min-h-[48px] px-4 py-3 rounded-xl font-semibold cursor-pointer',
                  animationsEnabled
                    ? 'transition-all duration-200 hover:scale-[1.02]'
                    : '',
                  isDark
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                ]"
              >
                {{ cancelText }}
              </button>
              <button
                @click="handleConfirm"
                :class="[
                  'flex-1 min-h-[48px] px-4 py-3 rounded-xl font-semibold text-white cursor-pointer',
                  animationsEnabled
                    ? 'transition-all duration-200 hover:scale-[1.02]'
                    : '',
                  confirmBtnClass,
                ]"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
