import React, { useState } from 'react';
import { X, Save, Calendar, Clock, User } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';

interface RendezVousFormProps {
  patientId?: string;
  onClose: () => void;
  onSave: () => void;
  initialDate?: Date;
}

export const RendezVousForm: React.FC<RendezVousFormProps> = ({ 
  patientId, 
  onClose, 
  onSave, 
  initialDate 
}) => {
  const { addRendezVous, patients } = useDataStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    patientId: patientId || '',
    medecinId: user?.role === 'medecin' ? user.id : '',
    date: initialDate ? format(initialDate, 'yyyy-MM-dd') : '',
    heure: '',
    duree: 30,
    motif: '',
    statut: 'planifie' as 'planifie' | 'confirme' | 'en_attente' | 'en_consultation' | 'termine' | 'annule',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Obtenir la liste des médecins
  const medecins = [
    { id: '1', nom: 'Dr. Kamara', prenom: 'Amadou' },
    // Vous pouvez ajouter d'autres médecins ici
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) newErrors.patientId = 'Sélectionnez un patient';
    if (!formData.medecinId) newErrors.medecinId = 'Sélectionnez un médecin';
    if (!formData.date) newErrors.date = 'La date est requise';
    if (!formData.heure) newErrors.heure = 'L\'heure est requise';
    if (!formData.motif.trim()) newErrors.motif = 'Le motif est requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Combiner date et heure
    const dateHeure = new Date(`${formData.date}T${formData.heure}`).toISOString();

    addRendezVous({
      ...formData,
      dateHeure,
      duree: Number(formData.duree)
    });
    
    onSave();
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const statutLabels = {
    planifie: 'Planifié',
    confirme: 'Confirmé',
    en_attente: 'En attente',
    en_consultation: 'En consultation',
    termine: 'Terminé',
    annule: 'Annulé'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Nouveau rendez-vous
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient *
              </label>
              <select
                value={formData.patientId}
                onChange={(e) => handleChange('patientId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.patientId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!!patientId}
              >
                <option value="">Sélectionner un patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.prenom} {patient.nom} - {patient.telephone}
                  </option>
                ))}
              </select>
              {errors.patientId && <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Médecin *
              </label>
              <select
                value={formData.medecinId}
                onChange={(e) => handleChange('medecinId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.medecinId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un médecin</option>
                {medecins.map((medecin) => (
                  <option key={medecin.id} value={medecin.id}>
                    {medecin.prenom} {medecin.nom}
                  </option>
                ))}
              </select>
              {errors.medecinId && <p className="text-red-500 text-sm mt-1">{errors.medecinId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure *
              </label>
              <input
                type="time"
                value={formData.heure}
                onChange={(e) => handleChange('heure', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.heure ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.heure && <p className="text-red-500 text-sm mt-1">{errors.heure}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée (minutes)
              </label>
              <select
                value={formData.duree}
                onChange={(e) => handleChange('duree', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 heure</option>
                <option value={90}>1h30</option>
                <option value={120}>2 heures</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={formData.statut}
                onChange={(e) => handleChange('statut', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(statutLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif de consultation *
              </label>
              <input
                type="text"
                value={formData.motif}
                onChange={(e) => handleChange('motif', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.motif ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Consultation de contrôle, Douleurs abdominales..."
              />
              {errors.motif && <p className="text-red-500 text-sm mt-1">{errors.motif}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnelles)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notes additionnelles..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Enregistrer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};