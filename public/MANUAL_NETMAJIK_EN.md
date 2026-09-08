# 📘 Official User Manual — NetMajik v1.0.9
**Integrated Workstation Platform for Automation, Network Management & System Diagnostics**

*Official GitHub Repository: [https://github.com/JonAmA-app/NetMagik](https://github.com/JonAmA-app/NetMagik)*

---

## 📋 Table of Contents
1. [Introduction & System Privileges](#1-introduction--system-privileges)
2. [Sidebar & Network Interfaces](#2-sidebar--network-interfaces)
3. [IP Profile Management & Folders](#3-ip-profile-management--folders)
4. [Smart Clipboard & Snippets](#4-smart-clipboard--snippets)
5. [Connectivity & Diagnostics Suite (Ping, Traceroute & Maintenance)](#5-connectivity--diagnostics-suite-ping-traceroute--maintenance)
6. [Network Discovery (Scanner, Interactive Map & Inventory)](#6-network-discovery-scanner-interactive-map--inventory)
7. [Port Scanner & RTSP Detection (CCTV)](#7-port-scanner--rtsp-detection-cctv)
8. [Cloud & Internet Status](#8-cloud--internet-status)
9. [Default Credentials Vault](#9-default-credentials-vault)
10. [System Health Monitor & Hardware Antivirus](#10-system-health-monitor--hardware-antivirus)
11. [Windows Shortcuts & Administrative Consoles](#11-windows-shortcuts--administrative-consoles)
12. [Subnet Calculator & CIDR Visualizer](#12-subnet-calculator--cidr-visualizer)
13. [Installed Programs & Software Updates (Winget)](#13-installed-programs--software-updates-winget)
14. [Settings, Security & Encrypted Backups](#14-settings-security--encrypted-backups)

---

## 1. Introduction & System Privileges

NetMajik is a desktop application built for system administrators, network engineers, and IT support technicians. It allows you to manage Windows network adapters, set static or DHCP IP profiles in seconds, map local networks, diagnose connectivity issues, and keep software updated.

> **Administrator Privileges**: Because NetMajik interacts directly with the Windows TCP/IP stack, running the application as **Administrator** is required to apply IP profiles, reboot to BIOS, or enable/disable network adapters.

---

## 2. Sidebar & Network Interfaces

### 🔌 Network Adapter List
Located on the left panel, it automatically detects all physical and virtual network adapters installed on your PC:
- **Ethernet Adapters (LAN)**: Wired connections.
- **Wi-Fi Adapters**: Wireless connections.
- **Virtual Adapters**: VPNs, Hyper-V, VMware, Docker, Tailscale, etc.

### 🔘 Adapter Controls
- **Interface Selection**: Click any adapter card to select it as the active interface for applying profiles and running diagnostics.
- **Enable/Disable Toggle**: Administratively enable or disable the network card in Windows without opening Control Panel.
- **Refresh Button (↻)**: Rescans the system for new adapters or state changes.
- **Status Info**: Displays current IP, subnet mask, physical MAC address, and official adapter name.

---

## 3. IP Profile Management & Folders

### 📝 Profile Creation & Editing
Click **+ Create Profile** to configure a profile:
- **Profile Name**: Custom name (e.g. *Main Office*, *CCTV Subnet 192.168.1.X*).
- **Folder (Optional)**: Group profiles in folders (e.g. *Client A*, *Servers*).
- **IP Mode**:
  - **Automatic (DHCP)**: Requests IP configuration automatically from the network DHCP server.
  - **Static**: Manually set Primary IP, Subnet Mask, Gateway, Primary & Secondary DNS, and Additional IPs (Multi-IP Alias).

### ⚡ Auto IP Conflict Resolution
- **Apply Profile (✓)**: Applies settings to the selected card.
- **Auto Release**: If the target static IP is assigned to another adapter (e.g. Wi-Fi adapter), NetMajik automatically releases the conflicting IP by switching that adapter to DHCP, avoiding Windows configuration lock errors.

### 📂 Folders & Drag-and-Drop
- Reorder whole folders or drag-and-drop individual profile cards inside a folder to prioritize their display order.

---

## 4. Smart Clipboard & Snippets

Store frequently used strings such as DNS IPs, terminal scripts, or passwords.
- **+ Add Snippet**: Save label and value.
- **Eye Toggle (👁️)**: Show/hide secret strings.
- **One-Click Copy & Global Hotkeys**: Copy instantly or auto-paste into active windows via hotkey.

---

## 5. Connectivity & Diagnostics Suite (Ping, Traceroute & Maintenance)

- **ICMP Ping**: Single IP or IP range ping with real-time stats (Min, Max, Avg, Loss %) and graphical latency history.
- **Traceroute**: Visual hop-by-hop path tracing to detect network bottlenecks.
- **Quick Maintenance**: One-click `ipconfig /flushdns`, `netsh winsock reset`, and `release/renew`.

---

## 6. Network Discovery (Scanner, Interactive Map & Inventory)

- **Subnet Scanner**: Sweeps IP ranges, resolving MAC addresses, Hostnames, and Manufacturer Vendors via IEEE OUI.
- **Pin to Inventory**: Save discovered devices to a profile's inventory.
- **Interactive Topographic Map**: Visual node map with pan and zoom controls.

---

## 7. Port Scanner & RTSP Detection (CCTV)

- **Port Scanner**: Check common ports (80, 443, 22, 21, 3389) or custom ranges.
- **RTSP Camera Scanner**: Detects open port 554 and generates direct `rtsp://` URLs for VLC media player.

---

## 8. Cloud & Internet Status

- Displays Public IP, ISP Provider, Region, ASN, and connection jitter/stability metrics.

---

## 9. Default Credentials Vault

- Offline database of factory default logins for Hikvision, Dahua, Cisco, Ubiquiti, Mikrotik, etc.
- **Smart Connect**: Automatically sets a temporary IP matching the device subnet for quick Web UI access.

---

## 10. System Health Monitor & Hardware Antivirus

- Real-time CPU, RAM, Disk Health & Storage Bitmap analysis.
- **Reboot to BIOS**: Safe one-click restart directly into UEFI Firmware Settings.
- **Hardware Antivirus (System Events)**: Monitors critical Windows Event Logs (BSOD, VSS, Disk, Power failures) and provides an **AI Prompt Generator** to query solutions.

---

## 11. Windows Shortcuts & Administrative Consoles

- One-click launch for `ncpa.cpl`, `devmgmt.msc`, `firewall.cpl`, `regedit.exe`, `eventvwr.msc`, `taskmgr.exe`, and custom executables.

---

## 12. Subnet Calculator & CIDR Visualizer

- Select CIDR prefixes (`/8` to `/32`) to view usable IP range, Network IP, Broadcast IP, Wildcard mask, and binary representation.

---

## 13. Installed Programs & Software Updates (Winget)

- List and filter installed apps, export to CSV/JSON, and run unattended updates via official Microsoft Winget.

---

## 14. Settings, Security & Encrypted Backups

- 4 Themes (Dark, Light, Matrix, Sakura), 7 Languages, Master Password protection, and AES encrypted `.netmajik` backup files.

---
*NetMajik GitHub Repository: [https://github.com/JonAmA-app/NetMagik](https://github.com/JonAmA-app/NetMagik)*
