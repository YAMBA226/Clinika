import React, { useState } from 'react';
import { X, Save, Plus, Trash2, FileText, Download } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { Medicament } from '../../types';
import { generateOrdonnancePDF } from '../../utils/pdfGenerator';

interface OrdonnanceFormProps {
  consultationId: string;
  patientId: string;
  onClose: () => void;
  onSave: () => void;
}

export const OrdonnanceForm: React.FC<OrdonnanceFormProps> = ({ 
  consultationId, 
  patientId, 
  onClose, 
  onSave 
}) => {
  const { addOrdonnance, getPatient } = useDataStore();
  const { user } = useAuthStore();
  
  const [medicaments, setMedicaments] = useState<Omit<Medicament, 'id'>[]>([
    { nom: '', dosage: '', forme: '', posologie: '', duree: '', instructions: '' }
  ]);
  
  const [formData, setFormData] = useState({
    recommandations: '',
    prochainRdv: ''
  });

  const patient = getPatient(patientId);

  const addMedicament = () => {
    setMedicaments([...medicaments, { 
      nom: '', 
      dosage: '', 
      forme: '', 
      posologie: '', 
      duree: '', 
      instructions: '' 
    }]);
  };

  const removeMedicament = (index: number) => {
    if (medicaments.length > 1) {
      setMedicaments(medicaments.filter((_, i) => i !== index));
    }
  };

  const updateMedicament = (index: number, field: keyof Omit<Medicament, 'id'>, value: string) => {
    const updated = [...medicaments];
    updated[index] = { ...updated[index], [field]: value };
    setMedicaments(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filtrer les médicaments vides
    const validMedicaments = medicaments.filter(med => med.nom.trim() !== '');
    
    if (validMedicaments.length === 0) {
      alert('Veuillez ajouter au moins un médicament');
      return;
    }

    const ordonnanceData = {
      consultationId,
      patientId,
      medecinId: user?.id || '',
      medicaments: validMedicaments.map((med, index) => ({
        ...med,
        id: `med_${index}_${Date.now()}`
      })),
      recommandations: formData.recommandations,
      prochainRdv: formData.prochainRdv,
      dateCreation: new Date().toISOString(),
      validite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 jours
    };

    addOrdonnance(ordonnanceData);
    onSave();
  };

  const handleDownloadPDF = () => {
    if (!patient || !user) return;
    
    const validMedicaments = medicaments.filter(med => med.nom.trim() !== '');
    
    const ordonnanceData = {
      id: 'temp_' + Date.now(),
      consultationId,
      patientId,
      medecinId: user.id,
      medicaments: validMedicaments.map((med, index) => ({
        ...med,
        id: `med_${index}_${Date.now()}`
      })),
      recommandations: formData.recommandations,
      prochainRdv: formData.prochainRdv,
      dateCreation: new Date().toISOString(),
      validite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    generateOrdonnancePDF(ordonnanceData, patient, user);
  };

  const formes = [
    'Comprimé', 'Gélule', 'Sirop', 'Solution', 'Injection', 'Pommade', 
    'Crème', 'Gouttes', 'Suppositoire', 'Patch', 'Inhalateur'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Créer une ordonnance
              </h2>
              {patient && (
                <p className="text-sm text-gray-600">
                  Patient: {patient.prenom} {patient.nom}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Télécharger PDF"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Médicaments */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Médicaments</h3>
              <button
                type="button"
                onClick={addMedicament}
                className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter</span>
              </button>
            </div>

            <div className="space-y-4">
              {medicaments.map((medicament, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium text-gray-900">Médicament {index + 1}</h4>
                    {medicaments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicament(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom du médicament *
                      </label>
                      <input
                        type="text"
                        value={medicament.nom}
                        onChange={(e) => updateMedicament(index, 'nom', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ex: Paracétamol"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage
                      </label>
                      <input
                        type="text"
                        value={medicament.dosage}
                        onChange={(e) => updateMedicament(index, 'dosage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ex: 500mg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Forme
                      </label>
                      <select
                        value={medicament.forme}
                        onChange={(e) => updateMedicament(index, 'forme', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner</option>
                        {formes.map((forme) => (
                          <option key={forme} value={forme}>{forme}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Posologie
                      </label>
                      <input
                        type="text"
                        value={medicament.posologie}
                        onChange={(e) => updateMedicament(index, 'posologie', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ex: 1 comprimé 3 fois/jour"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Durée
                      </label>
                      <input
                        type="text"
                        value={medicament.duree}
                        onChange={(e) => updateMedicament(index, 'duree', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ex: 7 jours"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instructions
                      </label>
                      <input
                        type="text"
                        value={medicament.instructions}
                        onChange={(e) => updateMedicament(index, 'instructions', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ex: Après les repas"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommandations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommandations
            </label>
            <textarea
              value={formData.recommandations}
              onChange={(e) => setFormData(prev => ({ ...prev, recommandations: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Recommandations pour le patient..."
            />
          </div>

          {/* Prochain RDV */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prochain rendez-vous
            </label>
            <input
              type="text"
              value={formData.prochainRdv}
              onChange={(e) => setFormData(prev => ({ ...prev, prochainRdv: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: Dans 1 semaine pour contrôle"
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Enregistrer ordonnance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};