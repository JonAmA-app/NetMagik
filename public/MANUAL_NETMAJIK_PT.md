# 📘 Manual Oficial do Utilizador — NetMajik v1.0.9
**Plataforma Integrada de Automatização, Gestão de Redes e Diagnóstico de Sistemas**

*Repositório Oficial no GitHub: [https://github.com/JonAmA-app/NetMagik](https://github.com/JonAmA-app/NetMagik)*

---

## 📋 Índice Geral
1. [Introdução e Privilégios do Sistema](#1-introdução-e-privilégios-do-sistema)
2. [Barra Lateral e Interfaces de Rede](#2-barra-lateral-e-interfaces-de-rede)
3. [Gestão de Perfis IP e Pastas](#3-gestão-de-perfis-ip-e-pastas)
4. [Área de Transferência Inteligente e Snippets](#4-área-de-transferência-inteligente-e-snippets)
5. [Suite de Conectividade e Diagnóstico (Ping, Traceroute e Manutenção)](#5-suite-de-conectividade-e-diagnóstico-ping-traceroute-e-manutenção)
6. [Descoberta de Rede (Scanner, Mapa Interativo e Inventário)](#6-descoberta-de-rede-scanner-mapa-interativo-e-inventário)
7. [Escâner de Portas e Deteção RTSP (CCTV)](#7-escâner-de-portas-e-deteção-rtsp-cctv)
8. [Estatuto da Rede Cloud e Internet](#8-estatuto-da-rede-cloud-e-internet)
9. [Cofre de Credenciais de Fábrica (Vault)](#9-cofre-de-credenciais-de-fábrica-vault)
10. [Monitor de Saúde do Sistema e Antivírus de Hardware](#10-monitor-de-saúde-do-sistema-e-antivírus-de-hardware)
11. [Atalhos do Windows e Consolas de Administração](#11-atalhos-do-windows-e-consolas-de-administração)
12. [Calculadora de Sub-redes e Visualizador CIDR](#12-calculadora-de-sub-redes-e-visualizador-cidr)
13. [Programas Instalados e Atualizações de Software (Winget)](#13-programas-instalados-e-atualizações-de-software-winget)
14. [Definições, Segurança e Cópias de Segurança Encriptadas](#14-definições-segurança-e-cópias-de-segurança-encriptadas)

---

## 1. Introdução e Privilégios do Sistema

O NetMajik é uma aplicação de ambiente de trabalho desenvolvida para administradores de sistemas, engenheiros de rede e técnicos de suporte informático. Permite gerir adaptadores de rede do Windows, configurar perfis de IP estático ou DHCP em segundos, mapear redes locais e diagnosticar falhas de conectividade.

> **Privilégios de Administrador**: Como o NetMajik interage diretamente com a pilha TCP/IP do Windows, executar a aplicação como **Administrador** é indispensável para aplicar perfis IP, reiniciar para o BIOS ou desativar adaptadores.

---

## 2. Barra Lateral e Interfaces de Rede

- **Lista de Adaptadores**: Deteta adaptadores Ethernet (LAN), Wi-Fi e Virtuais (VPN, Docker, VMware).
- **Controlos**: Permite ativar/desativar placas de rede, selecionar a interface ativa e atualizar a lista.

---

## 3. Gestão de Perfis IP e Pastas

- **Criação de Perfis**: Configure IP estático, DHCP, Máscara, Gateway, DNS Primário/Secundário e IPs Adicionais (Multi-IP).
- **Resolução Automática de Conflitos**: Se uma IP estiver atribuída a outra placa (ex: Wi-Fi), o NetMajik altera essa placa em conflito para DHCP automaticamente.
- **Arraste e Solte em Pastas**: Reordene pastas e perfis arrastando as placas diretamente dentro da pasta.

---

## 4. Área de Transferência Inteligente e Snippets

- Guarde IPs, comandos e palavras-passe com ocultação de dados, cópia com 1 clique e colagem automática via atalho global.

---

## 5. Suite de Conectividade e Diagnóstico

- **Ping e Traceroute**: Gráficos de latência em tempo real e rastreio de saltos de rede.
- **Manutenção**: Limpeza de DNS (`flushdns`), reposição do Winsock e renovação de IP.

---

## 6. Descoberta de Rede e Inventário

- Escâner de sub-rede com resolução de fabricantes IEEE OUI (Hikvision, Cisco, Apple, Intel).
- Mapa topológico interativo com zoom e fixação de dispositivos ao inventário.

---

## 7. Escâner de Portas e Deteção RTSP (CCTV)

- Verificação de portas abertas (80, 443, 22, 3389) e geração de URLs `rtsp://` para câmaras de segurança.

---

## 8. Cofre de Credenciais e Saúde do Sistema

- Palavras-passe padrão de fabricantes e recurso *Smart Connect*.
- Monitorização de CPU/RAM/Disco, reinício seguro para BIOS e gerador de Prompts IA para erros do Windows.

---

## 9. Definições e Cópias de Segurança Encriptadas

- 4 Temas, 7 Idiomas e cópias de segurança cifradas `.netmajik` (AES).

---
*Repositório no GitHub: [https://github.com/JonAmA-app/NetMagik](https://github.com/JonAmA-app/NetMagik)*
