---
name: depurar-traducciones
description: audita archivos de idioma para identificar claves faltantes, variables rotas y problemas de formato, aplicando correcciones estructuradas y manteniendo la coherencia.
---

# Depurador de Traducciones

## Cuándo usar este skill
- cuando el usuario reporte que un texto sale roto o sin traducir en la interfaz (ej. `translation_key_missing`).
- cuando se necesite sincronizar o comparar un archivo de idioma contra el archivo base (ej. `es.json` vs `en.json`).
- cuando haya reportes de variables de interpolación rotas (ej. `{count}`, `%s`) que crashean la aplicación en ciertos idiomas.
- cuando un archivo de localización tenga errores de sintaxis o de formato.

## Inputs necesarios
- Ruta del archivo de idioma base (el origen de la verdad, ej. `en.json`).
- Ruta del archivo de idioma a depurar/traducir (ej. `es.json`).
- Tipo de incidencia a buscar (claves faltantes, sintaxis rota, variables erróneas, o revisión general profunda).

## Workflow
1) **Plan**: Cargar en memoria el archivo de idioma base y el defectuoso. Listar cuántas claves totales tiene cada uno para evaluar el nivel de desincronización.
2) **Validar**: Identificar tres tipos de errores clave: 1) Claves existentes en base pero no en destino. 2) Discrepancia en el uso de variables internas (`{var}`, `%d`). 3) Truncamiento o error de sintaxis JSON.
3) **Ejecutar**: Traducir las claves faltantes respetando el tono técnico o contextual actual, y reparar cualquier variable rota asegurando que coincida exactamente con la sintaxis del archivo base.
4) **Revisar**: Validar rigurosamente que el resultado sea un JSON válido o la estructura que el framework de la app exija.

## Instrucciones
- Nunca modifiques el archivo de idioma base al depurar.
- Al traducir o reparar un string, las variables (ej: `{{name}}`, `$1`, `%{count}`) **DEBEN** mantenerse idénticas y sin alteraciones de espacio o mayúsculas.
- Si el documento usa formato anidado (objetos dentro de objetos), debes respetar el mismo árbol exactamente; nunca "aplastar" el JSON a una estructura plana a menos que el usuario lo requiera.
- Si se detectan inconsistencias donde una traducción existe pero no coincide el tipo de dato (string vs array), alinea el destino al esquema base.
- Si hay dudas sobre el tono contextual, asume un tono neutro o pregunta al usuario antes de reescribir docenas de líneas de código.
- Nivel de libertad **Baja**: El objetivo es arreglar y sincronizar, no hacer copywriting creativo.

## Manejo de errores
Si al inyectar o verificar las traducciones el validador JSON falla o sobra/falta una coma, vuelve al paso 3, revisa el escape de caracteres (como comillas dobles `"`) en los strings traducidos y re-genera. Si una interpolación sigue fallando, pide ayuda humana para el contexto en lugar de adivinar el motor de plantillas.

## Output (formato exacto)
Devuelve un reporte en markdown que contenga:
1. **Resumen de depuración**: `# de claves faltantes encontradas`, `# de variables reparadas`, etc.
2. **Correcciones aplicadas**: Lista corta (o tabla) de las claves principales arregladas.
3. **Archivo o snippet**: Un bloque de código con el JSON reparado, o comandos específicos de edición múltiple (`multi_replace_file_content`) para aplicar el parche en la aplicación.
