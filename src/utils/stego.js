/**
 * Enhances the contrast of the Least Significant Bits of an image data buffer.
 * @param {ImageData} imageData 
 * @returns {ImageData}
 */
export const performLSBAnalysis = (imageData) => {
    const data = imageData.data;
    const len = data.length;
    const output = new ImageData(
        new Uint8ClampedArray(data),
        imageData.width,
        imageData.height
    );
    
    // We strictly look at the last bit (bit 0)
    // If bit is 1 -> make it 255 (white)
    // If bit is 0 -> make it 0 (black)
    // This is essentially "Bit Plane 0" extraction
    
    for (let i = 0; i < len; i += 4) {
        // Red LSB
        const r = data[i] & 1;
        // Green LSB
        const g = data[i + 1] & 1;
        // Blue LSB
        const b = data[i + 2] & 1;
        
        // Boost contrast to max
        output.data[i] = r * 255;
        output.data[i + 1] = g * 255;
        output.data[i + 2] = b * 255;
        // Alpha stays same
        output.data[i + 3] = 255;
    }
    
    return output;
};
