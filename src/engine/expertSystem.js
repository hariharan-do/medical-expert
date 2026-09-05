/**
 * AetherMed Clinical Inference Engine - Expert System Knowledge Base & Scoring Rules
 */

export const SYMPTOMS = [
  { id: 'fever', label: 'Fever', medicalTerm: 'Pyrexia', icon: 'thermometer', description: 'Core temp > 38.0°C / systemic febrile response' },
  { id: 'cough', label: 'Cough', medicalTerm: 'Tussis', icon: 'wind', description: 'Acute involuntary airway clearance reflex' },
  { id: 'body_pain', label: 'Body Pain', medicalTerm: 'Myalgia', icon: 'activity', description: 'Generalized muscle pain and muscular tenderness' },
  { id: 'headache', label: 'Headache', medicalTerm: 'Cephalea', icon: 'brain', description: 'Cranial vascular or tension pain disturbance' },
  { id: 'nausea', label: 'Nausea', medicalTerm: 'Dyspepsia', icon: 'frown', description: 'Epigastric distress with urge to vomit' },
  { id: 'vomiting', label: 'Vomiting', medicalTerm: 'Emesis', icon: 'alert-circle', description: 'Retrograde ejection of gastrointestinal contents' },
  { id: 'sneezing', label: 'Sneezing', medicalTerm: 'Sternutation', icon: 'feather', description: 'Paroxysmal nasal mucosal irritation' },
  { id: 'runny_nose', label: 'Runny Nose', medicalTerm: 'Rhinorrhea', icon: 'droplet', description: 'Copious nasal mucus hypersecretion' },
  { id: 'stomach_pain', label: 'Stomach Pain', medicalTerm: 'Abdominalgia', icon: 'shield-alert', description: 'Localized visceral or parietal abdominal pain' },
  { id: 'diarrhea', label: 'Diarrhea', medicalTerm: 'Dysentery', icon: 'refresh-cw', description: 'Frequent liquid or unformed stool evacuation' },
  { id: 'fatigue', label: 'Fatigue', medicalTerm: 'Lethargy', icon: 'battery-low', description: 'Profound physical exhaustion & diminished vitality' },
  { id: 'sore_throat', label: 'Sore Throat', medicalTerm: 'Pharyngitis', icon: 'mic-off', description: 'Acute posterior pharyngeal pain & erythema' }
];

export const CONDITIONS = [
  {
    id: 'influenza',
    name: 'Influenza (Acute Viral Flu)',
    category: 'Respiratory Infection',
    description: 'Systemic orthomyxovirus infection manifesting with rapid febrile onset, severe myalgia, and respiratory inflammation.',
    symptomWeights: { fever: 3, body_pain: 3, fatigue: 3, cough: 2, headache: 2, sore_throat: 1 },
    treatment: 'Protocol: Strict bed rest, aggressive oral rehydration, antipyretic administration (acetaminophen 500mg q6h). Neuraminidase inhibitor (Oseltamivir 75mg bid) indicated if within 48h of symptom onset.',
    precaution: 'Maintain respiratory isolation. Monitor pulse oximetry. Seek immediate care if dyspnea or confusion develops.',
    baseUrgency: 'PRIORITY_MEDICAL_CONSULTATION'
  },
  {
    id: 'covid19',
    name: 'COVID-19 (SARS-CoV-2 Acute Respiratory Disease)',
    category: 'Viral Pneumonitis / Upper Respiratory',
    description: 'Novel coronavirus infection causing multi-system inflammatory responses and acute upper/lower respiratory tract distress.',
    symptomWeights: { fever: 3, cough: 3, fatigue: 3, body_pain: 2, sore_throat: 2, headache: 2, nausea: 1 },
    treatment: 'Protocol: Symptomatic supportive therapy, home isolation, continuous pulse oximetry monitoring. Evaluate antiviral eligibility (Paxlovid / Ritonavir) for high-risk profiles.',
    precaution: 'Adhere to N95 respiratory containment. Seek emergency triage immediately if SpO2 drops below 94% or persistent chest pressure occurs.',
    baseUrgency: 'PRIORITY_MEDICAL_CONSULTATION'
  },
  {
    id: 'common_cold',
    name: 'Acute Nasopharyngitis (Common Cold)',
    category: 'Upper Respiratory Infection',
    description: 'Benign, self-limiting rhinovirus or adenovirus infection localized primarily to nasal mucosa and upper pharynx.',
    symptomWeights: { sneezing: 3, runny_nose: 3, sore_throat: 3, cough: 2, fatigue: 1, headache: 1 },
    treatment: 'Protocol: Intranasal hypertonic saline irrigation, warm fluid hydration, oral analgesics, adequate sleep hygiene.',
    precaution: 'Standard contact hygiene, frequent hand sanitization. Avoid unnecessary antibiotic utilization for viral pathogenesis.',
    baseUrgency: 'ROUTINE_OBSERVATION'
  },
  {
    id: 'gastroenteritis',
    name: 'Acute Viral Gastroenteritis',
    category: 'Gastrointestinal Pathophysiology',
    description: 'Mucosal mucosal gastroenteropathy (Norovirus/Rotavirus) leading to acute emesis, secretory diarrhea, and electrolyte shifts.',
    symptomWeights: { nausea: 3, vomiting: 3, diarrhea: 3, stomach_pain: 3, fatigue: 2, fever: 1 },
    treatment: 'Protocol: WHO-standard Oral Rehydration Solution (ORS), gradual advancement to BRAT diet, gut motility rest.',
    precaution: 'Disinfect contact surfaces with chlorine-based agents. Monitor for severe hypovolemia or intractable emesis.',
    baseUrgency: 'OUTPATIENT_EVALUATION'
  },
  {
    id: 'migraine',
    name: 'Acute Migraine Cephalea',
    category: 'Neurological Vascular Condition',
    description: 'Paroxysmal neurovascular headache characterized by unilateral throbbing pain, sensory hypersensitivity, and autonomic distress.',
    symptomWeights: { headache: 3, nausea: 3, vomiting: 2, fatigue: 2 },
    treatment: 'Protocol: Dark environment, cold occipital compress, early administration of 5-HT1B/1D receptor agonists (Triptans) or NSAIDs.',
    precaution: 'Log dietary and sensory triggers. Avoid overusing acute analgesics to prevent medication-overuse headache (MOH).',
    baseUrgency: 'OUTPATIENT_EVALUATION'
  },
  {
    id: 'strep_throat',
    name: 'Streptococcal Pharyngitis',
    category: 'Bacterial Upper Respiratory',
    description: 'Group A Beta-Hemolytic Streptococcus pharyngeal infection presenting with severe dysphagia, tonsillar exudates, and fever.',
    symptomWeights: { sore_throat: 3, fever: 3, headache: 2, body_pain: 1, fatigue: 1 },
    treatment: 'Protocol: Targeted antibacterial therapy (Penicillin V / Amoxicillin 500mg bid x 10d), warm saline lavage, oral analgesia.',
    precaution: 'Complete full 10-day antibiotic course to prevent acute rheumatic fever and post-streptococcal glomerulonephritis.',
    baseUrgency: 'PRIORITY_MEDICAL_CONSULTATION'
  },
  {
    id: 'food_poisoning',
    name: 'Acute Foodborne Enterotoxicoses',
    category: 'Gastrointestinal Toxicology',
    description: 'Rapid-onset intestinal pathology following ingestion of pre-formed bacterial enterotoxins (S. aureus, B. cereus).',
    symptomWeights: { stomach_pain: 3, nausea: 3, vomiting: 3, diarrhea: 3, fever: 2, body_pain: 1 },
    treatment: 'Protocol: Isotonic electrolyte replacement, gut rest, cautious antiemetic evaluation under physician oversight.',
    precaution: 'Contraindicated for motility inhibitors if dysentery or high fever present. Seek urgent care for hematochezia.',
    baseUrgency: 'PRIORITY_MEDICAL_CONSULTATION'
  },
  {
    id: 'tension_headache',
    name: 'Tension-Type Cephalea',
    category: 'Musculoskeletal Neurological',
    description: 'Bilateral pressing or tightening cranial pain associated with cervical myofascial strain and elevated stress levels.',
    symptomWeights: { headache: 3, fatigue: 2, body_pain: 1 },
    treatment: 'Protocol: Cervical physical therapy, stress reduction techniques, short-term NSAID administration.',
    precaution: 'Optimize ergonomic workspace alignment, regulate sleep schedule, limit caffeine dependency.',
    baseUrgency: 'ROUTINE_OBSERVATION'
  },
  {
    id: 'allergic_rhinitis',
    name: 'Allergic Rhinitis / Rhinoconjunctivitis',
    category: 'Immunological Hypersensitivity',
    description: 'IgE-mediated type I hypersensitivity reaction of the upper airway mucosa triggered by environmental allergens.',
    symptomWeights: { sneezing: 3, runny_nose: 3, fatigue: 1, headache: 1 },
    treatment: 'Protocol: Non-sedating H1 antihistamines (Cetirizine 10mg daily), intranasal corticosteroid spray (Fluticasone).',
    precaution: 'Minimize ambient allergen exposure, employ high-efficiency particulate air (HEPA) filtration.',
    baseUrgency: 'ROUTINE_OBSERVATION'
  }
];

export function calculateUrgency(selectedSymptoms, condition, matchPercentage) {
  const count = selectedSymptoms.length;
  const hasFever = selectedSymptoms.includes('fever');
  const hasVomiting = selectedSymptoms.includes('vomiting');
  const hasDiarrhea = selectedSymptoms.includes('diarrhea');
  const hasBodyPain = selectedSymptoms.includes('body_pain');
  const hasStomachPain = selectedSymptoms.includes('stomach_pain');

  if (hasFever && hasVomiting && (hasStomachPain || hasDiarrhea)) {
    return 'EMERGENCY_TRIAGE_ADVISORY';
  }

  if (hasFever && hasBodyPain && count >= 4) {
    if (condition.baseUrgency === 'ROUTINE_OBSERVATION' || condition.baseUrgency === 'OUTPATIENT_EVALUATION') {
      return 'PRIORITY_MEDICAL_CONSULTATION';
    }
    return 'EMERGENCY_TRIAGE_ADVISORY';
  }

  if (hasVomiting && hasDiarrhea && count >= 3) {
    return 'PRIORITY_MEDICAL_CONSULTATION';
  }

  return condition.baseUrgency;
}

export function evaluateSymptoms(selectedSymptoms = [], minThreshold = 30) {
  if (!Array.isArray(selectedSymptoms) || selectedSymptoms.length === 0) {
    return [];
  }

  const results = [];

  for (const condition of CONDITIONS) {
    const weights = condition.symptomWeights;
    const maxPossibleWeight = Object.values(weights).reduce((acc, w) => acc + w, 0);

    let matchedSum = 0;
    const matchedSymptomsList = [];

    for (const symptomId of selectedSymptoms) {
      if (weights[symptomId]) {
        const weight = weights[symptomId];
        matchedSum += weight;
        const symptomObj = SYMPTOMS.find(s => s.id === symptomId);
        matchedSymptomsList.push({
          id: symptomId,
          label: symptomObj ? symptomObj.label : symptomId,
          medicalTerm: symptomObj ? symptomObj.medicalTerm : '',
          weight
        });
      }
    }

    const confidenceScore = maxPossibleWeight > 0 
      ? Math.round((matchedSum / maxPossibleWeight) * 100) 
      : 0;

    if (confidenceScore >= minThreshold) {
      const dynamicUrgency = calculateUrgency(selectedSymptoms, condition, confidenceScore);

      results.push({
        conditionId: condition.id,
        name: condition.name,
        category: condition.category,
        description: condition.description,
        confidenceScore,
        matchedSum,
        maxPossibleWeight,
        matchedSymptoms: matchedSymptomsList,
        treatment: condition.treatment,
        precaution: condition.precaution,
        urgency: dynamicUrgency
      });
    }
  }

  results.sort((a, b) => {
    if (b.confidenceScore !== a.confidenceScore) {
      return b.confidenceScore - a.confidenceScore;
    }
    return b.matchedSum - a.matchedSum;
  });

  return results;
}
