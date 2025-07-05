# SINMAM API - Formato de Datos Requeridos

## Configuración Inicial

### Variables de Entorno
La aplicación utiliza un archivo `.env` para configurar el endpoint de la API.

1. **Crear archivo `.env`:**
   ```bash
   cp .env.example .env
   ```

2. **Configurar la URL base de la API:**
   ```env
   VITE_API_BASE_URL=http://localhost:3001
   ```

3. **Ejemplos de configuración:**
   - **Desarrollo local:** `http://localhost:3001`
   - **Producción:** `https://api.sinmam.com`
   - **Staging:** `https://staging-api.sinmam.com`

### Importante:
- La variable debe comenzar con `VITE_` para ser accesible en el frontend
- Reinicie el servidor de desarrollo después de cambiar el `.env`
- No incluya barra diagonal final en la URL

## Endpoints Necesarios

### 1. Estadísticas de Ritmo Cardíaco
**Endpoint:** `GET /api/heart-rate/stats`

**Respuesta esperada:**
```json
{
  "last5Minutes": 95,
  "last15Minutes": 92,
  "last30Minutes": 88,
  "current": 98,
  "lastUpdated": "14:30:25"
}
```

**Descripción de campos:**
- `last5Minutes` (number): Promedio de BPM en los últimos 5 minutos
- `last15Minutes` (number): Promedio de BPM en los últimos 15 minutos
- `last30Minutes` (number): Promedio de BPM en los últimos 30 minutos
- `current` (number): BPM actual en tiempo real
- `lastUpdated` (string): Hora de la última actualización en formato HH:MM:SS

### 2. Historial de Lecturas
**Endpoint:** `GET /api/heart-rate/readings`

**Respuesta esperada:**
```json
[
  {
    "id": 1,
    "hour": "14:30",
    "pulse": 110,
    "isRisky": false,
    "timestamp": "2025-01-11T14:30:00Z"
  },
  {
    "id": 2,
    "hour": "14:15",
    "pulse": 125,
    "isRisky": true,
    "timestamp": "2025-01-11T14:15:00Z"
  },
  {
    "id": 3,
    "hour": "14:00",
    "pulse": 88,
    "isRisky": false,
    "timestamp": "2025-01-11T14:00:00Z"
  }
]
```

**Descripción de campos:**
- `id` (number): ID único de la lectura
- `hour` (string): Hora de la lectura en formato HH:MM
- `pulse` (number): Valor del pulso cardíaco en BPM
- `isRisky` (boolean): `true` si la lectura es considerada riesgosa
- `timestamp` (string): Timestamp completo en formato ISO 8601

## Lógica de Clasificación de Riesgo

La aplicación clasifica automáticamente las lecturas según estos criterios:

### Niveles de Riesgo:
- **Normal**: 60-100 BPM
- **Bajo**: < 60 BPM (Bradicardia)
- **Alto**: > 100 BPM (Taquicardia)

### Campo `isRisky`:
- Se establece en `true` cuando el pulso es > 100 BPM
- Se establece en `false` para valores normales (60-100 BPM)
- Para valores < 60 BPM, se puede considerar según criterio médico

## Configuración de la API

### Actualización Automática:
- La aplicación solicita datos cada 15 segundos
- Asegúrese de que la API pueda manejar requests frecuentes
- Considere implementar cache si es necesario

### Manejo de Errores:
La aplicación maneja automáticamente:
- Errores de conexión
- Timeouts
- Respuestas con códigos de error HTTP
- Datos malformados

### Headers Recomendados:
```
Content-Type: application/json
Access-Control-Allow-Origin: *
Cache-Control: no-cache
```

## Ejemplo de Implementación Backend

### Node.js/Express:
```javascript
// GET /api/heart-rate/stats
app.get('/api/heart-rate/stats', (req, res) => {
  const stats = {
    last5Minutes: calculateAverage(5),
    last15Minutes: calculateAverage(15),
    last30Minutes: calculateAverage(30),
    current: getCurrentHeartRate(),
    lastUpdated: new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  };
  res.json(stats);
});

// GET /api/heart-rate/readings
app.get('/api/heart-rate/readings', (req, res) => {
  const readings = getLatestReadings(); // Últimas 10-20 lecturas
  res.json(readings);
});
```

### Python/FastAPI:
```python
from fastapi import FastAPI
from datetime import datetime

@app.get("/api/heart-rate/stats")
async def get_heart_rate_stats():
    return {
        "last5Minutes": calculate_average(5),
        "last15Minutes": calculate_average(15),
        "last30Minutes": calculate_average(30),
        "current": get_current_heart_rate(),
        "lastUpdated": datetime.now().strftime("%H:%M:%S")
    }

@app.get("/api/heart-rate/readings")
async def get_heart_rate_readings():
    return get_latest_readings()
```

## Notas Importantes

1. **Tiempo Real**: La aplicación actualiza automáticamente cada 15 segundos
2. **Responsividad**: La API debe responder en menos de 2 segundos
3. **Datos Históricos**: Se recomienda mantener al menos las últimas 50 lecturas
4. **Validación**: Asegúrese de que los valores de BPM estén en un rango válido (30-250)
5. **Logging**: Implemente logging para monitorear el rendimiento de la API

## Desarrollo Local

Para desarrollo local, puede crear un servidor mock que devuelva datos de prueba:

```javascript
// mock-server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/heart-rate/stats', (req, res) => {
  res.json({
    last5Minutes: Math.floor(Math.random() * 40) + 70,
    last15Minutes: Math.floor(Math.random() * 40) + 70,
    last30Minutes: Math.floor(Math.random() * 40) + 70,
    current: Math.floor(Math.random() * 40) + 70,
    lastUpdated: new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  });
});

app.get('/api/heart-rate/readings', (req, res) => {
  const readings = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    hour: new Date(Date.now() - i * 15 * 60 * 1000).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    pulse: Math.floor(Math.random() * 40) + 70,
    isRisky: Math.random() > 0.7,
    timestamp: new Date(Date.now() - i * 15 * 60 * 1000).toISOString()
  }));
  res.json(readings);
});

app.listen(3001, () => {
  console.log('Mock server running on port 3001');
});
```