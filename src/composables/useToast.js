import { reactive, readonly } from "vue";

const state = reactive({
  message: "",
  type: "info", // info, success, warning, error
  visible: false,
  timeout: null,
});

export const useToast = () => {
  const showToast = (message, type = "info", duration = 3000) => {
    // Clear existing timeout
    if (state.timeout) {
      clearTimeout(state.timeout);
    }

    state.message = message;
    state.type = type;
    state.visible = true;

    // Auto hide
    state.timeout = setTimeout(() => {
      hideToast();
    }, duration);
  };

  const hideToast = () => {
    state.visible = false;
    state.timeout = null;
  };

  return {
    state: readonly(state),
    showToast,
    hideToast,
  };
};
