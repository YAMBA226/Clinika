import jsPDF from 'jspdf';
import { Patient, Constantes, Antecedent, Consultation, Ordonnance, User } from '../types';

export const generatePatientPDF = (
  patient: Patient,
  data: {
    constantes: Constantes[];
    antecedents: Antecedent[];
    consultations: Consultation[];
    ordonnances: Ordonnance[];
  }
) => {
  const doc = new jsPDF();
  let yPosition = 20;

  // En-tête
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text('CLINIKA', 20, yPosition);
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Carnet de Santé Numérique', 20, yPosition + 10);
  
  yPosition += 30;

  // Informations du patient
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('INFORMATIONS PATIENT', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Nom: ${patient.nom}`, 20, yPosition);
  doc.text(`Prénom: ${patient.prenom}`, 20, yPosition + 8);
  doc.text(`Date de naissance: ${new Date(patient.dateNaissance).toLocaleDateString('fr-FR')}`, 20, yPosition + 16);
  doc.text(`Sexe: ${patient.sexe === 'F' ? 'Féminin' : 'Masculin'}`, 20, yPosition + 24);
  doc.text(`Téléphone: ${patient.telephone}`, 20, yPosition + 32);
  doc.text(`N° Carnet: ${patient.numeroCarnet}`, 20, yPosition + 40);
  
  yPosition += 60;

  // Antécédents
  if (data.antecedents.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text('ANTÉCÉDENTS MÉDICAUX', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    data.antecedents.forEach((antecedent) => {
      doc.text(`• ${antecedent.type.toUpperCase()}: ${antecedent.description}`, 20, yPosition);
      yPosition += 6;
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
    });
    yPosition += 10;
  }

  // Dernières constantes
  if (data.constantes.length > 0) {
    const dernieresConstantes = data.constantes[data.constantes.length - 1];
    
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text('DERNIÈRES CONSTANTES', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${new Date(dernieresConstantes.dateEnregistrement).toLocaleDateString('fr-FR')}`, 20, yPosition);
    yPosition += 8;

    if (dernieresConstantes.temperature) {
      doc.text(`Température: ${dernieresConstantes.temperature}°C`, 20, yPosition);
      yPosition += 6;
    }
    if (dernieresConstantes.tensionSystolique && dernieresConstantes.tensionDiastolique) {
      doc.text(`Tension: ${dernieresConstantes.tensionSystolique}/${dernieresConstantes.tensionDiastolique} mmHg`, 20, yPosition);
      yPosition += 6;
    }
    if (dernieresConstantes.poids) {
      doc.text(`Poids: ${dernieresConstantes.poids} kg`, 20, yPosition);
      yPosition += 6;
    }
    if (dernieresConstantes.frequenceCardiaque) {
      doc.text(`Fréquence cardiaque: ${dernieresConstantes.frequenceCardiaque} bpm`, 20, yPosition);
      yPosition += 6;
    }
    yPosition += 10;
  }

  // Consultations récentes
  if (data.consultations.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text('CONSULTATIONS RÉCENTES', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    data.consultations.slice(-5).forEach((consultation) => {
      doc.text(`Date: ${new Date(consultation.dateConsultation).toLocaleDateString('fr-FR')}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Motif: ${consultation.motifConsultation}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Diagnostic: ${consultation.diagnostic}`, 20, yPosition);
      yPosition += 10;
      
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
    });
  }

  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} - Page ${i}/${pageCount}`, 20, 290);
  }

  doc.save(`carnet_sante_${patient.nom}_${patient.prenom}.pdf`);
};

export const generateOrdonnancePDF = (
  ordonnance: Ordonnance,
  patient: Patient,
  medecin: User
) => {
  const doc = new jsPDF();
  let yPosition = 20;

  // En-tête
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text('CLINIKA', 20, yPosition);
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('ORDONNANCE MÉDICALE', 20, yPosition + 15);
  
  yPosition += 40;

  // Informations médecin
  doc.setFontSize(12);
  doc.setTextColor(59, 130, 246);
  doc.text('MÉDECIN PRESCRIPTEUR', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Dr. ${medecin.prenom} ${medecin.nom}`, 20, yPosition);
  if (medecin.specialite) {
    doc.text(`Spécialité: ${medecin.specialite}`, 20, yPosition + 8);
  }
  
  yPosition += 30;

  // Informations patient
  doc.setFontSize(12);
  doc.setTextColor(59, 130, 246);
  doc.text('PATIENT', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Nom: ${patient.nom}`, 20, yPosition);
  doc.text(`Prénom: ${patient.prenom}`, 20, yPosition + 8);
  doc.text(`Date de naissance: ${new Date(patient.dateNaissance).toLocaleDateString('fr-FR')}`, 20, yPosition + 16);
  
  yPosition += 40;

  // Date de prescription
  doc.setFontSize(10);
  doc.text(`Date de prescription: ${new Date(ordonnance.dateCreation).toLocaleDateString('fr-FR')}`, 20, yPosition);
  yPosition += 20;

  // Médicaments
  doc.setFontSize(12);
  doc.setTextColor(59, 130, 246);
  doc.text('PRESCRIPTION', 20, yPosition);
  yPosition += 15;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  ordonnance.medicaments.forEach((medicament, index) => {
    doc.text(`${index + 1}. ${medicament.nom}`, 20, yPosition);
    yPosition += 8;
    
    if (medicament.dosage) {
      doc.text(`   Dosage: ${medicament.dosage}`, 25, yPosition);
      yPosition += 6;
    }
    
    if (medicament.forme) {
      doc.text(`   Forme: ${medicament.forme}`, 25, yPosition);
      yPosition += 6;
    }
    
    if (medicament.posologie) {
      doc.text(`   Posologie: ${medicament.posologie}`, 25, yPosition);
      yPosition += 6;
    }
    
    if (medicament.duree) {
      doc.text(`   Durée: ${medicament.duree}`, 25, yPosition);
      yPosition += 6;
    }
    
    if (medicament.instructions) {
      doc.text(`   Instructions: ${medicament.instructions}`, 25, yPosition);
      yPosition += 6;
    }
    
    yPosition += 10;
    
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
  });

  // Recommandations
  if (ordonnance.recommandations) {
    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(59, 130, 246);
    doc.text('RECOMMANDATIONS', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(ordonnance.recommandations, 170);
    doc.text(lines, 20, yPosition);
    yPosition += lines.length * 6 + 10;
  }

  // Prochain RDV
  if (ordonnance.prochainRdv) {
    doc.setFontSize(10);
    doc.text(`Prochain rendez-vous: ${ordonnance.prochainRdv}`, 20, yPosition);
    yPosition += 15;
  }

  // Signature
  yPosition += 20;
  doc.text('Signature du médecin:', 120, yPosition);
  doc.text(`Dr. ${medecin.prenom} ${medecin.nom}`, 120, yPosition + 20);

  // Validité
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Ordonnance valide jusqu'au ${new Date(ordonnance.validite).toLocaleDateString('fr-FR')}`, 20, 280);
  doc.text(`Générée le ${new Date().toLocaleDateString('fr-FR')}`, 20, 290);

  doc.save(`ordonnance_${patient.nom}_${patient.prenom}_${new Date().toISOString().split('T')[0]}.pdf`);
};