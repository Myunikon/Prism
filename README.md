# ⬡ PRISM - Tactical Security Suite

> **Advanced Forensic & Reconnaissance Toolset**  
> _Offline-focused. Privacy-first. Cyberpunk aesthetic._

![PRISM Badge](https://img.shields.io/badge/Status-Operational-green?style=for-the-badge)
![Vue 3](https://img.shields.io/badge/Vue_3-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**PRISM** is a Progressive Web Application (PWA) designed for on-the-field forensic analysis, signal intelligence, and OSINT gathering. Built with modern web technologies, it runs entirely client-side, ensuring that sensitive data never leaves your device unless explicitly exported.

---

## ⚡ Key Capabilities

### 📡 Radio Intelligence (`RadioView`)

- **BLE Radar**: Scan and log nearby Bluetooth Low Energy devices (IoT, Wearables, Beacons).
- **Network Signal**: Monitor real-time connection latency (RTT), downlink speed, and effective connection type (4G/3G).
- **Hardware Recon**: Identify device details from broadcast packets.

### 🕵️‍♂️ OSINT & Recon (`ToolsView`)

- **Google Dork Builder**: Construct complex search queries for open-source intelligence.
- **Sherlock Lite**: Check username availability across multiple social platforms.
- **Exif Map Plotter**: Visualize GPS metadata from images on an interactive map.
- **WebRTC Leak**: Detect local IP leaks via WebRTC protocols.

### 🔬 Advanced Forensics (`AnalyzeView`)

- **Smart OCR**: Extract text from images using an auto-enhancing pre-processor (Grayscale + Binarization) for high accuracy.
- **Steganography**: Analyze LSB (Least Significant Bit) layers to find hidden data in images.
- **ELA (Error Level Analysis)**: Detect digital manipulation/photoshopping in images.
- **Metadata Extractor**: View full EXIF, XMP, and IPTC data.

### 📷 Tactical Scanner (`ScannerView`)

- **Universal Reader**: Supports QR, DataMatrix, Aztec, PDF417, EAN-13, UPC, Code-128.
- **QRIS Validator**: Automatically validates Payment QR checksums (CRC16-CCITT).
- **Safe Browsing**: Detects malicious URLs, phishing patterns, and dangerous file extensions before opening.

### 🔐 Crypto Tools

- **Magic Wand**: Auto-detects and decodes encoded strings (Base64, Hex, URL-enc).
- **Ciphers**: ROT13, Caesar, Reverse, Binary converters.
- **Sanitization**: Defang malicious URLs (e.g., `http[s]://malicious[.]com`) for safe sharing.
- **Generators**: Create WiFi config QRs, tactical payloads, and standard barcodes.

---

## 🚀 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)

### Setup locally

```bash
# Clone the repository
git clone https://github.com/YourUsername/Prism.git

# Navigate to directory
cd Prism

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
# Output will be in the /dist folder
```

---

## 📱 PWA Support

This application is PWA-ready.

- **Installable**: Can be installed as a native-like app on Android, iOS, and Desktop.
- **Offline Mode**: Core features (Forensics, Crypto, Generators) work without internet access.

---

## 🛠️ Tech Stack

- **Framework**: Vue 3 (Script Setup)
- **Build Tool**: Vite
- **Styling**: TailwindCSS w/ Custom Cyberpunk Theme
- **State Management**: Pinia / Reactive Store
- **Storage**: IndexedDB (`idb-keyval`)
- **Key Libraries**:
  - `html5-qrcode` & `jsbarcode` (Scanning/Gen)
  - `tesseract.js` (OCR)
  - `leaflet` (Maps)
  - `crypto-js` (Hashing/Encryption)

---

## ⚠️ Disclaimer

**PRISM is intended for educational and authorized security testing purposes only.**
The developers represent that this tool is not intended for illegal use. The user is responsible for obeying all applicable laws in their jurisdiction.

---

_Mission Status: COMPLETE_
