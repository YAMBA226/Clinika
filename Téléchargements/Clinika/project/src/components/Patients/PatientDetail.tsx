import React, { useState } from 'react';
import { ArrowLeft, Edit, FileText, Download, Plus, Clock, Activity, AlertTriangle } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { Patient } from '../../types';
import { ConstantesForm } from './ConstantesForm';
import { AntecedentsForm } from './AntecedentsForm';
import { ConsultationForm } from '../Consultations/ConsultationForm';
import { RendezVousForm } from '../Calendar/RendezVousForm';
import { PatientEvolution } from './PatientEvolution';
import { generatePatientPDF } from '../../utils/pdfGenerator';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  onEdit: (patient: Patient) => void;
}

export const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onBack, onEdit }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showConstantesForm, setShowConstantesForm] = useState(false);
  const [showAntecedentsForm, setShowAntecedentsForm] = useState(false);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [showRendezVousForm, setShowRendezVousForm] = useState(false);

  const { 
    getConstantesByPatient, 
    getAntecedentsByPatient, 
    getConsultationsByPatient,
    getRendezVousByPatient,
    getOrdonnancesByPatient 
  } = useDataStore();
  
  const { user } = useAuthStore();

  const constantes = getConstantesByPatient(patient.id);
  const antecedents = getAntecedentsByPatient(patient.id);
  const consultations = getConsultationsByPatient(patient.id);
  const rendezVous = getRendezVousByPatient(patient.id);
  const ordonnances = getOrdonnancesByPatient(patient.id);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const canEdit = user?.role === 'assistant' || user?.role === 'admin';
  const canAddConstantes = user?.role === 'infirmier' || user?.role === 'admin';
  const canAddConsultation = user?.role === 'medecin' || user?.role === 'admin';
  const canAddRendezVous = user?.role === 'assistant' || user?.role === 'medecin' || user?.role === 'admin';

  const handleDownloadPDF = () => {
    generatePatientPDF(patient, {
      constantes,
      antecedents,
      consultations,
      ordonnances
    });
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: FileText },
    { id: 'constantes', label: 'Constantes', icon: Activity },
    { id: 'antecedents', label: 'Antécédents', icon: AlertTriangle },
    { id: 'evolution', label: 'Évolution', icon: Clock }
  ];

  const latestConstantes = constantes.length > 0 ? constantes[constantes.length - 1] : null;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* En-tête du patient */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Carnet PDF</span>
            </button>
            
            {canEdit && (
              <button
                onClick={() => onEdit(patient)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Modifier</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold text-blue-600">
                {patient.prenom.charAt(0)}{patient.nom.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.prenom} {patient.nom}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600 mt-1">
                <span>{calculateAge(patient.dateNaissance)} ans</span>
                <span>•</span>
                <span>{patient.sexe === 'F' ? 'Femme' : 'Homme'}</span>
                <span>•</span>
                <span>N° {patient.numeroCarnet}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                <span>{patient.telephone}</span>
                {patient.email && (
                  <>
                    <span>•</span>
                    <span>{patient.email}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{consultations.length}</p>
                <p className="text-xs text-gray-500">Consultations</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{constantes.length}</p>
                <p className="text-xs text-gray-500">Constantes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{ordonnances.length}</p>
                <p className="text-xs text-gray-500">Ordonnances</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center space-x-3 mt-6">
          {canAddConstantes && (
            <button
              onClick={() => setShowConstantesForm(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Constantes</span>
            </button>
          )}
          
          {canAddConsultation && (
            <button
              onClick={() => setShowConsultationForm(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Consultation</span>
            </button>
          )}
          
          {canAddRendezVous && (
            <button
              onClick={() => setShowRendezVousForm(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>RDV</span>
            </button>
          )}
          
          <button
            onClick={() => setShowAntecedentsForm(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Antécédent</span>
          </button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Informations personnelles */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Adresse:</span>
                  <p className="font-medium">{patient.adresse}</p>
                </div>
                {patient.profession && (
                  <div>
                    <span className="text-gray-500">Profession:</span>
                    <p className="font-medium">{patient.profession}</p>
                  </div>
                )}
                {patient.contactUrgence && (
                  <div>
                    <span className="text-gray-500">Contact d'urgence:</span>
                    <p className="font-medium">{patient.contactUrgence}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Dernières constantes */}
            {latestConstantes && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Dernières constantes</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {latestConstantes.temperature && (
                    <div>
                      <span className="text-gray-500">Température:</span>
                      <p className="font-medium">{latestConstantes.temperature}°C</p>
                    </div>
                  )}
                  {latestConstantes.tensionSystolique && latestConstantes.tensionDiastolique && (
                    <div>
                      <span className="text-gray-500">Tension:</span>
                      <p className="font-medium">
                        {latestConstantes.tensionSystolique}/{latestConstantes.tensionDiastolique} mmHg
                      </p>
                    </div>
                  )}
                  {latestConstantes.poids && (
                    <div>
                      <span className="text-gray-500">Poids:</span>
                      <p className="font-medium">{latestConstantes.poids} kg</p>
                    </div>
                  )}
                  {latestConstantes.frequenceCardiaque && (
                    <div>
                      <span className="text-gray-500">Fréquence cardiaque:</span>
                      <p className="font-medium">{latestConstantes.frequenceCardiaque} bpm</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Résumé des antécédents */}
            {antecedents.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Antécédents importants</h3>
                <div className="space-y-2">
                  {antecedents.filter(a => a.actif).slice(0, 3).map((antecedent) => (
                    <div key={antecedent.id} className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        antecedent.type === 'allergie' ? 'bg-red-100 text-red-800' :
                        antecedent.type === 'maladie' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {antecedent.type}
                      </span>
                      <span className="text-sm">{antecedent.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'constantes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Constantes médicales</h3>
              {canAddConstantes && (
                <button
                  onClick={() => setShowConstantesForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter</span>
                </button>
              )}
            </div>

            {constantes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Aucune constante enregistrée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {constantes.reverse().map((constante) => (
                  <div key={constante.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm text-gray-500">
                        {new Date(constante.dateEnregistrement).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {constante.temperature && (
                        <div>
                          <span className="text-gray-500">Température:</span>
                          <p className="font-medium">{constante.temperature}°C</p>
                        </div>
                      )}
                      {constante.tensionSystolique && constante.tensionDiastolique && (
                        <div>
                          <span className="text-gray-500">Tension:</span>
                          <p className="font-medium">
                            {constante.tensionSystolique}/{constante.tensionDiastolique} mmHg
                          </p>
                        </div>
                      )}
                      {constante.poids && (
                        <div>
                          <span className="text-gray-500">Poids:</span>
                          <p className="font-medium">{constante.poids} kg</p>
                        </div>
                      )}
                      {constante.frequenceCardiaque && (
                        <div>
                          <span className="text-gray-500">FC:</span>
                          <p className="font-medium">{constante.frequenceCardiaque} bpm</p>
                        </div>
                      )}
                      {constante.glycemie && (
                        <div>
                          <span className="text-gray-500">Glycémie:</span>
                          <p className="font-medium">{constante.glycemie} g/L</p>
                        </div>
                      )}
                      {constante.saturationOxygene && (
                        <div>
                          <span className="text-gray-500">SpO2:</span>
                          <p className="font-medium">{constante.saturationOxygene}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'antecedents' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Antécédents médicaux</h3>
              <button
                onClick={() => setShowAntecedentsForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter</span>
              </button>
            </div>

            {antecedents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Aucun antécédent enregistré</p>
              </div>
            ) : (
              <div className="space-y-3">
                {antecedents.map((antecedent) => (
                  <div key={antecedent.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            antecedent.type === 'allergie' ? 'bg-red-100 text-red-800' :
                            antecedent.type === 'maladie' ? 'bg-orange-100 text-orange-800' :
                            antecedent.type === 'chirurgie' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {antecedent.type}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            antecedent.actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {antecedent.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        <p className="text-gray-900">{antecedent.description}</p>
                        {antecedent.date && (
                          <p className="text-sm text-gray-500 mt-1">
                            Date: {new Date(antecedent.date).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'evolution' && (
          <PatientEvolution patientId={patient.id} />
        )}
      </div>

      {/* Modaux */}
      {showConstantesForm && (
        <ConstantesForm
          patientId={patient.id}
          onClose={() => setShowConstantesForm(false)}
          onSave={() => setShowConstantesForm(false)}
        />
      )}

      {showAntecedentsForm && (
        <AntecedentsForm
          patientId={patient.id}
          onClose={() => setShowAntecedentsForm(false)}
          onSave={() => setShowAntecedentsForm(false)}
        />
      )}

      {showConsultationForm && (
        <ConsultationForm
          patientId={patient.id}
          onClose={() => setShowConsultationForm(false)}
          onSave={() => setShowConsultationForm(false)}
        />
      )}

      {showRendezVousForm && (
        <RendezVousForm
          patientId={patient.id}
          onClose={() => setShowRendezVousForm(false)}
          onSave={() => setShowRendezVousForm(false)}
        />
      )}
    </div>
  );
};