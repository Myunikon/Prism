import { useToast } from "./useToast.js";

export const useNFC = () => {
  const { showToast } = useToast();

  const isSupported = () => {
    return "NDEFReader" in window;
  };

  /**
   * Write content to NFC Tag
   * @param {string} content - Payload content
   * @param {string} type - 'text' or 'url'
   */
  const writeTag = async (content, type = "text") => {
    if (!isSupported()) {
      showToast("NFC is not supported on this device/browser.", "error");
      return;
    }

    try {
      // eslint-disable-next-line no-undef
      const ndef = new NDEFReader();
      
      const records = [];

      if (type === "url" || (type === "text" && content.startsWith("http"))) {
        try {
          new URL(content); // Validate URL
          records.push({ recordType: "url", data: content });
        } catch (e) {
          console.warn("Invalid URL format, writing as text.");
          records.push({ recordType: "text", data: content });
        }
      } else {
        // Default Text Record (SQLi, XSS, Wifi Config)
        records.push({ recordType: "text", data: content });
      }

      showToast("Approach NFC tag to write...", "info", 5000);

      await ndef.write({ records });

      showToast("SUCCESS! Payload written to NFC tag.", "success");
      
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    } catch (error) {
      console.error(error);
      if (error.name === "NotAllowedError") {
        showToast("NFC permission denied.", "error");
      } else if (error.name === "NotSupportedError") {
        showToast("NFC not supported or disabled.", "error");
      } else if (error.name === "QuotaExceededError") {
        showToast("Payload too large for this tag!", "error");
      } else {
        showToast("Write failed: " + error.message, "error");
      }
    }
  };

  return {
    isSupported,
    writeTag,
  };
};
