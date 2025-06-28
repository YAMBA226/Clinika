import React, { useState } from 'react';
import { useAuthStore } from './store/authStore';
import { LoginForm } from './components/Auth/LoginForm';
import { Header } from './components/Layout/Header';
import { Navigation } from './components/Layout/Navigation';
import { PatientsList } from './components/Patients/PatientsList';
import { PatientDetail } from './components/Patients/PatientDetail';
import { PatientForm } from './components/Patients/PatientForm';
import { CalendarView } from './components/Calendar/CalendarView';
import { UserManagement } from './components/Users/UserManagement';
import { MedecinDashboard } from './components/Dashboard/MedecinDashboard';
import { Patient } from './types';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState(() => {
    // Définir l'onglet par défaut selon le rôle
    if (user?.role === 'medecin') return 'dashboard';
    return 'patients';
  });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handlePatientEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setShowPatientForm(true);
  };

  const handleNewPatient = () => {
    setEditingPatient(null);
    setShowPatientForm(true);
  };

  const handleFormClose = () => {
    setShowPatientForm(false);
    setEditingPatient(null);
  };

  const handleFormSave = () => {
    setShowPatientForm(false);
    setEditingPatient(null);
    // Refresh the view if needed
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Tableau de Bord';
      case 'patients': return 'Gestion des Patients';
      case 'calendar': return 'Planning des Rendez-vous';
      case 'consultations': return 'Consultations';
      case 'analytics': return 'Statistiques';
      case 'constantes': return 'Constantes Médicales';
      case 'users': return 'Gestion des Utilisateurs';
      default: return 'Clinika EMR';
    }
  };

  const renderContent = () => {
    if (selectedPatient) {
      return (
        <PatientDetail
          patient={selectedPatient}
          onBack={() => setSelectedPatient(null)}
          onEdit={handlePatientEdit}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        if (user?.role === 'medecin') {
          return <MedecinDashboard />;
        }
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Tableau de Bord</h2>
            <p className="text-gray-500">Bienvenue sur Clinika EMR</p>
          </div>
        );
      case 'patients':
        return (
          <PatientsList
            onPatientSelect={handlePatientSelect}
            onNewPatient={handleNewPatient}
          />
        );
      case 'calendar':
        return <CalendarView />;
      case 'consultations':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Consultations</h2>
            <p className="text-gray-500">Module en développement...</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
            <p className="text-gray-500">Module en développement...</p>
          </div>
        );
      case 'constantes':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Constantes Médicales</h2>
            <p className="text-gray-500">Module en développement...</p>
          </div>
        );
      case 'users':
        return <UserManagement />;
      default:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Tableau de Bord</h2>
            <p className="text-gray-500">Bienvenue sur Clinika EMR</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={getPageTitle()} />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Modaux */}
      {showPatientForm && (
        <PatientForm
          patient={editingPatient || undefined}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}
    </div>
  );
}

export default App;