# 🗺️ Índice del Proyecto — NetMajik

> **Referencia rápida** de dónde está cada cosa en el código fuente.  
> Actualizado: octubre 2026

---

## 📁 Estructura raíz

```
NetMajik en desarrollo/
├── electron/               ← Proceso principal de Electron (Node.js)
├── src/                    ← Frontend React / TypeScript
│   ├── components/         ← Todos los componentes de pantalla
│   ├── hooks/              ← Custom React hooks
│   ├── context/            ← Contextos React (Toast, etc.)
│   └── ...
├── public/                 ← Activos estáticos (iconos, etc.)
├── build/                  ← Recursos de build (instalador)
├── dist/                   ← Salida de Vite (generado)
├── release/                ← Salida del empaquetador Electron
├── index.html              ← Entry point HTML
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## ⚡ Electron (proceso principal)

| Archivo | Descripción |
|---------|-------------|
| `electron/main.js` | **Punto de entrada Electron.** Ventana principal, TitleBar, menú bandeja (tray), atajos globales, IPCs principales |
| `electron/preload.js` | Bridge seguro entre renderer y main. Expone `window.electronAPI` |

### IPCs principales registrados en `main.js`

| Canal IPC | Función |
|-----------|---------|
| `get-windows-interfaces` | Lista interfaces de red con IPs (netsh) |
| `apply-network-config` | Aplica IP estática / DHCP (netsh) |
| `scan-network` | Escaneo ARP / ping-sweep de la subred |
| `ping-host` | Ping a host/IP |
| `get-system-health` | CPU, RAM, disco, temperatura |
| `get-system-events` | Eventos del visor de eventos de Windows |
| `scan-ports` | Escaneo de puertos TCP |
| `run-traceroute` | Traceroute a destino |
| `get-installed-programs` | Lista programas instalados |
| `check-for-updates` | Comprueba actualizaciones GitHub |
| `show-notification` | Notificación del sistema |
| `window-manage` | Minimizar / maximizar / cerrar |

---

## 🎨 Frontend — `src/`

### Archivos raíz de `src/`

| Archivo | Descripción |
|---------|-------------|
| `src/App.tsx` | **Componente raíz.** Estado global, routing de vistas, lógica de perfiles, settings, tours |
| `src/index.tsx` | Entry point React (monta `<App />` y contextos) |
| `src/types.ts` | **Todos los tipos TypeScript** del proyecto |
| `src/constants.ts` | Traducciones (`TRANSLATIONS`), perfiles iniciales, credenciales, snippets, `APP_VERSION` |
| `src/onboardingCatalog.ts` | Contenido de los **14 tours de bienvenida** en 7 idiomas |
| `src/utils.ts` | Utilidades: `encryptData`, `decryptData`, formatters |
| `src/mac-vendors.tsx` | Base de datos OUI de fabricantes MAC |
| `src/index.css` | CSS global: animaciones custom, scrollbars, gradientes |
| `src/themes.css` | Variables CSS por tema (dark, light, sakura, matrix...) |

---

## 🧩 Componentes — `src/components/`

### Pantallas principales (vistas)

| Componente | Vista (`activeView`) | Descripción |
|------------|----------------------|-------------|
| `BasicDashboard.tsx` | modo básico | Dashboard principal modo básico: tarjetas de herramientas, interfaces, perfiles rápidos |
| `Dashboard.tsx` | `dashboard` | Dashboard modo avanzado: estadísticas resumen |
| `ProfileList.tsx` | `profiles` | Gestión de perfiles de red (lista, aplicar, crear, carpetas) |
| `ConnectivityHub.tsx` | `connectivity` | Ping + Traceroute integrado |
| `NetworkScanner.tsx` | `scanner` | Escáner de red (ARP/ICMP), tabla de dispositivos, fabricantes |
| `CredentialLibrary.tsx` | `credentials` | Librería de credenciales de equipos |
| `ClipboardManager.tsx` | `clipboard` | Portapapeles inteligente (snippets) |
| `InternetStatus.tsx` | `internet` | Estado de salida a Internet / WAN |
| `PortScanner.tsx` | `port-scanner` | Escáner de puertos TCP |
| `SystemHealth.tsx` | `system` | Salud del PC: CPU, RAM, discos, temperatura |
| `SystemEvents.tsx` | `system-events` | Visor de eventos de Windows |
| `SubnetCalculator.tsx` | `subnet` | Calculadora de subredes |
| `NetworkCommands.tsx` | `commands` | Comandos de red rápidos (CMD/PowerShell) |
| `WindowsShortcuts.tsx` | `win-shortcuts` | Atajos y scripts de Windows |
| `InstalledPrograms.tsx` | `programs` | Programas instalados |
| `InventoryManager.tsx` | `inventory` | Inventario de dispositivos |
| `NetworkMap.tsx` | `network-map` | Mapa visual de la red |
| `IpRangeButtons.tsx` | `ip-ranges` | Panel de asignación rápida de IP (Quick IP) |
| `ExternalAppLauncher.tsx` | `launcher` | Lanzador de aplicaciones externas |
| `ToolsManager.tsx` | `tools` | Gestión del orden/favoritos de herramientas |
| `HelpGuide.tsx` | modal `isHelpOpen` | Guía de ayuda completa + lista de tours |
| `PingManager.tsx` | `ping-manager` | Gestor multi-ping avanzado |
| `TrafficMonitor.tsx` | `traffic` | Monitor de tráfico de red |

### Componentes UI / Modales

| Componente | Descripción |
|------------|-------------|
| `TitleBar.tsx` | Barra de título personalizada (botones min/max/close, modo toggle, búsqueda global) |
| `InterfaceCard.tsx` | Tarjeta de interfaz de red individual |
| `CreateProfileForm.tsx` | Formulario de creación/edición de perfil |
| `SettingsModal.tsx` | Modal de configuración: tema, idioma, seguridad, export/import |
| `DonationModal.tsx` | Modal de donación |
| `ConfirmModal.tsx` | Modal de confirmación genérico |
| `InputModal.tsx` | Modal de entrada de texto genérico |
| `GlobalSearch.tsx` | Búsqueda global Ctrl+K (perfiles, IPs, dispositivos, credenciales) |
| `ToastNotification.tsx` | Notificaciones toast (éxito/error/info) |
| `OnboardingTour.tsx` | Overlay interactivo del tour de bienvenida (spotlight + tooltip) |
| `EasterEggTracker.tsx` | Sistema de logros / Easter Eggs ocultos |

---

## 🪝 Hooks — `src/hooks/`

| Hook | Descripción |
|------|-------------|
| `useInterfaces.ts` | Carga y refresco de interfaces de red via IPC |
| `useNetworkOps.ts` | Operaciones de red: aplicar perfil, reasignar IP, DHCP |
| `useLocalStorage.ts` | Hook de persistencia con `localStorage` |

---

## 📐 Tipos clave — `src/types.ts`

| Tipo | Descripción |
|------|-------------|
| `Profile` | Perfil de red (nombre, IP, máscara, gateway, tipo DHCP/Static, carpeta) |
| `NetworkInterface` | Interfaz de red (nombre, IP actual, estado, gateway, máscara, IPs adicionales) |
| `AppSettings` | Configuración de la app (tema, idioma, modo, seenOnboardings, atajos...) |
| `ClipboardSnippet` | Snippet del portapapeles (texto, categoría, favorito) |
| `DeviceCredential` | Credencial de dispositivo (marca, modelo, usuario, contraseña, IP por defecto) |
| `ScannedDevice` | Dispositivo descubierto en escaneo (IP, MAC, hostname, fabricante, latencia) |
| `OnboardingTourConfig` | Configuración de un tour (id, título, pasos) |
| `OnboardingStep` | Paso individual del tour (targetSelector, título, contenido, posición) |
| `Language` | 'es' or 'en' or 'pt' or 'de' or 'fr' or 'zh' or 'ja' |
| `IpType` | DHCP o STATIC |

---

## 🎨 Temas — `src/themes.css`

Los temas se aplican como atributo `data-theme` en el `<html>`.

| Variable | Uso |
|----------|-----|
| `--bg-primary` | Fondo principal |
| `--bg-secondary` | Fondo de paneles/cards |
| `--bg-tertiary` | Fondo de inputs/items |
| `--text-primary` / `--text-secondary` / `--text-muted` | Jerarquía de texto |
| `--border-primary` / `--border-secondary` | Bordes |
| `--brand-primary` / `--brand-hover` | Color de marca |

Temas disponibles: `dark`, `light`, `sakura`, `matrix`, `ocean`, `sunset`, `forest`

---

## 🌍 Internacionalización

- Traducciones en `src/constants.ts` → objeto `TRANSLATIONS`
- Idiomas: `es`, `en`, `pt`, `de`, `fr`, `zh`, `ja`
- Tours de onboarding: sus propias traducciones en `src/onboardingCatalog.ts`
- Se selecciona en `settings.language`

---

## 🚀 Scripts npm

| Comando | Acción |
|---------|--------|
| `npm run dev` | Vite dev server (solo frontend) |
| `npm run build` | Build de producción (Vite) |
| `npm run electron:dev` | Electron + Vite en desarrollo |
| `npm run electron:build` | Empaquetado completo (NSIS/AppImage) |

---

## 🔑 Flujos importantes en `App.tsx`

### Routing de vistas
- `activeView` (string) controla qué componente se renderiza en `<main>`
- Modo básico → `BasicDashboard` (con `onSelectView`)
- Modo avanzado → Barra lateral con pestañas

### Perfiles de red
- Almacenados en `localStorage` via `useLocalStorage`
- Aplicar perfil → `useNetworkOps.applyProfile()` → IPC `apply-network-config`

### Onboarding Tours
- `activeTour` (estado) → si tiene valor, muestra `<OnboardingTour />`
- `settings.seenOnboardings` guarda los IDs ya completados
- Los tours se pueden relanzar desde `HelpGuide.tsx`

### Búsqueda global (Ctrl+K)
- `isGlobalSearchOpen` → abre `<GlobalSearch />`
- Atajo registrado también en `electron/main.js` (global hotkey)

---

## 📋 Notas de desarrollo

**Añadir nuevo IPC:**
1. Registrar handler en `electron/main.js` con `ipcMain.handle`
2. Exponer en `electron/preload.js` via `contextBridge`
3. Declarar en la interfaz `Window.electronAPI` en `src/types.ts`

**IDs para tours (targetSelector):**
Los IDs HTML usados por los tours (`#mode-toggle-btn`, `#network-interfaces-card`, etc.) deben estar presentes en el DOM cuando el tour se activa. Si no existen, el spotlight no aparece pero el tour sigue funcionando centrado.

**Aviso sobre `constants.ts`:**
El archivo es muy grande (~300 KB). Si se añaden muchas traducciones, considerar dividirlo en módulos por idioma.
