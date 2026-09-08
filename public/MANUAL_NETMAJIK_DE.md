# 📘 Offizielles Benutzerhandbuch — NetMajik v1.0.8
**Integrierte Plattform für Automatisierung, Netzwerkverwaltung & Systemdiagnose**

*Offizielles GitHub-Repository: [https://github.com/JonAmA-app/NetMagik](https://github.com/JonAmA-app/NetMagik)*

---

## 📋 Inhaltsverzeichnis
1. [Einführung & Systemrechte](#1-einführung--systemrechte)
2. [Seitenleiste & Netzwerkschnittstellen](#2-seitenleiste--netzwerkschnittstellen)
3. [IP-Profilverwaltung & Ordner](#3-ip-profilverwaltung--ordner)
4. [Intelligente Zwischenablage & Snippets](#4-intelligente-zwischenablage--snippets)
5. [Konnektivität & Diagnose-Suite (Ping, Traceroute & Wartung)](#5-konnektivität--diagnose-suite-ping-traceroute--wartung)
6. [Netzwerkerkennung (Scanner, Interaktive Karte & Inventar)](#6-netzwerkerkennung-scanner-interaktive-karte--inventar)
7. [Port-Scanner & RTSP-Erkennung (CCTV)](#7-port-scanner--rtsp-erkennung-cctv)
8. [Cloud- & Internet-Status](#8-cloud---internet-status)
9. [Tresor für Standard-Anmeldedaten (Vault)](#9-tresor-für-standard-anmeldedaten-vault)
10. [Systemzustandsmonitor & Hardware-Antivirus](#10-systemzustandsmonitor--hardware-antivirus)
11. [Windows-Verknüpfungen & Verwaltungskonsolen](#11-windows-verknüpfungen--verwaltungskonsolen)
12. [Subnetzrechner & CIDR-Visualisierung](#12-subnetzrechner--cidr-visualisierung)
13. [Installierte Programme & Software-Updates (Winget)](#13-installierte-programme--software-updates-winget)
14. [Einstellungen, Sicherheit & Verschlüsselte Backups](#14-einstellungen-sicherheit--verschlüsselte-backups)

---

## 1. Einführung & Systemrechte

NetMajik ist eine Desktop-Anwendung für Systemadministratoren und Netzwerktechniker. Sie ermöglicht die Verwaltung von Windows-Netzwerkadaptern, das Konfigurieren von statischen oder DHCP-IP-Profilen in Sekundenschnelle und die Diagnose von Verbindungsfehlern.

> **Administratorrechte**: Da NetMajik direkt mit dem Windows-TCP/IP-Stack interagiert, ist das Ausführen der Anwendung als **Administrator** erforderlich.

---

## 2. Seitenleiste & Netzwerkschnittstellen

- **Netzwerkadapter-Liste**: Erkennt Ethernet (LAN), WLAN und virtuelle Adapter (VPN, Docker, VMware).
- **Steuerung**: Schnittstellen aktivieren/deaktivieren, auswählen und aktualisieren.

---

## 3. IP-Profilverwaltung & Ordner

- **Profilerstellung**: Konfigurieren Sie statische IP, DHCP, Subnetzmaske, Gateway, DNS und zusätzliche IPs (Multi-IP).
- **Automatische Konfliktlösung**: Bei IP-Konflikten mit anderen Adaptern setzt NetMajik den in Konflikt stehenden Adapter automatisch auf DHCP.
- **Ordner Drag-and-Drop**: Sortieren Sie Ordner und Profile per Drag-and-Drop innerhalb der Ordnerstruktur.

---

## 4. Intelligente Zwischenablage & Snippets

- Speichern von DNS-IPs, Befehlen und Passwörtern mit 1-Klick-Kopieren und automatischer Einfügefunktion über globale Hotkeys.

---

## 5. Konnektivität & Diagnose-Suite

- **Ping & Traceroute**: Echtzeit-Latenzgraphen und Pfadverfolgung.
- **Schnellwartung**: `ipconfig /flushdns`, Winsock-Reset und IP-Freigabe/-Erneuerung.

---

## 6. Netzwerkerkennung & Tresor

- Erkennung von Herstellern (IEEE OUI) für IP-Kameras, Router und Switche.
- Herstellerspezifische Standardpasswörter mit *Smart Connect*-Funktion.

---
*GitHub-Repository: [https://github.com/JonAmA-app/NetMagik](https://github.com/JonAmA-app/NetMagik)*
