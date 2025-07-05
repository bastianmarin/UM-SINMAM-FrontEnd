import React, { useState, useEffect } from 'react';
import { Heart, Activity, AlertTriangle, Clock, TrendingUp, Calendar, RefreshCw } from 'lucide-react';

interface HeartRateReading {
  id: number;
  hour: string;
  pulse: number;
  isRisky: boolean;
  timestamp: string;
}

interface HeartRateStats {
  last5Minutes: number;
  last15Minutes: number;
  last30Minutes: number;
  current: number;
  lastUpdated: string;
}

function App() {
  // API Base URL from environment variable
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  const [stats, setStats] = useState<HeartRateStats>({
    last5Minutes: 0,
    last15Minutes: 0,
    last30Minutes: 0,
    current: 0,
    lastUpdated: new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  });

  const [readings, setReadings] = useState<HeartRateReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API Functions
  const fetchHeartRateStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/heart-rate/stats`);
      if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const fetchHeartRateReadings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/heart-rate/readings`);
      if (!response.ok) {
        throw new Error('Error al obtener lecturas');
      }
      const data = await response.json();
      setReadings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchHeartRateStats(), fetchHeartRateReadings()]);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh data every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getRiskLevel = (pulse: number) => {
    if (pulse > 100) return 'high';
    if (pulse < 60) return 'low';
    return 'normal';
  };

  const getRiskColor = (pulse: number) => {
    const risk = getRiskLevel(pulse);
    switch (risk) {
      case 'high': return 'text-red-600';
      case 'low': return 'text-blue-600';
      default: return 'text-green-600';
    }
  };

  const getRiskBadgeColor = (isRisky: boolean) => {
    return isRisky 
      ? 'bg-red-100 text-red-800 border-red-200' 
      : 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatCardColor = (value: number) => {
    if (value > 100) return 'border-red-200 bg-red-50';
    if (value < 60) return 'border-blue-200 bg-blue-50';
    return 'border-green-200 bg-green-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-full">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SINMAM</h1>
                <p className="text-gray-600">Sistema de Monitoreo Cardíaco</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando datos del monitor cardíaco...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold">Error de Conexión</h3>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Content - only show when not loading */}
        {!loading && (
          <>
        {/* Current Pulse - Hero Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full mb-4">
              <Activity className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">SINMAM - Pulso Cardíaco Actual</h2>
            <div className="text-6xl font-bold text-red-600 mb-4">
              {stats.current}
              <span className="text-2xl font-normal text-gray-500 ml-2">BPM</span>
            </div>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 ${
              stats.current > 100 ? 'bg-red-100 text-red-800' :
              stats.current < 60 ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {stats.current > 100 ? 'Elevado' : stats.current < 60 ? 'Bajo' : 'Normal'}
            </div>
            
            {/* Last Updated Section */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <RefreshCw className="w-5 h-5" />
                <span className="text-sm font-medium">Última actualización:</span>
              </div>
              <div className="text-2xl font-bold text-gray-800 mt-2">
                {stats.lastUpdated}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Se actualiza cada 15 segundos
              </div>
            </div>
          </div>
        </div>

        {/* Time-based Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`bg-white rounded-xl shadow-lg p-6 border-2 ${getStatCardColor(stats.last5Minutes)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-700">Últimos 5 minutos</h3>
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.last5Minutes}
              <span className="text-sm font-normal text-gray-500 ml-1">BPM</span>
            </div>
            <p className="text-sm text-gray-600">Promedio reciente</p>
          </div>

          <div className={`bg-white rounded-xl shadow-lg p-6 border-2 ${getStatCardColor(stats.last15Minutes)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-700">Últimos 15 minutos</h3>
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.last15Minutes}
              <span className="text-sm font-normal text-gray-500 ml-1">BPM</span>
            </div>
            <p className="text-sm text-gray-600">Promedio medio</p>
          </div>

          <div className={`bg-white rounded-xl shadow-lg p-6 border-2 ${getStatCardColor(stats.last30Minutes)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-700">Últimos 30 minutos</h3>
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.last30Minutes}
              <span className="text-sm font-normal text-gray-500 ml-1">BPM</span>
            </div>
            <p className="text-sm text-gray-600">Promedio extendido</p>
          </div>
        </div>

        {/* Readings Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Historial de Lecturas</h3>
            <p className="text-sm text-gray-600 mt-1">Registro detallado de mediciones</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pulso Cardíaco
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ¿Riesgoso?
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {readings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p>No hay lecturas disponibles</p>
                      <p className="text-sm mt-1">Los datos aparecerán aquí cuando estén disponibles</p>
                    </td>
                  </tr>
                ) : (
                  readings.map((reading) => (
                  <tr key={reading.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{reading.hour}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className={`text-sm font-bold ${getRiskColor(reading.pulse)}`}>
                          {reading.pulse} BPM
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        reading.pulse > 100 ? 'bg-red-100 text-red-800' :
                        reading.pulse < 60 ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {reading.pulse > 100 ? 'Elevado' : reading.pulse < 60 ? 'Bajo' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {reading.isRisky && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getRiskBadgeColor(reading.isRisky)}`}>
                          {reading.isRisky ? 'Sí' : 'No'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Los datos se actualizan automáticamente cada 15 segundos</p>
          <p className="mt-1">Consulte con su médico si observa lecturas anormales persistentes</p>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

export default App;