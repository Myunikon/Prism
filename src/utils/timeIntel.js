export const parseMultiFormatTime = (input) => {
    if (!input) return Date.now();
    input = input.trim();

    // 1. Unix Epoch Seconds (10 digits, e.g., 1678888888)
    // Starts with 1, 9-10 digits. (Good until year 2286)
    if (/^1\d{9}$/.test(input)) {
        const ts = parseInt(input);
        const date = new Date(ts * 1000);
        return `Format: Unix Epoch (Seconds)\nUTC: ${date.toUTCString()}\nLocal: ${date.toLocaleString()}`;
    }

    // 2. Unix Epoch Milliseconds (13 digits, e.g., 1678888888000)
    if (/^1\d{12}$/.test(input)) {
        const ts = parseInt(input);
        const date = new Date(ts);
        return `Format: Unix Epoch (Milliseconds)\nUTC: ${date.toUTCString()}\nLocal: ${date.toLocaleString()}`;
    }

    // 3. LDAP / Windows FileTime (18 digits, scalar of 100ns since 1601)
    if (/^\d{18}$/.test(input)) {
        const ticks = BigInt(input);
        // Ticks - 116444736000000000 (diff between 1601 and 1970)
        // Divide by 10000 to get millis
        const millis = Number((ticks - 116444736000000000n) / 10000n);
        const date = new Date(millis);
        return `Format: LDAP / Windows FileTime\nUTC: ${date.toUTCString()}\nLocal: ${date.toLocaleString()}`;
    }

    // 4. Webkit / Chrome Timestamp (17 digits, micros since 1601)
    if (/^\d{17}$/.test(input)) {
        const micros = BigInt(input);
         // similar shift
        const millis = Number((micros - 11644473600000000n) / 1000n);
        const date = new Date(millis);
        return `Format: Webkit / Chrome Timestamp\nUTC: ${date.toUTCString()}\nLocal: ${date.toLocaleString()}`;
    }
    
    // 5. Cocoa / Mac Timestamp (Seconds since 2001-01-01) 9 digits
    if (/^\d{9}(\.\d+)?$/.test(input) && parseInt(input) < 1000000000) {
         // 978307200 is 2001-01-01 epoch offset
        const ts = parseFloat(input);
         const date = new Date((ts + 978307200) * 1000);
         return `Format: Cocoa / Mac Timestamp (Since 2001)\nUTC: ${date.toUTCString()}\nLocal: ${date.toLocaleString()}`;
    }

    // Fallback: Date.parse
    const ts = Date.parse(input);
    if (!isNaN(ts)) {
        const date = new Date(ts);
         return `Format: Standard Date String\nUnix: ${ts/1000}\nISO: ${date.toISOString()}`;
    }

    return "Unknown Timestamp Format";
};

export const toUnix = (input) => {
    const d = new Date(input);
    return isNaN(d.getTime()) ? 'Invalid Date' : Math.floor(d.getTime() / 1000).toString();
};

export const toISO = (input) => {
    const d = new Date(input);
    return isNaN(d.getTime()) ? 'Invalid Date' : d.toISOString();
};

export const toUTC = (input) => {
    const d = new Date(input);
    return isNaN(d.getTime()) ? 'Invalid Date' : d.toUTCString();
};
