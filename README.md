# 🛰️ NetMajik - Advanced Network Interface Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build: Electron](https://img.shields.io/badge/Build-Electron-blue.svg)](https://www.electronjs.org/)
[![Framework: React](https://img.shields.io/badge/Framework-React-61DAFB.svg)](https://react.dev/)

NetMajik is a modern, high-performance desktop application designed for network administrators and power users. Built with Electron, React, and Tailwind CSS, it provides a comprehensive suite of tools to manage network interfaces, monitor traffic, and perform diagnostics with a premium, user-friendly interface.

---

## ✨ Key Features

- **📊 Advanced Dashboard**: 
  - Real-time traffic monitoring (Upload/Download).
  - CPU & RAM usage tracking.
  - Overall system health overview.
- **🛠️ Interface Management**: 
  - Enable/Disable network adapters with a single click.
  - Quick-switch between multiple IP profiles.
- **🚀 One-Click Profiles**: 
  - Create and apply Static or DHCP configurations instantly for various network environments.
- **🔍 Network Discovery & Port Scanner**: 
  - Scan local networks to find connected devices.
  - Identify open ports on any target to audit security.
- **📝 Clipboard & Credential Library**: 
  - Store frequently used IP addresses and DNS servers.
  - Securely manage default login credentials for network hardware (Routers, Switches, etc.).
- **🌐 Tool Hub**: 
  - Integrated Subnet Calculator, Ping, Traceroute, and a built-in browser for device configuration.

---

## 📘 User Manuals / Manuales de Usuario

Comprehensive step-by-step user manuals detailing every feature, button, and tool are available in 7 languages:

- 🇪🇸 [Manual en Español](public/MANUAL_NETMAJIK_ES.md)
- 🇺🇸 [English User Manual](public/MANUAL_NETMAJIK_EN.md)
- 🇵🇹 [Manual em Português](public/MANUAL_NETMAJIK_PT.md)
- 🇩🇪 [Deutsches Handbuch](public/MANUAL_NETMAJIK_DE.md)
- 🇫🇷 [Manuel en Français](public/MANUAL_NETMAJIK_FR.md)
- 🇨🇳 [中文用户指南](public/MANUAL_NETMAJIK_ZH.md)
- 🇯🇵 [日本語ユーザーマニュアル](public/MANUAL_NETMAJIK_JA.md)

---

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS (Custom Design System with Glassmorphism)
- **Runtime**: Electron (Windows Optimized)
- **Icons**: Lucide React
- **Build Tool**: Vite

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **Windows OS** (Required for system-level network configuration)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/JonAmA/NetMajik.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run in development mode**:
   ```bash
   npm run dev
   ```

4. **Start Electron App**:
   ```bash
   npm run electron
   ```

---

## 📂 Project Structure

- `/src/components`: UI components with modern aesthetics.
- `/src/hooks`: Custom React hooks for interface management and state logic.
- `/electron`: Main process logic for system-level operations and network commands.
- `/public`: Assets and iconography.

---

## 🛡️ License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.

---

<p align="center">
  Developed with ❤️ by <b>JonAmA</b>
</p>
