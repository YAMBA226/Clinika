import React, { useState } from 'react';
import { Search, Plus, User, Phone, Calendar, FileText } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { Patient } from '../../types';

interface PatientsListProps {
  onPatientSelect: (patient: Patient) => void;
  onNewPatient: () => void;
}

export const PatientsList: React.FC<PatientsListProps> = ({ onPatientSelect, onNewPatient }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { searchPatients } = useDataStore();
  const { user } = useAuthStore();
  
  const patients = searchPatients(searchQuery);

  const canAddPatient = user?.role === 'assistant' || user?.role === 'admin';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

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

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Patients</h2>
          {canAddPatient && (
            <button
              onClick={onNewPatient}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau patient</span>
            </button>
          )}
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {patients.length === 0 ? (
          <div className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery ? 'Aucun patient trouvé' : 'Aucun patient enregistré'}
            </p>
          </div>
        ) : (
          patients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => onPatientSelect(patient)}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {patient.prenom} {patient.nom}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{calculateAge(patient.dateNaissance)} ans</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>{patient.telephone}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{patient.numeroCarnet}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    patient.sexe === 'F' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {patient.sexe === 'F' ? 'Femme' : 'Homme'}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Ajouté le {formatDate(patient.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};