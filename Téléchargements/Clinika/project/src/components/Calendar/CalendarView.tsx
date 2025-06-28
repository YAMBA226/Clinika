import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { RendezVousForm } from './RendezVousForm';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const { rendezVous, patients } = useDataStore();
  const { user } = useAuthStore();

  const canAddRendezVous = user?.role === 'assistant' || user?.role === 'medecin' || user?.role === 'admin';

  // Obtenir les jours du mois
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Obtenir les RDV pour une date donnée
  const getRendezVousForDate = (date: Date) => {
    return rendezVous.filter(rdv => {
      const rdvDate = new Date(rdv.dateHeure);
      return isSameDay(rdvDate, date);
    });
  };

  // Obtenir le nom du patient
  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.prenom} ${patient.nom}` : 'Patient inconnu';
  };

  // Obtenir la couleur selon le statut
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'planifie': return 'bg-blue-100 text-blue-800';
      case 'confirme': return 'bg-green-100 text-green-800';
      case 'en_cours': return 'bg-yellow-100 text-yellow-800';
      case 'termine': return 'bg-gray-100 text-gray-800';
      case 'annule': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Planning des rendez-vous</h2>
          </div>
          
          {canAddRendezVous && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau RDV</span>
            </button>
          )}
        </div>

        {/* Navigation du calendrier */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <h3 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Grille du calendrier */}
      <div className="p-6">
        {/* En-têtes des jours */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Jours du mois */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayRendezVous = getRendezVousForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);

            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[100px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-blue-50 border-blue-300' : ''
                } ${isTodayDate ? 'bg-blue-100' : ''}`}
              >
                <div className={`text-sm font-medium ${
                  isTodayDate ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {format(day, 'd')}
                </div>
                
                {/* Rendez-vous du jour */}
                <div className="mt-1 space-y-1">
                  {dayRendezVous.slice(0, 3).map((rdv) => (
                    <div
                      key={rdv.id}
                      className={`text-xs p-1 rounded ${getStatusColor(rdv.statut)}`}
                    >
                      <div className="font-medium">
                        {format(new Date(rdv.dateHeure), 'HH:mm')}
                      </div>
                      <div className="truncate">
                        {getPatientName(rdv.patientId)}
                      </div>
                    </div>
                  ))}
                  {dayRendezVous.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayRendezVous.length - 3} autres
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Détails de la date sélectionnée */}
      {selectedDate && (
        <div className="border-t border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            Rendez-vous du {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
          </h4>
          
          {getRendezVousForDate(selectedDate).length === 0 ? (
            <p className="text-gray-500">Aucun rendez-vous prévu</p>
          ) : (
            <div className="space-y-3">
              {getRendezVousForDate(selectedDate).map((rdv) => (
                <div key={rdv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">
                        {format(new Date(rdv.dateHeure), 'HH:mm')}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(rdv.statut)}`}>
                        {rdv.statut}
                      </span>
                    </div>
                    <p className="text-gray-900 mt-1">{getPatientName(rdv.patientId)}</p>
                    <p className="text-sm text-gray-600">{rdv.motif}</p>
                    {rdv.notes && (
                      <p className="text-sm text-gray-500 mt-1">{rdv.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de création de RDV */}
      {showForm && (
        <RendezVousForm
          onClose={() => setShowForm(false)}
          onSave={() => setShowForm(false)}
          initialDate={selectedDate || undefined}
        />
      )}
    </div>
  );
};