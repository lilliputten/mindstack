# Documentación de MindStack

Bienvenido a **{siteTitle}** — una plataforma para crear sistemas personales de entrenamiento de repetición a partir de tus propios conocimientos y conjuntos de datos.

## ¿Qué es MindStack?

MindStack te ayuda a **convertir tus propios conocimientos en entrenamientos repetibles**. En lugar de usar cursos públicos genéricos, construyes sistemas de entrenamiento personales a partir de tus materiales de trabajo reales, materias de estudio, referencias técnicas o cualquier tema que sea importante para ti.

La plataforma proporciona herramientas para:

- Crear conjuntos de datos estructurados de preguntas y respuestas a partir de tus temas
- Validar la calidad del contenido con asistencia de IA y detección de duplicados
- Ejecutar sesiones efectivas de entrenamiento con repetición espaciada
- Rastrear tu progreso y refinar tus conjuntos de datos con el tiempo

**Principio fundamental:** Tú controlas todo el flujo de trabajo, desde la idea inicial hasta la sesión de entrenamiento activa. La IA asiste pero nunca reemplaza tu juicio.

---

## Primeros Pasos

### 1. Elige Tu Nivel de Acceso

**Invitado (Sin Cuenta Requerida)**

- Explora temas públicos creados por otros usuarios
- Prueba entrenamientos de muestra para entender la experiencia de entrenamiento
- Funcionalidad limitada—el progreso no se guarda

**Usuario Registrado (Cuenta Gratuita)**

- Crea temas privados ilimitados
- Genera preguntas y respuestas con IA (cuota limitada)
- Ejecuta sesiones de entrenamiento y rastrea tu progreso
- Comparte temas seleccionados públicamente (opcional)
- Acceso vía OAuth (Google, GitHub, Yandex) u OTP (Email, Telegram)

**Planes Premium (De Pago)**

- Cuotas más altas de generación con IA
- Analítica avanzada e insights
- Soporte prioritario
- Consulta la [Página de Precios](/pricing) para más detalles

### 2. Crea Tu Primer Tema

1. **Regístrate** para obtener una cuenta gratuita (toma segundos vía OAuth u OTP)
2. Navega a **"Mis Temas"** en tu panel de control
3. Haz clic en **"Crear Tema"**
4. Completa:
   - **Título:** ¿Sobre qué materia estás entrenando?
   - **Categoría:** Elige entre categorías existentes o solicita una nueva
   - **Idioma:** Selecciona el idioma principal para este tema
   - **Privacidad:** Privado (predeterminado) o Público
5. Haz clic en **"Crear"** — ¡tu tema está listo!

### 3. Agrega Preguntas y Respuestas

Tienes dos opciones:

**Opción A: Escribir Manualmente**

- Haz clic en **"Agregar Pregunta"** en tu tema
- Escribe tu pregunta y respuesta directamente
- Usa el rico editor HeadlessEditor para formateo (negrita, listas, bloques de código, etc.)
- Guarda cuando estés listo

**Opción B: Generar con IA**

- Haz clic en el botón **"Generar con IA"**
- Proporciona una breve descripción de lo que quieres cubrir
- La IA genera borradores de preguntas y respuestas
- **Revisa cada elemento cuidadosamente:**
  - Edita cualquier texto que necesite mejora
  - Regenera elementos específicos si no estás satisfecho
  - Elimina preguntas irrelevantes
- **Aprueba y guarda** solo cuando estés satisfecho con la calidad

> **Importante:** El contenido generado permanece en modo "borrador" hasta que lo apruebes explícitamente. Nada se guarda en tu base de datos sin tu confirmación.

### 4. Comienza a Entrenar

Una vez que tengas al menos un par pregunta-respuesta:

- Haz clic en **"Comenzar Entrenamiento"** en la página de tu tema
- Responde las preguntas a medida que aparecen
- El sistema rastrea tu rendimiento
- Los algoritmos de repetición espaciada programan tiempos óptimos de revisión
- Regresa más tarde para sesiones de seguimiento basadas en tus resultados

---

## Cómo Funciona MindStack

### Jerarquía de Datos

MindStack organiza tus conocimientos en una estructura clara:

```python
Categorías (materias amplias)
  └─ Temas (áreas específicas dentro de categorías)
      └─ Preguntas (consultas individuales)
          └─ Respuestas (una o más por pregunta)
```

**Ejemplo:**

```python
Lenguajes de Programación
  └─ Fundamentos de Python
      ├─ ¿Qué es una comprensión de listas?
      │   └─ Una forma concisa de crear listas en Python...
      └─ ¿Cómo manejas las excepciones?
          └─ Usando bloques try-except...
```

Esta jerarquía mantiene tu base de conocimientos manejable ya sea que tengas 10 o 1000 elementos.

### El Flujo de Trabajo de Creación

**Paso 1: Define Tu Tema**

- Elige una categoría o solicita una nueva
- Establece preferencias de privacidad (privado por defecto)
- Define el alcance de lo que quieres aprender/entrenar

**Paso 2: Genera, Revisa, Refina**

- Agrega preguntas manualmente o usa generación con IA
- Compara nuevos elementos contra los existentes (detección de duplicados)
- Edita en el lugar usando HeadlessEditor
- Regenera elementos insatisfactorios
- Itera hasta que la calidad cumpla con tus estándares

**Paso 3: Practica e Itera**

- Ejecuta sesiones de repetición en tus datos validados
- Rastrea estadísticas de rendimiento
- Identifica áreas débiles que necesitan más atención
- Refina continuamente tu tema mientras aprendes
- Agrega nuevas preguntas a medida que surgen vacíos

---

## Características Clave Explicadas

### Edición en el Lugar (HeadlessEditor)

Edita preguntas y respuestas directamente donde las ves—no se necesita un modo de edición separado.

**Capacidades:**

- Formateo de texto enriquecido (negrita, cursiva, listas)
- Bloques de código con resaltado de sintaxis
- Enlaces e imágenes
- Soporte Markdown (GitHub Flavored Markdown)

**Beneficio:** Reduce el cambio de contexto y acelera el refinamiento de contenido.

### Detección de Duplicados (Beta)

Cuando generas o agregas nuevas preguntas, MindStack las compara contra elementos existentes en tu tema.

**Cómo funciona:**

- Usa algoritmos de similitud de n-gramas con lematización multilingüe
- Marca elementos con puntuación de similitud ≥ 25%
- Te muestra posibles duplicados antes de guardar
- Tú decides: fusionar, reformular o mantener ambos

**Limitaciones actuales:**

- Detecta similitud léxica (mismas/similares palabras), no significado semántico
- Puede perder duplicados parafraseados (mismo significado, diferentes palabras)
- Funciona mejor con redacción clara y distinta
- El algoritmo está en beta y mejorando activamente

**Mejoras futuras:** Similitud semántica mediante embeddings y bases de datos vectoriales (planificado).

### Ciclo de Revisión de Generación

El contenido generado por IA nunca se guarda automáticamente. Mantienes control total:

1. La IA genera borradores de preguntas y respuestas
2. Revisas cada elemento en el diálogo de generación
3. Opciones para cada elemento:
   - ✅ **Aceptar** — Aprobar y agregar al tema
   - ✏️ **Editar** — Modificar texto antes de aceptar
   - 🔄 **Regenerar** — Pedir a la IA que intente de nuevo
   - ❌ **Eliminar** — Descartar el elemento
4. Solo los elementos aprobados se guardan en tu base de datos

**Beneficio:** Asegura control de calidad y previene que salida de IA de baja calidad contamine tu conjunto de datos.

### Control de Privacidad

Los temas son **privados por defecto**. Solo tú puedes verlos y entrenar con ellos.

**Opciones de compartir:**

- Mantén temas privados para uso personal (recomendado para materiales de trabajo sensibles)
- Haz temas públicos para contribuir a la comunidad
- Cambia configuraciones de privacidad en cualquier momento
- Los temas públicos aparecen en listados de categorías para que otros los descubran

**Casos de uso para temas privados:**

- Materiales de entrenamiento relacionados con el trabajo
- Conocimiento técnico propietario
- Notas de estudio personales
- Asuntos sensibles

**Casos de uso para temas públicos:**

- Compartir conocimiento general
- Recursos de aprendizaje de idiomas
- Práctica de documentación de código abierto
- Contribución a la comunidad

---

## Roles de Usuario y Permisos

### Invitado (No Autenticado)

**Puede:**

- Explorar temas y categorías públicas
- Probar entrenamientos de muestra (limitado)
- Ver información básica de temas

**No puede:**

- Crear o editar temas
- Guardar progreso o historial
- Acceder a generación con IA
- Rastrear analítica detallada

### Basic (Gratuito, Registrado)

**Puede:**

- Todo lo que puede un Invitado, más:
- Crear temas privados ilimitados
- Generar preguntas/respuestas (cuota diaria limitada)
- Ejecutar sesiones completas de entrenamiento
- Rastrear progreso y ver estadísticas
- Compartir temas públicamente (opcional)
- Solicitar nuevas categorías

**Límites:**

- La cuota de generación con IA se reinicia diariamente
- Solo analítica básica

### Pro (De Pago)

**Incluye todo Basic, más:**

- Cuotas más altas de generación con IA
- Panel de analítica avanzada
- Soporte prioritario por email
- Acceso temprano a nuevas características

### Premium (De Pago, Nivel Más Alto)

**Incluye todo Pro, más:**

- Generaciones con IA ilimitadas
- Todas las características avanzadas
- Opciones de marca personalizada (futuro)
- Acceso API (futuro)
- Soporte dedicado

Consulta la [Página de Precios](/pricing) para precios actuales y comparación de características.

---

## Opciones de Autenticación

MindStack ofrece múltiples formas de iniciar sesión:

### Proveedores OAuth

**Google**

- Opción más común
- Autenticación con un clic
- Disponibilidad global

**GitHub**

- Popular entre desarrolladores
- Vincula con tu perfil de codificación
- Excelente para temas técnicos

**Yandex**

- Enfoque en mercado ruso
- Proveedor de autenticación local
- Conveniente para usuarios de la región CIS

### OTP (Contraseña de Un Solo Uso)

**Email OTP**

- Método de respaldo universal
- No requiere cuenta social
- Código de verificación enviado a tu email

**Telegram OTP**

- Autentica vía bot de Telegram
- Recibe códigos a través del chat de Telegram
- Canal creciente para engagement de usuarios

**Nota:** Puedes vincular múltiples métodos de autenticación a la misma cuenta para flexibilidad.

---

## Sistemas de Pago

MindStack soporta pagos en múltiples regiones:

### Pagos Internacionales (Stripe)

**Métodos aceptados:**

- Tarjetas de crédito/débito (Visa, Mastercard, Amex)
- Apple Pay, Google Pay
- Transferencias bancarias (en países soportados)

**Características:**

- Renovaciones automáticas de suscripción
- Portal de cliente para gestión
- Upgrades/downgrades prorrateados
- Emails de recibo

### Pagos Rusos (YooMoney)

**Métodos aceptados:**

- Tarjetas bancarias rusas (Mir, Visa, Mastercard)
- Sberbank Online
- Tinkoff
- Cartera YooMoney
- Otros métodos de pago locales

**Cumplimiento:**

- Cumple con requisitos regulatorios rusos
- Transacciones denominadas en rublos
- Soporte al cliente local

### Gestión de Suscripciones

- Ciclos de facturación mensuales o anuales (anual típicamente con descuento)
- Cancela en cualquier momento (sin contratos a largo plazo)
- Downgrade a nivel gratuito si es necesario
- Reactiva suscripciones pausadas fácilmente

---

## Preguntas Frecuentes

### ¿Qué hace diferente a MindStack de Anki o Quizlet?

Mientras esas herramientas se enfocan en gestión de tarjetas, MindStack enfatiza **todo el flujo de trabajo de creación de contenido**. Obtienes:

- Generación asistida por IA con ciclos de revisión
- Detección de duplicados para mantener calidad del conjunto de datos
- Edición en el lugar sin cambio de contexto
- Jerarquía estructurada (categorías → temas → preguntas → respuestas)
- Diseño con privacidad primero con compartir opcional

Está diseñado para **construir conjuntos de datos de calidad**, no solo almacenar tarjetas.

### ¿Necesito escribir todas las preguntas manualmente?

No. Puedes:

- Escribirlas manualmente
- Usar IA para generar borradores
- Combinar ambos enfoques

La diferencia clave es que **el contenido generado permanece en modo de revisión**—verificas, editas y apruebas todo antes de que se convierta en parte de tu conjunto de datos de entrenamiento.

### ¿Qué pasa si no estoy satisfecho con el contenido generado por IA?

Tienes control total:

- Edita cualquier elemento generado usando HeadlessEditor
- Regenera preguntas específicas hasta que la calidad mejore
- Elimina elementos completamente
- Mezcla preguntas generadas por IA y manuales en el mismo tema

Piensa en la IA como un **asistente de borradores**, no como un piloto automático.

### ¿Cómo funciona la detección de duplicados?

Nuestro algoritmo de similitud beta:

- Compara nuevas preguntas/respuestas contra las existentes en tu tema
- Usa análisis de texto incluyendo lematización de palabras (para mejor coincidencia entre formas de palabras)
- Marca posibles duplicados con una puntuación de similitud (0-100%)
- Te permite decidir si fusionar, reformular o mantener ambos

**Nota:** Esta característica aún está mejorando y funciona mejor con redacción clara y distinta. Detecta similitud léxica (palabras similares), no significado semántico (misma idea, diferentes palabras).

### ¿Puedo mantener mis temas completamente privados?

Sí. Los temas son **privados por defecto**. Solo tú puedes verlos y entrenar con ellos. Debes elegir explícitamente hacer un tema público. Esto es ideal para:

- Materiales de entrenamiento relacionados con el trabajo
- Conocimiento técnico propietario
- Notas de estudio personales
- Cualquier contenido sensible

### ¿Cómo solicito una nueva categoría?

Los usuarios registrados pueden enviar solicitudes de creación de categorías:

1. Ve a la página de Categorías
2. Busca el botón **"Sugerir Tu Categoría"** o similar
3. Completa el formulario embebido con:
   - Nombre de categoría propuesto
   - Descripción
   - Por qué es útil
4. Nuestro equipo revisa las solicitudes y agrega categorías relevantes

Esto mantiene el sistema organizado mientras permite input de la comunidad.

### ¿Hay un bot de Telegram?

Sí, pero actualmente está limitado solo a **autenticación**:

- Vincula tu cuenta de Telegram con MindStack
- Recibe códigos OTP para inicio de sesión
- Actualizaciones futuras planificadas: rastreo de progreso, soporte de pagos, recordatorios diarios

### ¿Puedo usar MindStack sin registrarme?

Los invitados pueden explorar temas públicos y probar entrenamientos de muestra, pero **el progreso no se guarda**. Para crear tus propios temas, guardar datos y rastrear historial, necesitarás una cuenta gratuita. El registro toma segundos vía OAuth u OTP.

### ¿MindStack soporta múltiples idiomas?

¡Sí! Puedes:

- Crear temas en diferentes idiomas
- Cambiar el idioma de la interfaz (inglés, español, ruso)
- Entrenar con contenido multilingüe
- Usar generación con IA en idiomas soportados

Esto es especialmente útil para aprendizaje de idiomas o estudiar materiales en diferentes idiomas.

### ¿Cómo rastreo mi progreso?

MindStack proporciona estadísticas detalladas:

- Rendimiento por tema (tasa de éxito, tiempo promedio de respuesta)
- Tendencias históricas en el tiempo
- Identificación de áreas débiles
- Historial de entrenamientos con marcas de tiempo
- Métricas de retención mostrando qué tan bien recuerdas el contenido

Los usuarios premium obtienen analítica mejorada con visualizaciones y recomendaciones.

---

## Información Técnica

### Compatibilidad de Navegadores

MindStack funciona mejor con navegadores modernos:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Requisitos del Sistema

- **Conexión a Internet:** Requerida para sincronización de cuenta, generación con IA y actualizaciones
- **JavaScript:** Debe estar habilitado
- **Cookies:** Requeridas para autenticación y preferencias
- **Local Storage:** Usado para rastreo de progreso offline (característica PWA)

### Características de Rendimiento

- Renderizado del lado del servidor para cargas iniciales rápidas
- Carga progresiva de contenido
- Imágenes y activos optimizados
- Estrategias eficientes de caché vía React Query
- Capacidades PWA para sesiones de entrenamiento offline

---

## Privacidad y Seguridad

### Protección de Datos

Tu privacidad es importante:

- Los datos personales están encriptados y almacenados de forma segura
- Los datos de progreso están asociados con tu cuenta
- Los temas son privados por defecto—tú controlas el compartir
- No se vende información personal a terceros
- Auditorías de seguridad regulares y actualizaciones

### Qué Almacenamos

- Tus preguntas y respuestas (encriptadas en reposo)
- Historial de sesiones de entrenamiento y datos de rendimiento
- Información de cuenta (email, tokens de autenticación)
- Logs de uso de generación con IA (para rastreo de cuotas)

### Qué NO Almacenamos

- Detalles de tarjetas de pago (manejados por Stripe/YooMoney)
- Contraseñas en texto plano (hasheadas y salteadas)
- Cookies de rastreo de terceros (solo analítica mínima)

Para información detallada, consulta nuestra [Política de Privacidad]({privacyAliasRoute}) y [Política de Cookies]({cookiesAliasRoute}).

---

## Solución de Problemas

### Problemas Comunes

**Problemas de Inicio de Sesión**

- Verifica tu email y contraseña
- Revisa caps lock o errores de escritura
- Intenta restablecer tu contraseña
- Asegúrate de que los permisos del proveedor OAuth estén otorgados

**Generación con IA No Funciona**

- Revisa tu cuota diaria de generación (usuarios Basic tienen límites)
- Verifica conexión a internet
- Intenta regenerar si la salida parece de baja calidad
- Contacta soporte si la cuota parece incorrecta

**Progreso No Se Guarda**

- Asegúrate de haber iniciado sesión en tu cuenta
- Revisa tu conexión a internet
- Verifica que las cookies estén habilitadas
- Limpia el caché del navegador si los problemas persisten
- Contacta soporte si el problema continúa

**Problemas de Rendimiento**

- Limpia el caché de tu navegador
- Deshabilita extensiones del navegador temporalmente
- Revisa la velocidad de tu conexión a internet
- Intenta usar un navegador diferente
- Asegúrate de que JavaScript esté habilitado

### Obteniendo Ayuda

Si encuentras problemas o tienes preguntas:

1. **Revisa esta documentación** para soluciones comunes
2. **Contacta Soporte:** [{contactEmail}](mailto:{contactEmail})
3. **Visita nuestro sitio web:** [{publicAddr}]({publicAddr})
4. **Reporta bugs:** [GitHub Issues](https://github.com/lilliputten/mindstack/issues)

---

## Información Legal

Al usar MindStack, aceptas nuestros:

- [Términos de Servicio]({termsAliasRoute}) — Reglas y condiciones de uso
- [Política de Privacidad]({privacyAliasRoute}) — Cómo manejamos tus datos
- [Política de Cookies]({cookiesAliasRoute}) — Información sobre cookies y rastreo

---

## Actualizaciones y Registro de Cambios

MindStack se actualiza regularmente con:

- Nuevas características y mejoras
- Optimizaciones de rendimiento
- Mejoras de seguridad
- Correcciones de bugs y mejoras de estabilidad

Revisa la aplicación para notificaciones de actualización o visita nuestro [CHANGELOG.md](https://github.com/lilliputten/mindstack/blob/main/CHANGELOG.md) para historial detallado de versiones.

---

**Versión:** {versionInfo}

Para la información más actual y actualizaciones, visita nuestro sitio web o contacta a nuestro equipo de soporte en [{contactEmail}](mailto:{contactEmail}).
