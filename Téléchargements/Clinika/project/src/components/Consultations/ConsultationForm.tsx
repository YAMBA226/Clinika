import React, { useState } from 'react';
import { X, Save, Stethoscope, Plus } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { OrdonnanceForm } from './OrdonnanceForm';

interface ConsultationFormProps {
  patientId: string;
  onClose: () => void;
  onSave: () => void;
}

export const ConsultationForm: React.FC<ConsultationFormProps> = ({ patientId, onClose, onSave }) => {
  const { addConsultation, getPatient } = useDataStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    motifConsultation: '',
    examenClinique: '',
    diagnostic: '',
    planTraitement: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [showOrdonnanceForm, setShowOrdonnanceForm] = useState(false);

  const patient = getPatient(patientId);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.motifConsultation.trim()) {
      newErrors.motifConsultation = 'Le motif de consultation est requis';
    }
    if (!formData.examenClinique.trim()) {
      newErrors.examenClinique = 'L\'examen clinique est requis';
    }
    if (!formData.diagnostic.trim()) {
      newErrors.diagnostic = 'Le diagnostic est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const consultationData = {
      patientId,
      medecinId: user?.id || '',
      dateConsultation: new Date().toISOString(),
      ...formData
    };

    addConsultation(consultationData);
    
    // Générer un ID temporaire pour la consultation
    const tempId = Math.random().toString(36).substr(2, 9);
    setConsultationId(tempId);
    
    // Proposer de créer une ordonnance
    setShowOrdonnanceForm(true);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleOrdonnanceSaved = () => {
    setShowOrdonnanceForm(false);
    onSave();
  };

  if (showOrdonnanceForm && consultationId) {
    return (
      <OrdonnanceForm
        consultationId={consultationId}
        patientId={patientId}
        onClose={() => {
          setShowOrdonnanceForm(false);
          onSave();
        }}
        onSave={handleOrdonnanceSaved}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Stethoscope className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Nouvelle consultation
              </h2>
              {patient && (
                <p className="text-sm text-gray-600">
                  Patient: {patient.prenom} {patient.nom}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motif de consultation *
            </label>
            <input
              type="text"
              value={formData.motifConsultation}
              onChange={(e) => handleChange('motifConsultation', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.motifConsultation ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Douleurs abdominales, Contrôle de routine..."
            />
            {errors.motifConsultation && (
              <p className="text-red-500 text-sm mt-1">{errors.motifConsultation}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Examen clinique *
            </label>
            <textarea
              value={formData.examenClinique}
              onChange={(e) => handleChange('examenClinique', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.examenClinique ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Décrivez l'examen clinique effectué..."
            />
            {errors.examenClinique && (
              <p className="text-red-500 text-sm mt-1">{errors.examenClinique}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnostic *
            </label>
            <textarea
              value={formData.diagnostic}
              onChange={(e) => handleChange('diagnostic', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.diagnostic ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Diagnostic médical..."
            />
            {errors.diagnostic && (
              <p className="text-red-500 text-sm mt-1">{errors.diagnostic}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan de traitement
            </label>
            <textarea
              value={formData.planTraitement}
              onChange={(e) => handleChange('planTraitement', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Plan de traitement recommandé..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes additionnelles
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notes complémentaires..."
            />
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
              <span>Enregistrer et créer ordonnance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};