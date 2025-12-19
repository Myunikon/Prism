const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Extract image metadata
export const extractImageMeta = (file) => {
  return new Promise((resolve) => {
    const meta = {
      fileName: file.name,
      fileSize: file.size,
      fileSizeFormatted: formatBytes(file.size),
      mimeType: file.type,
      lastModified: new Date(file.lastModified).toLocaleString(),
      lastModifiedRaw: file.lastModified,
    };

    const img = new Image();
    img.onload = () => {
      meta.width = img.naturalWidth;
      meta.height = img.naturalHeight;
      meta.aspectRatio = (img.naturalWidth / img.naturalHeight).toFixed(2);
      meta.megapixels = (
        (img.naturalWidth * img.naturalHeight) /
        1000000
      ).toFixed(2);
      meta.orientation =
        img.naturalWidth > img.naturalHeight
          ? "Landscape"
          : img.naturalWidth < img.naturalHeight
          ? "Portrait"
          : "Square";
      resolve(meta);
    };
    img.onerror = () => resolve(meta);
    img.src = URL.createObjectURL(file);
  });
};
