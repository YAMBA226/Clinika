import React, { useState } from 'react';
import { X, Save, Activity } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';

interface ConstantesFormProps {
  patientId: string;
  onClose: () => void;
  onSave: () => void;
}

export const ConstantesForm: React.FC<ConstantesFormProps> = ({ patientId, onClose, onSave }) => {
  const { addConstantes } = useDataStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    temperature: '',
    tensionSystolique: '',
    tensionDiastolique: '',
    glycemie: '',
    poids: '',
    frequenceCardiaque: '',
    frequenceRespiratoire: '',
    saturationOxygene: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const constantesData: any = {
      patientId,
      dateEnregistrement: new Date().toISOString(),
      infirmierId: user?.id || ''
    };

    // Ajouter seulement les valeurs non vides
    Object.entries(formData).forEach(([key, value]) => {
      if (value.trim() !== '') {
        constantesData[key] = parseFloat(value);
      }
    });

    addConstantes(constantesData);
    onSave();
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Enregistrer les constantes
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
                Température (°C)
              </label>
              <input
                type="number"
                step="0.1"
                min="35"
                max="45"
                value={formData.temperature}
                onChange={(e) => handleChange('temperature', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="37.0"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tension systolique
                </label>
                <input
                  type="number"
                  min="70"
                  max="250"
                  value={formData.tensionSystolique}
                  onChange={(e) => handleChange('tensionSystolique', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tension diastolique
                </label>
                <input
                  type="number"
                  min="40"
                  max="150"
                  value={formData.tensionDiastolique}
                  onChange={(e) => handleChange('tensionDiastolique', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="80"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Glycémie (g/L)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="5"
                value={formData.glycemie}
                onChange={(e) => handleChange('glycemie', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poids (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="300"
                value={formData.poids}
                onChange={(e) => handleChange('poids', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="70.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fréquence cardiaque (bpm)
              </label>
              <input
                type="number"
                min="30"
                max="200"
                value={formData.frequenceCardiaque}
                onChange={(e) => handleChange('frequenceCardiaque', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="72"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fréquence respiratoire (rpm)
              </label>
              <input
                type="number"
                min="8"
                max="50"
                value={formData.frequenceRespiratoire}
                onChange={(e) => handleChange('frequenceRespiratoire', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="16"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Saturation en oxygène (%)
              </label>
              <input
                type="number"
                min="70"
                max="100"
                value={formData.saturationOxygene}
                onChange={(e) => handleChange('saturationOxygene', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="98"
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
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