import React from 'react';
import { Clock, Users, Calendar, AlertCircle, CheckCircle, UserCheck } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const MedecinDashboard: React.FC = () => {
  const { getRendezVousToday, updateRendezVousStatus, getPatient } = useDataStore();
  const { user } = useAuthStore();
  
  const rendezVousToday = getRendezVousToday(user?.id);
  
  // Statistiques
  const stats = {
    total: rendezVousToday.length,
    enAttente: rendezVousToday.filter(rdv => rdv.statusPatient === 'non_arrive').length,
    arrives: rendezVousToday.filter(rdv => rdv.statusPatient === 'arrive').length,
    enConsultation: rendezVousToday.filter(rdv => rdv.statusPatient === 'en_consultation').length,
    termines: rendezVousToday.filter(rdv => rdv.statusPatient === 'termine').length
  };

  const handleStatusChange = (rdvId: string, newStatus: 'non_arrive' | 'arrive' | 'en_consultation' | 'termine') => {
    updateRendezVousStatus(rdvId, newStatus);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'non_arrive': return 'bg-gray-100 text-gray-800';
      case 'arrive': return 'bg-blue-100 text-blue-800';
      case 'en_consultation': return 'bg-yellow-100 text-yellow-800';
      case 'termine': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'non_arrive': return 'Non arrivé';
      case 'arrive': return 'Arrivé';
      case 'en_consultation': return 'En consultation';
      case 'termine': return 'Terminé';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques du jour */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total RDV</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">{stats.enAttente}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Arrivés</p>
              <p className="text-2xl font-bold text-gray-900">{stats.arrives}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Terminés</p>
              <p className="text-2xl font-bold text-gray-900">{stats.termines}</p>
            </div>
          </div>
        </div>
      </div>

      {/* File d'attente */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              File d'attente - {format(new Date(), 'dd MMMM yyyy', { locale: fr })}
            </h2>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {rendezVousToday.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun rendez-vous prévu aujourd'hui</p>
            </div>
          ) : (
            rendezVousToday
              .sort((a, b) => new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime())
              .map((rdv) => {
                const patient = getPatient(rdv.patientId);
                if (!patient) return null;

                return (
                  <div key={rdv.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            {patient.prenom.charAt(0)}{patient.nom.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {patient.prenom} {patient.nom}
                          </h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span>{format(new Date(rdv.dateHeure), 'HH:mm')}</span>
                            <span>•</span>
                            <span>{rdv.motif}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <select
                          value={rdv.statusPatient}
                          onChange={(e) => handleStatusChange(rdv.id, e.target.value as any)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(rdv.statusPatient)}`}
                        >
                          <option value="non_arrive">Non arrivé</option>
                          <option value="arrive">Arrivé</option>
                          <option value="en_consultation">En consultation</option>
                          <option value="termine">Terminé</option>
                        </select>

                        {rdv.statusPatient === 'arrive' && (
                          <button
                            onClick={() => handleStatusChange(rdv.id, 'en_consultation')}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                          >
                            Commencer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Alertes et notifications */}
      {stats.enAttente > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                {stats.enAttente} patient{stats.enAttente > 1 ? 's' : ''} en attente
              </p>
              <p className="text-sm text-yellow-700">
                Des patients attendent leur consultation
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};