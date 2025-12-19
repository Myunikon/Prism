import exifr from "exifr";

// Convert decimal degrees to DMS string (optional, usually not needed if we just want DD)
// exifr returns DD by default for latitude/longitude!

export const extractExif = async (file) => {
  try {
    // Parse all metadata, including Exif, GPS, TIFF, etc.
    // exifr automatically handles rotation, merging, etc.
    const output = await exifr.parse(file, {
      tiff: true,
      exif: true,
      gps: true,
      ifd0: true, // Camera info often here
      mergeOutput: true,
    });

    if (!output) return null;

    const relevant = {};

    // Camera info
    if (output.Make) relevant.cameraMake = String(output.Make).trim();
    if (output.Model) relevant.cameraModel = String(output.Model).trim();
    if (output.Software) relevant.software = String(output.Software).trim();

    // Date/Time
    if (output.DateTimeOriginal) relevant.dateTimeOriginal = output.DateTimeOriginal;
    else if (output.CreateDate) relevant.dateTimeOriginal = output.CreateDate;
    else if (output.DateTime) relevant.dateTime = output.DateTime;

    // Camera settings
    if (output.ExposureTime) {
        // Convert decimal exposure to fraction if possible for display? 
        // Or just keep as is. Usually exifr returns number.
        // Let's format it nicely: 1/x
        if (output.ExposureTime < 1 && output.ExposureTime > 0) {
             relevant.exposureTime = `1/${Math.round(1/output.ExposureTime)}s`;
        } else {
             relevant.exposureTime = `${output.ExposureTime}s`;
        }
    }
    if (output.FNumber) relevant.aperture = `f/${output.FNumber}`;
    if (output.ISO) relevant.iso = output.ISO;
    if (output.FocalLength) relevant.focalLength = `${output.FocalLength}mm`;

    // GPS - exifr returns latitude and longitude directly!
    // It handles the Ref and converting DMS to DD automatically.
    if (output.latitude && output.longitude) {
        relevant.gps = {
            lat: output.latitude,
            lon: output.longitude
        };
    }

    return Object.keys(relevant).length > 0 ? relevant : null;

  } catch (err) {
    console.warn("EXIF extraction failed (exifr):", err.message);
    return null;
  }
};
