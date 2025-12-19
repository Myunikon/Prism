# ⬡ PRISM — Tactical Security Suite

> **Advanced Forensic & Reconnaissance Toolset**  
> _Offline-first · Privacy-focused · Zero-knowledge architecture_

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/status-operational-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)
![Vue](https://img.shields.io/badge/vue-3-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D)
![Vite](https://img.shields.io/badge/vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## 🧠 Overview

**PRISM** is a Progressive Web Application (PWA) built for **field operations, signal intelligence, and digital forensics**.

Unlike traditional cloud-based OSINT platforms, PRISM runs **entirely client-side**.  
No telemetry. No background uploads. No hidden sync.

This **Zero-Trust, Zero-Egress** architecture ensures that all sensitive data — scanned documents, analyzed images, decoded signals — **never leaves the operator's device** unless explicitly exported.

Designed for:

- Low-connectivity environments
- Tactical analysis
- Mobile & desktop deployment via PWA standards

---

## 📸 Interface

| Dashboard                                                        | Spectral Analysis                                              | Crypto Suite                                               |
| ---------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| ![Dashboard](https://via.placeholder.com/300x200?text=Dashboard) | ![Analysis](https://via.placeholder.com/300x200?text=Analysis) | ![Crypto](https://via.placeholder.com/300x200?text=Crypto) |

---

## ⚡ Core Modules

### 📡 Radio Intelligence (`RadioView`)

**Real-time signal analysis & hardware reconnaissance**

- **BLE Radar** — Scan & log Bluetooth Low Energy advertising packets
- **Network Telemetry** — RTT, downlink metrics, effective connection type (4G / 5G / Wi-Fi)
- **Hardware Fingerprinting** — Vendor MAC parsing & device capability inference

---

### 🕵️ OSINT & Reconnaissance (`ToolsView`)

**Open-Source Intelligence utilities**

- **Google Dork Builder** — Visual query builder for advanced operators
- **Sherlock Lite** — Username enumeration across 20+ major platforms
- **EXIF Map Plotter** — Extract GPS metadata & render tactical maps
- **WebRTC Leak Detector** — Detect local IP leaks behind VPNs

---

### 🔬 Digital Forensics (`AnalyzeView`)

**Image analysis & steganography detection**

- **Smart OCR** — Tesseract.js with grayscale + binarization preprocessing
- **Steganography Analysis** — LSB visualization for hidden payload detection
- **Error Level Analysis (ELA)** — Compression artifact & manipulation detection
- **Metadata Viewer** — Full EXIF / XMP / IPTC extraction

---

### 🔐 Cryptography & Sanitization

**Decoding & safe-sharing utilities**

- **Magic Wand** — Heuristic detection (Base64, Hex, URL-Enc, ROT13)
- **URL Defanging** — Neutralize malicious links for safe reporting
- **Payload Generators** — Wi-Fi QR, Code-128, UPC barcodes

---

## 🛠 Technology Stack

| Domain   | Technology               | Purpose                        |
| -------- | ------------------------ | ------------------------------ |
| Core     | Vue 3 (Composition API)  | Reactive UI                    |
| Build    | Vite                     | High-performance bundling      |
| State    | Pinia                    | Global state management        |
| Storage  | IndexedDB (`idb-keyval`) | Offline large-file persistence |
| Styling  | TailwindCSS              | Utility-first cyberpunk UI     |
| Scanning | `html5-qrcode`           | Barcode & QR scanning          |
| Analysis | `tesseract.js`           | OCR (WASM)                     |
| Crypto   | `crypto-js`              | Client-side hashing & encoding |

---

## 🚀 Deployment & Installation

### Option 1 — Local Development

**Prerequisites:** Node.js v16+

```bash
# Clone repository
git clone https://github.com/Myunikon/Prism.git

# Enter directory
cd Prism

# Install dependencies (clean install)
npm ci

# Start dev server
npm run dev
```

### Option 2 — Production Build

```bash
# Build optimized production bundle
npm run build

# Preview locally
npm run preview
```

### Option 3 — Docker (Experimental)

```bash
docker build -t prism-suite .
docker run -p 8080:80 prism-suite
```

---

## 📁 Project Structure

```
Prism/
├── public/              # Static assets (manifest, icons)
├── src/
│   ├── assets/          # Global styles & images
│   ├── components/      # Reusable UI components
│   ├── core/            # Business logic (OCR, Crypto, Scanners)
│   ├── stores/          # Pinia stores
│   ├── views/           # Route views (Radio, Tools, Analyze)
│   ├── App.vue          # Root component
│   └── main.js          # Entry point
├── .env
├── tailwind.config.js
└── vite.config.js
```

---

## 🤝 Contributing

Contributions are welcome — offline-first is non-negotiable.

1. Fork the project
2. Create your branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m "Add AmazingFeature"`
4. Push branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## ⚠️ Legal Disclaimer

**PRISM** is a defensive security & educational analysis tool.

By using this software, you agree that:

- **Authorization** — You only scan assets you own or have permission to test
- **Liability** — Developers are not responsible for misuse or damages
- **Compliance** — You comply with all applicable privacy & computer misuse laws

---

<p align="center">
  <sub>Built with ⚡ by <a href="https://github.com/Myunikon">Myunikon</a></sub>
</p>
