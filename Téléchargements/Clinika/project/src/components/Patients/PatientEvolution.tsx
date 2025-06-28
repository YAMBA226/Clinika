import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useDataStore } from '../../store/dataStore';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PatientEvolutionProps {
  patientId: string;
}

export const PatientEvolution: React.FC<PatientEvolutionProps> = ({ patientId }) => {
  const { getConstantesByPatient, getConsultationsByPatient } = useDataStore();
  
  const constantes = getConstantesByPatient(patientId);
  const consultations = getConsultationsByPatient(patientId);

  // Préparer les données pour les graphiques
  const sortedConstantes = [...constantes].sort((a, b) => 
    new Date(a.dateEnregistrement).getTime() - new Date(b.dateEnregistrement).getTime()
  );

  const dates = sortedConstantes.map(c => 
    new Date(c.dateEnregistrement).toLocaleDateString('fr-FR')
  );

  // Données pour le graphique de température
  const temperatureData = {
    labels: dates,
    datasets: [
      {
        label: 'Température (°C)',
        data: sortedConstantes.map(c => c.temperature).filter(t => t !== undefined),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Données pour le graphique de tension
  const tensionData = {
    labels: dates,
    datasets: [
      {
        label: 'Systolique',
        data: sortedConstantes.map(c => c.tensionSystolique).filter(t => t !== undefined),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Diastolique',
        data: sortedConstantes.map(c => c.tensionDiastolique).filter(t => t !== undefined),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Données pour le graphique de poids
  const poidsData = {
    labels: dates,
    datasets: [
      {
        label: 'Poids (kg)',
        data: sortedConstantes.map(c => c.poids).filter(p => p !== undefined),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  // Calculer les tendances
  const calculateTrend = (values: (number | undefined)[]) => {
    const filteredValues = values.filter(v => v !== undefined) as number[];
    if (filteredValues.length < 2) return 'stable';
    
    const first = filteredValues[0];
    const last = filteredValues[filteredValues.length - 1];
    const diff = ((last - first) / first) * 100;
    
    if (Math.abs(diff) < 5) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const temperatureTrend = calculateTrend(sortedConstantes.map(c => c.temperature));
  const tensionTrend = calculateTrend(sortedConstantes.map(c => c.tensionSystolique));
  const poidsTrend = calculateTrend(sortedConstantes.map(c => c.poids));

  if (constantes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>Aucune donnée disponible pour afficher l'évolution</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Résumé des tendances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Température</p>
              <p className="text-lg font-semibold text-gray-900">
                {sortedConstantes[sortedConstantes.length - 1]?.temperature || '--'}°C
              </p>
            </div>
            {getTrendIcon(temperatureTrend)}
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tension</p>
              <p className="text-lg font-semibold text-gray-900">
                {sortedConstantes[sortedConstantes.length - 1]?.tensionSystolique || '--'}/
                {sortedConstantes[sortedConstantes.length - 1]?.tensionDiastolique || '--'}
              </p>
            </div>
            {getTrendIcon(tensionTrend)}
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Poids</p>
              <p className="text-lg font-semibold text-gray-900">
                {sortedConstantes[sortedConstantes.length - 1]?.poids || '--'} kg
              </p>
            </div>
            {getTrendIcon(poidsTrend)}
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="space-y-8">
        {sortedConstantes.some(c => c.temperature) && (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="text-lg font-semibold mb-4">Évolution de la température</h4>
            <Line data={temperatureData} options={chartOptions} />
          </div>
        )}

        {sortedConstantes.some(c => c.tensionSystolique) && (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="text-lg font-semibold mb-4">Évolution de la tension artérielle</h4>
            <Line data={tensionData} options={chartOptions} />
          </div>
        )}

        {sortedConstantes.some(c => c.poids) && (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="text-lg font-semibold mb-4">Évolution du poids</h4>
            <Line data={poidsData} options={chartOptions} />
          </div>
        )}
      </div>

      {/* Historique des consultations */}
      {consultations.length > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="text-lg font-semibold mb-4">Historique des consultations</h4>
          <div className="space-y-3">
            {consultations.slice(0, 5).map((consultation) => (
              <div key={consultation.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{consultation.motifConsultation}</p>
                  <p className="text-sm text-gray-600 mt-1">{consultation.diagnostic}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(consultation.dateConsultation).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};