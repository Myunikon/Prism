/**
 * Error Level Analysis (ELA) Utility
 * Ported from legacy QROPS
 */

export function performELA(file, canvasId = null) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            reject("Invalid file type");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                // 1. Create Canvas and Draw Original
                const canvas = document.createElement('canvas'); // Offscreen unless ID provided
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                // 2. Compress to JPEG (Quality 75)
                const jpegUrl = canvas.toDataURL('image/jpeg', 0.75); // 75% quality
                
                // 3. Load Compressed Image
                const jpegImg = new Image();
                jpegImg.onload = function() {
                    // 4. Compare Differences (ELA)
                    const w = canvas.width;
                    const h = canvas.height;

                    const originalData = ctx.getImageData(0, 0, w, h);
                    
                    // Draw compressed image to temporary context to get data
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = w;
                    tempCanvas.height = h;
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCtx.drawImage(jpegImg, 0, 0);
                    const compressedData = tempCtx.getImageData(0, 0, w, h);

                    const resultData = ctx.createImageData(w, h); // Output buffer

                    const scale = 20; // Visibility scale factor

                    for (let i = 0; i < originalData.data.length; i += 4) {
                        // Calculate difference per channel
                        const rDiff = Math.abs(originalData.data[i] - compressedData.data[i]);
                        const gDiff = Math.abs(originalData.data[i+1] - compressedData.data[i+1]);
                        const bDiff = Math.abs(originalData.data[i+2] - compressedData.data[i+2]);
                        
                        // Scale difference for visibility (ELA typically amplifies noise)
                        resultData.data[i] = rDiff * scale;
                        resultData.data[i+1] = gDiff * scale;
                        resultData.data[i+2] = bDiff * scale;
                        resultData.data[i+3] = 255; // Alpha full
                    }

                    // 5. Render ELA to target canvas or return data URL
                    if (canvasId) {
                         // Find target in DOM if provided
                        // In Vue, we might prefer passing the canvas ref directly or returning DataURL
                    }

                    // For now, return the result as a Data URL to display in an <img> or draw to canvas in component
                    tempCtx.putImageData(resultData, 0, 0);
                    resolve(tempCanvas.toDataURL());
                };
                jpegImg.src = jpegUrl;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}
