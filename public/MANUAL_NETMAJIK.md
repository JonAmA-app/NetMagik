# 📘 Manual Oficial de Usuario — NetMajik v1.0.9
**La Plataforma Integrada de Automatización, Gestión de Redes y Diagnóstico Informático**

---

## 📋 Índice General
1. [Introducción y Privilegios del Sistema](#1-introducción-y-privilegios-del-sistema)
2. [Barra Lateral e Interfaces de Red](#2-barra-lateral-e-interfaces-de-red)
3. [Gestión de Perfiles IP y Carpetas](#3-gestión-de-perfiles-ip-y-carpetas)
4. [Portapapeles Inteligente y Recortes (Snippets)](#4-portapapeles-inteligente-y-recortes-snippets)
5. [Suite de Conectividad y Diagnóstico (Ping, Traceroute y Mantenimiento)](#5-suite-de-conectividad-y-diagnóstico-ping-traceroute-y-mantenimiento)
6. [Descubrimiento de Red (Scanner, Mapa Interactivo e Inventario)](#6-descubrimiento-de-red-scanner-mapa-interactivo-e-inventario)
7. [Escáner de Puertos y Detección RTSP (CCTV)](#7-escáner-de-puertos-y-detección-rtsp-cctv)
8. [Estatus de Red Cloud e Internet](#8-estatus-de-red-cloud-e-internet)
9. [Bóveda de Credenciales por Defecto (Vault)](#9-bóveda-de-credenciales-por-defecto-vault)
10. [Monitor de Salud del Sistema y Antivirus de Hardware](#10-monitor-de-salud-del-sistema-y-antivirus-de-hardware)
11. [Accesos Directos de Windows y Consolas Administrativas](#11-accesos-directos-de-windows-y-consolas-administrativas)
12. [Calculadora de Subredes y Visualizador CIDR](#12-calculadora-de-subredes-y-visualizador-cidr)
13. [Gestor de Programas Instalados y Actualizaciones (Winget)](#13-gestor-de-programas-instalados-y-actualizaciones-winget)
14. [Configuración, Seguridad y Respaldos Encriptados](#14-configuración-seguridad-y-respaldos-encriptados)

---

## 1. Introducción y Privilegios del Sistema

NetMajik es una aplicación de escritorio diseñada para administradores de sistemas, ingenieros de red y técnicos de soporte informático. Permite gestionar adaptadores de red de Windows, configurar direcciones IP fijas o dinámicas (DHCP) en segundos, mapear redes locales, diagnosticar problemas de conectividad y mantener el equipo actualizado.

> **Privilegios de Administrador**: Debido a que NetMajik interactúa directamente con la pila TCP/IP de Windows, ejecutar la aplicación como **Administrador** es indispensable para aplicar perfiles IP, reiniciar hacia la BIOS o deshabilitar/habilitar adaptadores.

---

## 2. Barra Lateral e Interfaces de Red

### 🔌 Lista de Tarjetas de Red
Ubicada a la izquierda de la interfaz, detecta automáticamente todos los adaptadores físicos y virtuales instalados en el equipo:
- **Adaptadores Ethernet (LAN)**: Conexiones por cable.
- **Adaptadores Wi-Fi**: Conexiones inalámbricas.
- **Adaptadores Virtuales**: VPNs, Hyper-V, VMware, Docker, Tailscale, etc.

### 🔘 Botones y Controles de Interfaz
- **Selector de Interfaz**: Al hacer clic sobre una tarjeta, se selecciona como la interfaz activa sobre la cual se aplicarán los perfiles y diagnósticos.
- **Interruptor Encendido/Apagado (Toggle)**: Permite habilitar o deshabilitar administrativamente la tarjeta de red en Windows sin necesidad de abrir el Panel de Control.
- **Botón Refrescar (↻)**: Vuelve a escanear el sistema en busca de nuevas tarjetas de red o cambios de estado.
- **Identificador de Tipo**: Muestra la IP actual, máscara de red, dirección MAC física y nombre oficial de la tarjeta.

---

## 3. Gestión de Perfiles IP y Carpetas

El panel principal permite crear, organizar y aplicar configuraciones IP guardadas al instante.

### 📝 Creación y Edición de Perfiles
Al hacer clic en el botón **+ Crear Perfil**, se abre el formulario de configuración:
- **Nombre del Perfil**: Identificador personalizado (ej: *Oficina Central*, *Cámara IP 192.168.1.X*).
- **Carpeta (Opcional)**: Agrupa el perfil en una carpeta organizadora (ej: *Cliente A*, *Servidores*).
- **Tipo de IP**:
  - **Automático (DHCP)**: Solicita la configuración automáticamente al servidor DHCP de la red.
  - **Estático**: Permite definir manualmente:
    - **Dirección IP**: IP principal (ej: `192.168.1.50`).
    - **Máscara de Subred**: (ej: `255.255.255.0`).
    - **Puerta de Enlace (Gateway)**: (Opcional).
    - **DNS Primario y Secundario**: (ej: `8.8.8.8`, `1.1.1.1`).
    - **IPs Adicionales (Alias/Multi-IP)**: Agrega múltiples direcciones IP secundarias con sus respectivas máscaras en la misma tarjeta de red.

### ⚡ Aplicación Inteligente y Resolución de Conflictos
- **Botón Aplicar (✓)**: Asigna la configuración a la tarjeta seleccionada.
- **Liberación Automática de IP**: Si la IP a aplicar ya está asignada a otra tarjeta (ej: asignada por error a Wi-Fi antes de conectarse a LAN), NetMajik libera automáticamente la IP de la tarjeta en conflicto cambiándola a DHCP para evitar que Windows bloquee la operación.

### 📂 Carpetas y Arrastrar / Soltar (Drag & Drop)
- **Desplegar/Colapsar Carpeta**: Haz clic en el encabezado de la carpeta para ocultar o mostrar sus perfiles.
- **Reordenación de Carpetas**: Arrastra el encabezado de una carpeta para cambiar su posición relativa a otros bloques.
- **Reordenación de Perfiles dentro de la Carpeta**: Arrastra directamente cualquier tarjeta de perfil dentro de una carpeta para cambiar su orden de prioridad.

---

## 4. Portapapeles Inteligente y Recortes (Snippets)

Almacena fragmentos de texto de uso frecuente como servidores DNS, comandos de terminal o contraseñas.

### 🛠️ Funciones del Portapapeles
- **+ Añadir Recorte**: Crea una nueva entrada con una etiqueta y su valor.
- **Icono Ojo (👁️)**: Oculta o revela valores sensibles (ej: claves).
- **Copiar con 1-Clic**: Copia el texto directamente al portapapeles de Windows.
- **Atajos de Teclado Globales**: Asigna una combinación de teclas (ej: `Ctrl+Alt+1`) para copiar o escribir automáticamente el contenido en la ventana activa (*Auto-paste*).

---

## 5. Suite de Conectividad y Diagnóstico (Ping, Traceroute y Mantenimiento)

### 🛰️ Herramienta de Ping
- **Destino Único o Rango**: Realiza peticiones ICMP a una IP o rango.
- **Métricas en Tiempo Real**: Latencia actual, mínima, máxima, media y % de pérdida de paquetes.
- **Histórico Gráfico**: Muestra el comportamiento del ping a lo largo del tiempo.

### 🛤️ Traceroute
- Muestra de forma visual todos los saltos (*hops*) que recorren los paquetes de datos desde tu PC hasta un servidor de destino, identificando cuellos de botella o caídas de enlaces intermedias.

### 🧹 Botones de Mantenimiento de Red Rápidos
- **Limpiar Caché DNS (`ipconfig /flushdns`)**: Borra los registros DNS locales para resolver problemas de carga de dominios.
- **Reiniciar Winsock (`netsh winsock reset`)**: Repara la pila de sockets de Windows dañada por malware o errores de controladores.
- **Liberar/Renovar IP (`release / renew`)**: Solicita una nueva IP al router.

---

## 6. Descubrimiento de Red (Scanner, Mapa Interactivo e Inventario)

### 🔍 Escáner de Red Local
- **Rango de Escaneo**: Permite definir una subred (ej: `192.168.1.1` - `192.168.1.254`).
- **Detección Automática**: Identifica la dirección IP, dirección MAC, nombre de host y el **Fabricante (Vendor)** resolviendo la base de datos oficial IEEE OUI (Hikvision, Cisco, Apple, Intel, etc.).

### 📌 Fijar a Inventario de Perfil
- Selecciona uno o más dispositivos descubiertos y guárdalos dentro del inventario de un perfil específico para llevar un registro técnico permanente.

### 🗺️ Mapa de Red Interactivo
- Genera un diagrama topológico visual con los nodos descubiertos en la red.
- Permite hacer zoom con la rueda del ratón y arrastrar el plano para explorar la topología.

---

## 7. Escáner de Puertos y Detección RTSP (CCTV)

- **Escaneo de Puertos Comunes**: Comprueba la apertura de puertos como `80` (HTTP), `443` (HTTPS), `22` (SSH), `21` (FTP), `3389` (RDP), etc.
- **Detección Especial RTSP (Puerto 554)**: Si el puerto 554 está abierto (común en cámaras de videovigilancia IP y NVRs), la aplicación sugiere enlaces directo `rtsp://` compatibles para visualizar el vídeo en programas como VLC.

---

## 8. Estatus de Red Cloud e Internet

- **IP Pública**: Muestra la dirección IP pública visible en Internet.
- **Información del Proveedor (ISP)**: Muestra la empresa proveedora de servicios de Internet, país, región y número de Sistema Autónomo (ASN).
- **Prueba de Jitter y Calidad**: Muestra la estabilidad de la conexión para videollamadas o streaming.

---

## 9. Bóveda de Credenciales por Defecto (Vault)

- Base de datos sin conexión con usuarios y contraseñas por defecto de los principales fabricantes del mercado (Hikvision, Dahua, Cisco, Ubiquiti, Mikrotik, TP-Link, etc.).
- **Smart Connect (Conexión Inteligente)**: Configura la IP de tu PC de forma temporal en la subred de la credencial seleccionada para que puedas acceder al panel web de administración del equipo sin cambiar tu perfil habitual.

---

## 10. Monitor de Salud del Sistema y Antivirus de Hardware

### 📊 Monitor de Hardware
- Muestra el modelo del procesador, uso de CPU en tiempo real, ocupación de RAM, ranuras ocupadas y salud de los discos de almacenamiento.

### ⚡ Reiniciar a BIOS / UEFI
- Botón seguro que reinicia inmediatamente Windows y entra directamente en la pantalla de configuración del Firmware UEFI de la placa base.

### 🛡️ Antivirus de Hardware / Visor de Eventos Inteligente
- Analiza periódicamente el registro de eventos del sistema de Windows (`Get-WinEvent`).
- Clasifica errores críticos de hardware (BSOD / Pantallazos azueles, fallos de alimentación, errores de disco VSS o degradación de almacenamiento).
- **Generador de Prompts IA**: Permite copiar un texto explicativo formateado para consultarle a una IA (como ChatGPT, Gemini o Claude) la solución exacta del código de error detectado.

---

## 11. Accesos Directos de Windows y Consolas Administrativas

Acceso de un solo clic a las herramientas nativas de administración del sistema sin memorizar comandos:
- **Consola de Adaptadores (`ncpa.cpl`)**
- **Administrador de Dispositivos (`devmgmt.msc`)**
- **Firewall de Windows (`firewall.cpl`)**
- **Editor del Registro (`regedit.exe`)**
- **Visor de Eventos (`eventvwr.msc`)**
- **Añadir Accesos Personalizados**: Agrega cualquier ejecutable `.exe`, `.cpl`, `.msc` o script `.bat`.

---

## 12. Calculadora de Subredes y Visualizador CIDR

- Selecciona el prefijo CIDR (desde `/8` hasta `/32`).
- Muestra instantáneamente la máscara de subred, número total de hosts útiles, IP de red, IP de broadcast, máscara wildcard y representación binaria.

---

## 13. Gestor de Programas Instalados y Actualizaciones (Winget)

- **Inventario de Software**: Lista todos los programas instalados en la máquina, permitiendo filtrar entre aplicaciones del sistema y de terceros.
- **Exportación**: Exporta el inventario en formato CSV o JSON.
- **Buscador de Actualizaciones Winget**: Consulta el repositorio oficial de Microsoft Winget en busca de versiones más recientes de tus programas instalados y permite actualizarlos en segundo plano de forma desatendida.

---

## 14. Configuración, Seguridad y Respaldos Encriptados

### 🎨 Temas e Idioma
- **4 Temas Visuales**: Dark (Oscuro), Light (Claro), Matrix (Cyberpunk) y Sakura (Kawaii).
- **7 Idiomas Soportados**: Español, Inglés, Português, Deutsch, Français, 中文 (Chino) y 日本語 (Japonés).

### 🔒 Seguridad con Contraseña Maestra
- Permite bloquear el acceso a la aplicación o requerir contraseña para abrir los Ajustes del Sistema, ver recortes sensibles o al volver del modo suspensión.

### 💾 Respaldos Encriptados (.netmajik)
- Permite exportar e importar todos los perfiles, recortes, credenciales y accesos directos. Los archivos se pueden cifrar con contraseña utilizando encriptación AES.
