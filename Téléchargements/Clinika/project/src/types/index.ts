export type UserRole = 'admin' | 'medecin' | 'infirmier' | 'assistant';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  telephone?: string;
  specialite?: string;
  isFirstLogin?: boolean;
  createdAt: string;
}

export interface Patient {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: 'M' | 'F';
  telephone: string;
  adresse: string;
  email?: string;
  profession?: string;
  contactUrgence?: string;
  numeroCarnet: string;
  createdAt: string;
  updatedAt: string;
}

export interface Constantes {
  id: string;
  patientId: string;
  temperature?: number;
  tensionSystolique?: number;
  tensionDiastolique?: number;
  glycemie?: number;
  poids?: number;
  frequenceCardiaque?: number;
  frequenceRespiratoire?: number;
  saturationOxygene?: number;
  dateEnregistrement: string;
  infirmierId: string;
}

export interface Antecedent {
  id: string;
  patientId: string;
  type: 'maladie' | 'chirurgie' | 'allergie' | 'medicament';
  description: string;
  date?: string;
  actif: boolean;
  createdAt: string;
}

export interface RendezVous {
  id: string;
  patientId: string;
  medecinId: string;
  dateHeure: string;
  duree: number;
  motif: string;
  statut: 'planifie' | 'confirme' | 'en_attente' | 'en_consultation' | 'termine' | 'annule';
  statusPatient: 'non_arrive' | 'arrive' | 'en_consultation' | 'termine';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  medecinId: string;
  rendezVousId?: string;
  dateConsultation: string;
  motifConsultation: string;
  examenClinique: string;
  diagnostic: string;
  planTraitement: string;
  notes?: string;
  constantes?: Constantes;
  createdAt: string;
  updatedAt: string;
}

export interface Medicament {
  id: string;
  nom: string;
  dosage: string;
  forme: string;
  posologie: string;
  duree: string;
  instructions?: string;
}

export interface Ordonnance {
  id: string;
  consultationId: string;
  patientId: string;
  medecinId: string;
  medicaments: Medicament[];
  recommandations?: string;
  prochainRdv?: string;
  dateCreation: string;
  validite: string;
}

export interface ProgrammeSuivi {
  id: string;
  patientId: string;
  medecinId: string;
  titre: string;
  description: string;
  frequenceControle: string;
  prochainControle: string;
  objectifs: string[];
  statut: 'actif' | 'termine' | 'suspendu';
  createdAt: string;
  updatedAt: string;
}