export const macOui = {
    "00:03:93": "Apple",
    "00:05:02": "Apple",
    "00:0A:27": "Apple",
    "00:0A:95": "Apple",
    "00:0C:29": "VMware",
    "00:10:FA": "Apple",
    "00:13:02": "Intel Corporate",
    "00:18:FE": "Hewlett Packard",
    "00:1A:11": "Google",
    "00:1B:63": "Apple",
    "00:1C:42": "Parallels",
    "00:1D:09": "Dell",
    "00:1E:52": "Qualcomm",
    "00:1E:8C": "ASUSTek",
    "00:21:6B": "Intel",
    "00:23:6C": "Apple",
    "00:24:8C": "ASUSTek",
    "00:25:90": "Super Micro",
    "00:26:BB": "Apple",
    "00:50:56": "VMware",
    "00:B0:D0": "Dell",
    "00:E0:4C": "Realtek",
    "18:FE:34": "Espressif",
    "24:0A:C4": "Espressif",
    "24:6F:28": "Espressif",
    "2C:3A:E8": "Espressif",
    "30:AE:A4": "Espressif",
    "3C:71:BF": "Espressif",
    "40:91:51": "Espressif",
    "48:3F:DA": "Espressif",
    "48:55:19": "Espressif",
    "50:02:91": "Espressif",
    "54:5A:A6": "Espressif",
    "5C:CF:7F": "Espressif",
    "60:01:94": "Espressif",
    "68:C6:3A": "Espressif",
    "80:7D:3A": "Espressif",
    "84:0D:8E": "Espressif",
    "84:F3:EB": "Espressif",
    "90:97:D5": "Espressif",
    "94:B9:7E": "Espressif",
    "A0:20:A6": "Espressif",
    "A4:7B:9D": "Espressif",
    "AC:D0:74": "Espressif",
    "B4:E6:2D": "Espressif",
    "BC:DD:C2": "Espressif",
    "C4:4F:33": "Espressif",
    "CC:50:E3": "Espressif",
    "D8:A0:1D": "Espressif",
    "DC:4F:22": "Espressif",
    "EC:FA:BC": "Espressif"
    // Truncated for brevity, focused on IoT and Common Devices
};

export const lookupOui = (mac) => {
    // Normalize: remove separators, uppercase
    const clean = mac.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
    if (clean.length < 6) return "Invaild MAC (Too short)";
    
    // Check first 6 chars (OUI)
    // We need to format it back to XX:XX:XX for lookup if keys are formatted
    // My keys are XX:XX:XX
    const oui = `${clean.substring(0,2)}:${clean.substring(2,4)}:${clean.substring(4,6)}`;
    
    return macOui[oui] || "Vendor Unknown (Not in local DB)";
};
