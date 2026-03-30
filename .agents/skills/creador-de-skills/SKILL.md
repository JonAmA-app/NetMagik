---
name: creador-de-skills
description: crea nuevos skills para antigravity con un formato estandarizado, estructurado y predecible, incluyendo reglas claras, triggers y un workflow definido.
---

# Creador de Skills para Antigravity

## Cuándo usar este skill
- cuando el usuario pida crear un skill nuevo
- cuando el usuario repita un proceso que deba ser estandarizado
- cuando se necesite un estándar de formato para un procedimiento
- cuando haya que convertir un prompt largo en un procedimiento o skill reutilizable

## Inputs necesarios
- Objetivo principal del skill a crear
- Triggers (cuándo debe activarse el nuevo skill)
- Salida esperada (formato de salida, ej. markdown, JSON, código, texto)
- Restricciones o reglas específicas de la tarea
- Nivel de libertad que requiere el skill (1. Alta heurísticas, 2. Media plantillas, 3. Baja pasos exactos/comandos)

## Workflow
1) **Plan**: Entender el objetivo final del skill, pedir inputs faltantes y definir el output exacto.
2) **Validar**: Aplicar las restricciones de formato (nombre, YAML, etc.) y elegir el nivel de libertad. Separar responsabilidades (estilos a recursos, pasos al workflow).
3) **Ejecutar**: Generar el contenido del skill siguiendo la estructura mínima obligatoria de carpetas y el formato interno del `SKILL.md`.
4) **Revisar**: Verificar que el skill no tiene relleno ('fluff'), incluye la checklist, triggers claros y reglas para el manejo de errores.

## Instrucciones
Eres un experto en diseñar Skills para el entorno de Antigravity. Tu objetivo es crear Skills predecibles, reutilizables y fáciles de mantener, con una estructura clara.

### 1) Estructura mínima obligatoria
Todo skill debe crearse en `agent/skills/<nombre-del-skill>/`.
- `SKILL.md` (obligatorio, lógica y reglas)
- `recursos/` (opcional, guías, plantillas)
- `scripts/` (opcional, utilidades)
- `ejemplos/` (opcional, código de referencia)
No crees archivos innecesarios.

### 2) Reglas de nombre y YAML (SKILL.md)
- `name`: corto, en minúsculas, con guiones. Máx 40 caracteres (ej: planificar-video). Sin nombres de herramientas (salvo imprescindible) y nada de "marketing".
- `description`: en español, en tercera persona, máx 220 caracteres. Debe explicar qué hace y cuándo usarlo.

### 3) Principios de escritura
- Claridad sobre longitud: pocas reglas pero muy claras. Sin explicaciones de "blog".
- Separación: si hay "estilo" va a recursos, si hay "pasos" van al workflow.
- Pedir datos: si un input crítico falta, el skill debe preguntar.
- Validar salida: el output debe ser exacto.

### 4) Manejo de errores y correcciones
Incluye un apartado en el skill generado que dicte: "Si el output no cumple el formato, vuelve al paso 2, ajusta restricciones y re-genera. Si hay ambigüedad, pregunta antes de asumir."

### 5) Ejemplos de skills a sugerir (si aplica)
Skill de estilo y marca, planificar vídeos, auditar landing, debug de app, responder emails con tono.

## Output (formato exacto)

Carpeta
agent/skills/<nombre-del-skill>/

SKILL.md
```yaml
---
name: <nombre-del-skill>
description: <descripción breve en tercera persona>
---
```
# <Título del skill>
## Cuándo usar este skill
- ...
- ...
## Inputs necesarios
- ...
- ...
## Workflow
1) ...
2) ...
## Instrucciones
...
## Manejo de errores
...
## Output (formato exacto)
...

Recursos opcionales (solo si aportan valor)
- recursos/<archivo>.md
- scripts/<archivo>.sh
