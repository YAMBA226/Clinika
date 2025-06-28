import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Patient, RendezVous, Consultation, Constantes, Antecedent, Ordonnance, ProgrammeSuivi } from '../types';

interface DataState {
  patients: Patient[];
  rendezVous: RendezVous[];
  consultations: Consultation[];
  constantes: Constantes[];
  antecedents: Antecedent[];
  ordonnances: Ordonnance[];
  programmesSuivi: ProgrammeSuivi[];
  
  // Actions Patients
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  searchPatients: (query: string) => Patient[];
  getPatient: (id: string) => Patient | undefined;
  
  // Actions Rendez-vous
  addRendezVous: (rdv: Omit<RendezVous, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRendezVous: (id: string, rdv: Partial<RendezVous>) => void;
  getRendezVousByPatient: (patientId: string) => RendezVous[];
  getRendezVousByMedecin: (medecinId: string) => RendezVous[];
  getRendezVousToday: (medecinId?: string) => RendezVous[];
  updateRendezVousStatus: (id: string, statusPatient: RendezVous['statusPatient']) => void;
  
  // Actions Consultations
  addConsultation: (consultation: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateConsultation: (id: string, consultation: Partial<Consultation>) => void;
  getConsultationsByPatient: (patientId: string) => Consultation[];
  
  // Actions Constantes
  addConstantes: (constantes: Omit<Constantes, 'id'>) => void;
  getConstantesByPatient: (patientId: string) => Constantes[];
  
  // Actions Antécédents
  addAntecedent: (antecedent: Omit<Antecedent, 'id' | 'createdAt'>) => void;
  updateAntecedent: (id: string, antecedent: Partial<Antecedent>) => void;
  getAntecedentsByPatient: (patientId: string) => Antecedent[];
  
  // Actions Ordonnances
  addOrdonnance: (ordonnance: Omit<Ordonnance, 'id'>) => void;
  getOrdonnancesByPatient: (patientId: string) => Ordonnance[];
  
  // Actions Programmes de suivi
  addProgrammeSuivi: (programme: Omit<ProgrammeSuivi, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProgrammeSuivi: (id: string, programme: Partial<ProgrammeSuivi>) => void;
  getProgrammesSuiviByPatient: (patientId: string) => ProgrammeSuivi[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// Données de test
const testPatients: Patient[] = [
  {
    id: '1',
    nom: 'Ouattara',
    prenom: 'Awa',
    dateNaissance: '1985-03-15',
    sexe: 'F',
    telephone: '+225 01 23 45 67',
    adresse: 'Cocody, Abidjan',
    email: 'awa.ouattara@email.com',
    numeroCarnet: 'CLN001',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    nom: 'Koffi',
    prenom: 'Jean',
    dateNaissance: '1990-07-22',
    sexe: 'M',
    telephone: '+225 07 89 01 23',
    adresse: 'Marcory, Abidjan',
    numeroCarnet: 'CLN002',
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z'
  }
];

// Données de test pour les rendez-vous d'aujourd'hui
const today = new Date();
const testRendezVous: RendezVous[] = [
  {
    id: '1',
    patientId: '1',
    medecinId: '1',
    dateHeure: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString(),
    duree: 30,
    motif: 'Consultation de contrôle',
    statut: 'confirme',
    statusPatient: 'arrive',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    patientId: '2',
    medecinId: '1',
    dateHeure: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30).toISOString(),
    duree: 30,
    motif: 'Douleurs abdominales',
    statut: 'confirme',
    statusPatient: 'non_arrive',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      patients: testPatients,
      rendezVous: testRendezVous,
      consultations: [],
      constantes: [],
      antecedents: [],
      ordonnances: [],
      programmesSuivi: [],

      // Patients
      addPatient: (patientData) => {
        const patient: Patient = {
          ...patientData,
          id: generateId(),
          numeroCarnet: `CLN${String(get().patients.length + 1).padStart(3, '0')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set(state => ({
          patients: [...state.patients, patient]
        }));
      },

      updatePatient: (id, patientData) => {
        set(state => ({
          patients: state.patients.map(p => 
            p.id === id ? { ...p, ...patientData, updatedAt: new Date().toISOString() } : p
          )
        }));
      },

      searchPatients: (query) => {
        const state = get();
        if (!query.trim()) return state.patients;
        
        const searchTerm = query.toLowerCase();
        return state.patients.filter(patient => 
          patient.nom.toLowerCase().includes(searchTerm) ||
          patient.prenom.toLowerCase().includes(searchTerm) ||
          patient.telephone.includes(searchTerm) ||
          patient.numeroCarnet.toLowerCase().includes(searchTerm)
        );
      },

      getPatient: (id) => {
        return get().patients.find(p => p.id === id);
      },

      // Rendez-vous
      addRendezVous: (rdvData) => {
        const rdv: RendezVous = {
          ...rdvData,
          id: generateId(),
          statusPatient: 'non_arrive',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set(state => ({
          rendezVous: [...state.rendezVous, rdv]
        }));
      },

      updateRendezVous: (id, rdvData) => {
        set(state => ({
          rendezVous: state.rendezVous.map(rdv => 
            rdv.id === id ? { ...rdv, ...rdvData, updatedAt: new Date().toISOString() } : rdv
          )
        }));
      },

      getRendezVousByPatient: (patientId) => {
        return get().rendezVous.filter(rdv => rdv.patientId === patientId);
      },

      getRendezVousByMedecin: (medecinId) => {
        return get().rendezVous.filter(rdv => rdv.medecinId === medecinId);
      },

      getRendezVousToday: (medecinId) => {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        
        return get().rendezVous.filter(rdv => {
          const rdvDate = new Date(rdv.dateHeure);
          const isToday = rdvDate >= startOfDay && rdvDate <= endOfDay;
          return isToday && (!medecinId || rdv.medecinId === medecinId);
        });
      },

      updateRendezVousStatus: (id, statusPatient) => {
        set(state => ({
          rendezVous: state.rendezVous.map(rdv => 
            rdv.id === id ? { ...rdv, statusPatient, updatedAt: new Date().toISOString() } : rdv
          )
        }));
      },

      // Consultations
      addConsultation: (consultationData) => {
        const consultation: Consultation = {
          ...consultationData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set(state => ({
          consultations: [...state.consultations, consultation]
        }));
      },

      updateConsultation: (id, consultationData) => {
        set(state => ({
          consultations: state.consultations.map(c => 
            c.id === id ? { ...c, ...consultationData, updatedAt: new Date().toISOString() } : c
          )
        }));
      },

      getConsultationsByPatient: (patientId) => {
        return get().consultations.filter(c => c.patientId === patientId);
      },

      // Constantes
      addConstantes: (constantesData) => {
        const constantes: Constantes = {
          ...constantesData,
          id: generateId()
        };
        
        set(state => ({
          constantes: [...state.constantes, constantes]
        }));
      },

      getConstantesByPatient: (patientId) => {
        return get().constantes.filter(c => c.patientId === patientId);
      },

      // Antécédents
      addAntecedent: (antecedentData) => {
        const antecedent: Antecedent = {
          ...antecedentData,
          id: generateId(),
          createdAt: new Date().toISOString()
        };
        
        set(state => ({
          antecedents: [...state.antecedents, antecedent]
        }));
      },

      updateAntecedent: (id, antecedentData) => {
        set(state => ({
          antecedents: state.antecedents.map(a => 
            a.id === id ? { ...a, ...antecedentData } : a
          )
        }));
      },

      getAntecedentsByPatient: (patientId) => {
        return get().antecedents.filter(a => a.patientId === patientId);
      },

      // Ordonnances
      addOrdonnance: (ordonnanceData) => {
        const ordonnance: Ordonnance = {
          ...ordonnanceData,
          id: generateId()
        };
        
        set(state => ({
          ordonnances: [...state.ordonnances, ordonnance]
        }));
      },

      getOrdonnancesByPatient: (patientId) => {
        return get().ordonnances.filter(o => o.patientId === patientId);
      },

      // Programmes de suivi
      addProgrammeSuivi: (programmeData) => {
        const programme: ProgrammeSuivi = {
          ...programmeData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set(state => ({
          programmesSuivi: [...state.programmesSuivi, programme]
        }));
      },

      updateProgrammeSuivi: (id, programmeData) => {
        set(state => ({
          programmesSuivi: state.programmesSuivi.map(p => 
            p.id === id ? { ...p, ...programmeData, updatedAt: new Date().toISOString() } : p
          )
        }));
      },

      getProgrammesSuiviByPatient: (patientId) => {
        return get().programmesSuivi.filter(p => p.patientId === patientId);
      }
    }),
    {
      name: 'clinika-data'
    }
  )
);