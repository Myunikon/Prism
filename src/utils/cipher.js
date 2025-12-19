// Basic scoring to detect "readable" text
// Returns a lower score for better text (English-like)
const scoreText = (text) => {
    const common = "etaoinshrdlu ETAOINSHRDLU"; // Frequency analysis
    let score = 0;
    let printable = 0;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const code = text.charCodeAt(i);

        // Heavy penalty for non-printable chars (excluding newlines/tabs)
        if (code < 32 && code !== 10 && code !== 13 && code !== 9) {
            score += 100;
        } else {
            printable++;
            // Small bonus for common chars
            if (common.includes(char)) {
                score -= 1;
            }
        }
    }

    if (printable === 0) return 10000;
    return score / printable; // Normalize by length
};

export const xorBruteForce = (input) => {
    // If hex input, convert to bytes first
    let bytes = [];
    if (/^[0-9A-Fa-f]+$/.test(input) && input.length % 2 === 0) {
        // Hex mode
        for (let i = 0; i < input.length; i += 2) {
            bytes.push(parseInt(input.substr(i, 2), 16));
        }
    } else {
        // Text mode
        for (let i = 0; i < input.length; i++) {
            bytes.push(input.charCodeAt(i));
        }
    }

    const results = [];

    // Try all 256 keys
    for (let key = 1; key < 256; key++) {
        let decoded = "";
        for (let b of bytes) {
            decoded += String.fromCharCode(b ^ key);
        }
        
        results.push({ key, text: decoded, score: scoreText(decoded) });
    }

    // Sort by best score (lowest)
    results.sort((a, b) => a.score - b.score);

    // Return top 5
    return results.slice(0, 5).map(r => 
        `Key 0x${r.key.toString(16).padStart(2, '0')} (${r.key}):\n${r.text}`
    ).join('\n\n-------------------\n\n');
};

export const caesarBruteForce = (input) => {
    const shift = (str, amount) => {
        return str.replace(/[a-zA-Z]/g, c => {
            const base = c <= 'Z' ? 65 : 97;
            return String.fromCharCode(((c.charCodeAt(0) - base + amount) % 26) + base);
        });
    };

    let output = "Caesar Cipher Shift Candidates:\n\n";

    for (let i = 1; i < 26; i++) {
        output += `Shift +${i}: ${shift(input, i)}\n`;
    }
    
    return output;
};
