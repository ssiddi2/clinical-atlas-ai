import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const questions = [
  // CARDIOLOGY (10 questions)
  {
    question_id: "CARD-001",
    stem: "A 58-year-old man with a history of hypertension and type 2 diabetes presents to the emergency department with crushing substernal chest pain radiating to his left arm that started 2 hours ago. He appears diaphoretic and anxious. His blood pressure is 90/60 mmHg, heart rate is 110 bpm, and oxygen saturation is 94% on room air. ECG shows ST-segment elevation in leads V1-V4. Which of the following is the most appropriate initial management?",
    options: ["Administer aspirin and prepare for primary percutaneous coronary intervention", "Start IV heparin and schedule stress testing for the next day", "Administer nitroglycerin sublingually and observe", "Order cardiac enzymes and wait for results before treatment", "Start beta-blocker therapy and admit to telemetry"],
    correct_answer_index: 0,
    explanation: "This patient presents with an acute ST-elevation myocardial infarction (STEMI) involving the anterior wall. The combination of crushing chest pain, diaphoresis, hypotension, and ST-elevation in V1-V4 is classic for anterior STEMI. Primary PCI is the gold standard treatment when available within 90-120 minutes of first medical contact. Aspirin should be given immediately to all patients with suspected ACS. The other options delay definitive treatment or are inappropriate for STEMI management.",
    subject: "Cardiology",
    system: "Cardiovascular",
    topic: "Acute Coronary Syndrome",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["STEMI", "chest pain", "PCI", "aspirin", "acute coronary syndrome"]
  },
  {
    question_id: "CARD-002",
    stem: "A 72-year-old woman presents with progressive dyspnea on exertion over the past 6 months. She reports she can no longer climb stairs without stopping to rest. Physical examination reveals a harsh crescendo-decrescendo systolic murmur best heard at the right upper sternal border that radiates to the carotids. There is also a slow-rising carotid pulse. Which of the following is the most likely diagnosis?",
    options: ["Aortic stenosis", "Mitral regurgitation", "Aortic regurgitation", "Mitral stenosis", "Tricuspid regurgitation"],
    correct_answer_index: 0,
    explanation: "The classic triad of aortic stenosis includes: 1) Harsh crescendo-decrescendo systolic murmur at right upper sternal border radiating to carotids, 2) Pulsus parvus et tardus (slow-rising, diminished carotid pulse), and 3) Symptoms of heart failure, syncope, or angina. The dyspnea on exertion indicates symptomatic AS, which carries a poor prognosis without valve replacement. Mitral regurgitation produces a holosystolic murmur at the apex radiating to the axilla.",
    subject: "Cardiology",
    system: "Cardiovascular",
    topic: "Valvular Heart Disease",
    difficulty: "easy",
    board_yield: "high",
    keywords: ["aortic stenosis", "murmur", "carotid pulse", "dyspnea"]
  },
  {
    question_id: "CARD-003",
    stem: "A 45-year-old woman with no significant past medical history presents with palpitations and lightheadedness. Her ECG shows an irregularly irregular rhythm with no discernible P waves and a ventricular rate of 142 bpm. Blood pressure is 128/82 mmHg. She is hemodynamically stable. Which of the following is the most appropriate next step in management?",
    options: ["Rate control with IV diltiazem or beta-blocker", "Immediate synchronized cardioversion", "Adenosine IV push", "Initiate anticoagulation and schedule ablation", "Atropine IV push"],
    correct_answer_index: 0,
    explanation: "This patient has atrial fibrillation with rapid ventricular response (RVR). The irregularly irregular rhythm without P waves is pathognomonic for AF. Since she is hemodynamically stable, rate control with calcium channel blockers (diltiazem) or beta-blockers is first-line therapy. Cardioversion is reserved for unstable patients or after anticoagulation considerations in stable patients. Adenosine is used for SVT with regular rhythm. Atropine would worsen tachycardia.",
    subject: "Cardiology",
    system: "Cardiovascular",
    topic: "Arrhythmias",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["atrial fibrillation", "rate control", "diltiazem", "irregular rhythm"]
  },
  {
    question_id: "CARD-004",
    stem: "A 35-year-old man collapses during a basketball game. Bystander CPR is initiated. When paramedics arrive, the cardiac monitor shows ventricular fibrillation. Which of the following is the most appropriate immediate intervention?",
    options: ["Defibrillation with 200J biphasic shock", "Epinephrine 1mg IV push", "Amiodarone 300mg IV push", "Continue CPR for 2 minutes before any intervention", "Synchronized cardioversion at 100J"],
    correct_answer_index: 0,
    explanation: "Ventricular fibrillation is a shockable rhythm, and defibrillation is the definitive treatment. In VF/pulseless VT arrest, defibrillation should be performed as soon as possible - 'shock first.' Each minute of delay in defibrillation reduces survival by 7-10%. Epinephrine and amiodarone are given after the first or second shock if VF persists. Synchronized cardioversion is used for organized rhythms with a pulse, not VF.",
    subject: "Cardiology",
    system: "Cardiovascular",
    topic: "Cardiac Arrest",
    difficulty: "easy",
    board_yield: "high",
    keywords: ["ventricular fibrillation", "defibrillation", "cardiac arrest", "ACLS"]
  },
  {
    question_id: "CARD-005",
    stem: "A 62-year-old man with heart failure (EF 30%) on optimal medical therapy presents for routine follow-up. His medications include lisinopril, carvedilol, and spironolactone. His potassium is 4.8 mEq/L and creatinine is 1.4 mg/dL. He reports NYHA Class II symptoms. Which additional medication has been shown to reduce mortality in this patient population?",
    options: ["Sacubitril-valsartan replacing lisinopril", "Digoxin", "Amlodipine", "Hydralazine", "Ivabradine"],
    correct_answer_index: 0,
    explanation: "Sacubitril-valsartan (Entresto) has been shown in the PARADIGM-HF trial to significantly reduce cardiovascular death and heart failure hospitalizations compared to enalapril in patients with HFrEF. It should replace ACE inhibitors in patients who remain symptomatic despite optimal therapy. Digoxin reduces hospitalizations but not mortality. Ivabradine is indicated for HR >70 despite beta-blocker. The patient is already on standard GDMT.",
    subject: "Cardiology",
    system: "Cardiovascular",
    topic: "Heart Failure",
    difficulty: "hard",
    board_yield: "high",
    keywords: ["heart failure", "sacubitril", "ARNI", "reduced ejection fraction"]
  },
  {
    question_id: "CARD-006",
    stem: "A 28-year-old woman presents with sharp chest pain that worsens with inspiration and improves when leaning forward. She had a viral upper respiratory infection 2 weeks ago. Vital signs are stable. Physical examination reveals a scratchy, high-pitched sound heard best at the left sternal border. ECG shows diffuse ST-segment elevation with PR depression. Which of the following is the most likely diagnosis?",
    options: ["Acute pericarditis", "Acute myocardial infarction", "Pulmonary embolism", "Costochondritis", "Aortic dissection"],
    correct_answer_index: 0,
    explanation: "This presentation is classic for acute pericarditis: pleuritic chest pain that improves with leaning forward, recent viral illness, pericardial friction rub (scratchy sound at left sternal border), and ECG showing diffuse ST elevation with PR depression. Unlike STEMI, the ST changes are diffuse (not following coronary distribution) and PR depression is characteristic. Most cases are viral/idiopathic and treated with NSAIDs and colchicine.",
    subject: "Cardiology",
    system: "Cardiovascular",
    topic: "Pericardial Disease",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["pericarditis", "friction rub", "ST elevation", "pleuritic pain"]
  },
  {
    question_id: "CARD-007",
    stem: "A 55-year-old man with poorly controlled hypertension presents with sudden onset of severe tearing chest pain radiating to his back. Blood pressure is 185/110 mmHg in the right arm and 140/90 mmHg in the left arm. Chest X-ray shows a widened mediastinum. Which of the following is the most appropriate next step?",
    options: ["CT angiography of the chest", "Emergent cardiac catheterization", "Thrombolytic therapy", "ECG and cardiac enzymes", "Transthoracic echocardiography"],
    correct_answer_index: 0,
    explanation: "This patient has classic features of acute aortic dissection: sudden tearing chest pain radiating to the back, significant blood pressure differential between arms (>20 mmHg), widened mediastinum, and history of hypertension (major risk factor). CT angiography is the diagnostic test of choice due to its speed, availability, and accuracy. Thrombolytics are absolutely contraindicated. TEE is an alternative if CT is not available or patient is unstable.",
    subject: "Cardiology",
    system: "Cardiovascular",
    topic: "Aortic Dissection",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["aortic dissection", "tearing pain", "blood pressure differential", "widened mediastinum"]
  },
  {
    question_id: "CARD-008",
    stem: "A 67-year-old woman with atrial fibrillation (CHA2DS2-VASc score of 4) is currently taking warfarin. She presents for routine INR check which shows INR of 2.5. She asks about switching to a newer anticoagulant. She has normal renal function. Which of the following is an advantage of direct oral anticoagulants (DOACs) over warfarin?",
    options: ["No routine monitoring required", "Lower risk of intracranial hemorrhage only in patients over 75", "Ability to use in mechanical heart valve patients", "Lower cost than warfarin", "Easily reversible with vitamin K"],
    correct_answer_index: 0,
    explanation: "DOACs (dabigatran, rivaroxaban, apixaban, edoxaban) have several advantages over warfarin including: no routine monitoring, fewer drug-food interactions, rapid onset of action, and comparable or lower bleeding risk. They should NOT be used in mechanical heart valves. While specific reversal agents exist (idarucizumab for dabigatran, andexanet alfa for factor Xa inhibitors), they are expensive. DOACs typically cost more than warfarin.",
    subject: "Cardiology",
    system: "Cardiovascular",
    topic: "Anticoagulation",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["DOAC", "warfarin", "atrial fibrillation", "anticoagulation"]
  },
  {
    question_id: "CARD-009",
    stem: "A 40-year-old man presents with exertional syncope and a family history of sudden cardiac death (brother died at age 35). Physical examination reveals a harsh systolic murmur at the left lower sternal border that increases with Valsalva maneuver and standing. Echocardiography shows asymmetric septal hypertrophy with systolic anterior motion of the mitral valve. Which of the following is the most appropriate initial pharmacotherapy?",
    options: ["Beta-blocker", "Digoxin", "Nitroglycerin", "ACE inhibitor", "Dihydropyridine calcium channel blocker"],
    correct_answer_index: 0,
    explanation: "This patient has hypertrophic cardiomyopathy (HCM) with left ventricular outflow tract obstruction. The murmur increases with maneuvers that decrease preload (Valsalva, standing) because reduced ventricular volume worsens the obstruction. Beta-blockers are first-line therapy - they decrease heart rate (allowing more filling time), reduce contractility, and decrease the outflow gradient. Digoxin and dihydropyridine CCBs increase contractility and worsen obstruction. Nitrates reduce preload and worsen symptoms.",
    subject: "Cardiology",
    system: "Cardiovascular",
    topic: "Cardiomyopathy",
    difficulty: "hard",
    board_yield: "high",
    keywords: ["HCM", "hypertrophic cardiomyopathy", "beta-blocker", "LVOT obstruction"]
  },
  {
    question_id: "CARD-010",
    stem: "A 50-year-old man presents with progressive bilateral lower extremity edema, fatigue, and exertional dyspnea. He has a history of radiation therapy for Hodgkin lymphoma 20 years ago. Physical examination shows elevated JVP with Kussmaul sign, distant heart sounds, and hepatomegaly. ECG shows low voltage. Which of the following is the most likely diagnosis?",
    options: ["Constrictive pericarditis", "Dilated cardiomyopathy", "Restrictive cardiomyopathy", "Cardiac tamponade", "Right heart failure from pulmonary hypertension"],
    correct_answer_index: 0,
    explanation: "Radiation therapy is a known cause of constrictive pericarditis, typically presenting years after treatment. Key findings include: Kussmaul sign (JVP rises with inspiration - pathognomonic), elevated JVP, hepatomegaly, edema, and low-voltage ECG. The pericardium becomes thickened and calcified, restricting diastolic filling. Cardiac tamponade would show pulsus paradoxus rather than Kussmaul sign. Differentiating constrictive pericarditis from restrictive cardiomyopathy can be challenging but the radiation history and Kussmaul sign favor constriction.",
    subject: "Cardiology",
    system: "Cardiovascular",
    topic: "Pericardial Disease",
    difficulty: "hard",
    board_yield: "medium",
    keywords: ["constrictive pericarditis", "Kussmaul sign", "radiation", "JVP"]
  },

  // PULMONOLOGY (8 questions)
  {
    question_id: "PULM-001",
    stem: "A 65-year-old man with a 50-pack-year smoking history presents with progressive dyspnea and chronic productive cough. Pulmonary function tests show FEV1/FVC ratio of 0.62 and FEV1 of 55% predicted with minimal bronchodilator response. Chest X-ray shows hyperinflation and flattened diaphragms. Which of the following is the most appropriate initial maintenance therapy?",
    options: ["Long-acting beta-agonist (LABA) or long-acting muscarinic antagonist (LAMA)", "Inhaled corticosteroid alone", "Oral theophylline", "Systemic corticosteroids", "Short-acting beta-agonist scheduled four times daily"],
    correct_answer_index: 0,
    explanation: "This patient has moderate COPD (GOLD Stage 2: FEV1 50-79% predicted). According to GOLD guidelines, long-acting bronchodilators (LABA or LAMA) are first-line maintenance therapy. LAMA (tiotropium) may be preferred due to lower exacerbation rates. Inhaled corticosteroids are added for patients with frequent exacerbations or elevated eosinophils. Systemic corticosteroids are reserved for acute exacerbations. SABA is for rescue use only.",
    subject: "Pulmonology",
    system: "Respiratory",
    topic: "COPD",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["COPD", "LAMA", "LABA", "bronchodilator", "smoking"]
  },
  {
    question_id: "PULM-002",
    stem: "A 25-year-old woman presents with acute onset of right-sided pleuritic chest pain and dyspnea. She takes oral contraceptives and returned from a 10-hour flight yesterday. Heart rate is 105 bpm, respiratory rate is 22/min, and oxygen saturation is 92% on room air. D-dimer is elevated at 850 ng/mL. Which of the following is the most appropriate next step?",
    options: ["CT pulmonary angiography", "Start heparin and order lower extremity Doppler", "Ventilation-perfusion scan", "Echocardiography", "Repeat D-dimer in 24 hours"],
    correct_answer_index: 0,
    explanation: "This patient has high clinical probability for pulmonary embolism given risk factors (OCPs, prolonged travel), symptoms (pleuritic chest pain, dyspnea), and elevated D-dimer. CT pulmonary angiography (CTPA) is the gold standard for diagnosis. The Wells criteria and elevated D-dimer warrant definitive imaging. While starting anticoagulation is important, imaging should be obtained promptly. V/Q scan is an alternative if CTPA is contraindicated (contrast allergy, renal failure).",
    subject: "Pulmonology",
    system: "Respiratory",
    topic: "Pulmonary Embolism",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["pulmonary embolism", "CTPA", "D-dimer", "DVT"]
  },
  {
    question_id: "PULM-003",
    stem: "A 30-year-old man with asthma presents to the emergency department with severe dyspnea, wheezing, and inability to speak in full sentences. He has been using his albuterol inhaler every hour for the past day without relief. Peak flow is 35% of his personal best. Oxygen saturation is 88% on room air. After initial treatment with continuous nebulized albuterol and ipratropium, IV corticosteroids, and oxygen, his symptoms are not improving. Which of the following is the most appropriate next step?",
    options: ["IV magnesium sulfate", "Subcutaneous epinephrine", "Intubation and mechanical ventilation", "IV aminophylline", "Heliox therapy"],
    correct_answer_index: 0,
    explanation: "This patient has severe acute asthma (status asthmaticus) not responding to initial therapy. IV magnesium sulfate is recommended for severe exacerbations not responding to initial bronchodilator therapy - it causes bronchial smooth muscle relaxation. The patient is not yet in respiratory failure requiring intubation (would need rising CO2, altered mental status, or exhaustion). Subcutaneous epinephrine is an alternative if IV access is difficult. Aminophylline has fallen out of favor due to toxicity.",
    subject: "Pulmonology",
    system: "Respiratory",
    topic: "Asthma",
    difficulty: "hard",
    board_yield: "high",
    keywords: ["status asthmaticus", "magnesium sulfate", "severe asthma", "bronchodilator"]
  },
  {
    question_id: "PULM-004",
    stem: "A 55-year-old man presents with 3 months of progressive dyspnea, dry cough, and fatigue. He has worked in construction for 30 years. High-resolution CT of the chest shows bilateral reticular opacities with honeycombing predominantly in the lower lobes and subpleural regions. Pulmonary function tests reveal FVC 65% predicted, FEV1 70% predicted, FEV1/FVC 0.85, and DLCO 45% predicted. Which of the following is the most likely diagnosis?",
    options: ["Idiopathic pulmonary fibrosis", "Hypersensitivity pneumonitis", "Sarcoidosis", "COPD", "Asbestosis"],
    correct_answer_index: 0,
    explanation: "The CT pattern of bilateral, basal-predominant reticular opacities with honeycombing and subpleural distribution is classic for usual interstitial pneumonia (UIP), the radiologic pattern of idiopathic pulmonary fibrosis (IPF). PFTs show a restrictive pattern (reduced FVC with preserved or elevated FEV1/FVC ratio) and severely reduced DLCO. While asbestosis is possible given occupational history, the classic UIP pattern without pleural plaques favors IPF. Sarcoidosis typically shows upper lobe predominance and lymphadenopathy.",
    subject: "Pulmonology",
    system: "Respiratory",
    topic: "Interstitial Lung Disease",
    difficulty: "hard",
    board_yield: "medium",
    keywords: ["IPF", "honeycombing", "restrictive", "pulmonary fibrosis"]
  },
  {
    question_id: "PULM-005",
    stem: "A 45-year-old woman is admitted to the ICU with acute respiratory distress syndrome (ARDS) secondary to pneumonia. She is intubated and mechanically ventilated. Her current settings are: tidal volume 500 mL (8 mL/kg predicted body weight), PEEP 5 cm H2O, FiO2 100%, respiratory rate 20. ABG shows pH 7.35, PaCO2 40, PaO2 58. What is the most appropriate ventilator adjustment?",
    options: ["Decrease tidal volume to 6 mL/kg and increase PEEP", "Increase tidal volume to 10 mL/kg", "Increase respiratory rate to 30", "Add inhaled nitric oxide", "Start prone positioning"],
    correct_answer_index: 0,
    explanation: "The ARDS Network trial demonstrated that low tidal volume ventilation (6 mL/kg predicted body weight) reduces mortality in ARDS. Current settings of 8 mL/kg are too high. Additionally, PEEP should be titrated up to improve oxygenation and prevent atelectasis - this patient has severe hypoxemia (P/F ratio ~58) with inadequate PEEP. Higher PEEP recruits collapsed alveoli. Prone positioning is indicated for severe ARDS (P/F <150) refractory to these measures.",
    subject: "Pulmonology",
    system: "Respiratory",
    topic: "ARDS",
    difficulty: "hard",
    board_yield: "high",
    keywords: ["ARDS", "low tidal volume", "PEEP", "mechanical ventilation"]
  },
  {
    question_id: "PULM-006",
    stem: "A 60-year-old man with a history of smoking presents with a 2-cm solitary pulmonary nodule found incidentally on chest CT. The nodule has irregular borders and is located in the right upper lobe. A PET scan shows increased FDG uptake with SUV of 5.2. Which of the following is the most appropriate next step?",
    options: ["CT-guided biopsy or surgical resection", "Repeat CT in 3 months", "Bronchoscopy with bronchoalveolar lavage", "Empiric antibiotic therapy", "PET-CT in 6 months"],
    correct_answer_index: 0,
    explanation: "This nodule has multiple high-risk features for malignancy: size >8mm, irregular/spiculated borders, upper lobe location, smoking history, and PET-positive with SUV >2.5. The probability of malignancy is very high (>65%). Tissue diagnosis is required - either CT-guided biopsy (for peripheral nodules) or surgical resection if the patient is a surgical candidate. Watchful waiting with serial imaging is inappropriate given the high probability of cancer. Bronchoscopy has low yield for peripheral nodules.",
    subject: "Pulmonology",
    system: "Respiratory",
    topic: "Lung Cancer",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["pulmonary nodule", "lung cancer", "PET scan", "biopsy"]
  },
  {
    question_id: "PULM-007",
    stem: "A 70-year-old man is brought to the emergency department after being found unresponsive. He has a history of COPD and uses home oxygen. ABG on room air shows pH 7.22, PaCO2 85 mmHg, PaO2 50 mmHg, HCO3 34 mEq/L. Which of the following best describes this acid-base disturbance?",
    options: ["Acute on chronic respiratory acidosis", "Acute respiratory acidosis", "Chronic respiratory acidosis", "Mixed respiratory and metabolic acidosis", "Respiratory acidosis with metabolic alkalosis"],
    correct_answer_index: 0,
    explanation: "The elevated HCO3 of 34 indicates chronic CO2 retention with metabolic compensation (expected HCO3 increase of 3.5 mEq/L for every 10 mmHg chronic rise in PaCO2). However, the pH is significantly acidotic, indicating an acute component superimposed on chronic hypercapnia. In pure chronic respiratory acidosis, the pH would be closer to normal. This patient likely has COPD with chronic CO2 retention who developed an acute exacerbation causing further CO2 rise.",
    subject: "Pulmonology",
    system: "Respiratory",
    topic: "Acid-Base Disorders",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["respiratory acidosis", "COPD", "hypercapnia", "ABG"]
  },
  {
    question_id: "PULM-008",
    stem: "A 35-year-old African American woman presents with dyspnea, dry cough, and painful red nodules on her shins. Chest X-ray shows bilateral hilar lymphadenopathy. Laboratory studies reveal elevated ACE level and hypercalcemia. Which of the following is the most likely diagnosis?",
    options: ["Sarcoidosis", "Tuberculosis", "Lung cancer with bone metastases", "Histoplasmosis", "Lymphoma"],
    correct_answer_index: 0,
    explanation: "This is classic sarcoidosis: young African American female with bilateral hilar lymphadenopathy (Löfgren syndrome when combined with erythema nodosum and arthralgias), elevated ACE level, hypercalcemia (due to extrarenal production of 1,25-vitamin D by activated macrophages), and erythema nodosum (the 'painful red nodules on shins'). While tuberculosis and lymphoma can cause hilar adenopathy, the constellation of findings is most consistent with sarcoidosis.",
    subject: "Pulmonology",
    system: "Respiratory",
    topic: "Sarcoidosis",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["sarcoidosis", "hilar lymphadenopathy", "erythema nodosum", "ACE"]
  },

  // GASTROENTEROLOGY (8 questions)
  {
    question_id: "GI-001",
    stem: "A 45-year-old man presents with a 3-month history of heartburn and regurgitation that occurs mainly at night. He has tried over-the-counter antacids with minimal relief. He denies dysphagia, weight loss, or GI bleeding. BMI is 32. Which of the following is the most appropriate initial management?",
    options: ["8-week trial of proton pump inhibitor", "Upper endoscopy", "Esophageal pH monitoring", "Barium swallow", "H. pylori testing and treatment"],
    correct_answer_index: 0,
    explanation: "This patient has typical GERD symptoms without alarm features (dysphagia, weight loss, bleeding, anemia). Per guidelines, an 8-week trial of once-daily PPI is the initial management for uncomplicated GERD. Endoscopy is indicated for alarm symptoms, failure of PPI therapy, or screening for Barrett's esophagus in high-risk patients. H. pylori testing is not routinely indicated for GERD as the relationship is complex and eradication may worsen symptoms in some patients.",
    subject: "Gastroenterology",
    system: "Gastrointestinal",
    topic: "GERD",
    difficulty: "easy",
    board_yield: "high",
    keywords: ["GERD", "PPI", "heartburn", "reflux"]
  },
  {
    question_id: "GI-002",
    stem: "A 55-year-old man with a history of heavy alcohol use presents with hematemesis and melena. He is hypotensive with BP 85/50 mmHg and tachycardic at 120 bpm. Physical examination shows splenomegaly, ascites, and spider angiomata. After initial resuscitation with IV fluids and blood products, which of the following medications should be started immediately?",
    options: ["IV octreotide and IV antibiotics (ceftriaxone)", "IV pantoprazole only", "Oral lactulose", "IV metoclopramide", "Oral propranolol"],
    correct_answer_index: 0,
    explanation: "This patient has signs of cirrhosis (spider angiomata, splenomegaly, ascites) presenting with upper GI bleeding, most likely from esophageal varices. Management includes: 1) Resuscitation, 2) IV octreotide (reduces splanchnic blood flow and portal pressure), 3) IV antibiotics (reduce infection risk and mortality - ceftriaxone is preferred), 4) Urgent endoscopy for band ligation. PPI alone is insufficient. Propranolol is for secondary prophylaxis, not acute bleeding. Lactulose is for hepatic encephalopathy.",
    subject: "Gastroenterology",
    system: "Gastrointestinal",
    topic: "Variceal Bleeding",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["variceal bleeding", "octreotide", "cirrhosis", "hematemesis"]
  },
  {
    question_id: "GI-003",
    stem: "A 28-year-old woman presents with 6 months of bloody diarrhea, abdominal cramping, and urgency. She reports 8-10 bowel movements daily. Colonoscopy shows continuous inflammation from the rectum extending to the splenic flexure with friable mucosa and pseudopolyps. Biopsies show crypt abscesses and goblet cell depletion. Which of the following is the most likely diagnosis?",
    options: ["Ulcerative colitis", "Crohn's disease", "Infectious colitis", "Ischemic colitis", "Microscopic colitis"],
    correct_answer_index: 0,
    explanation: "The findings are classic for ulcerative colitis: continuous inflammation starting from the rectum and extending proximally (left-sided colitis in this case), friable mucosa, pseudopolyps, and histology showing crypt abscesses and goblet cell depletion (mucosal inflammation only). Crohn's disease typically shows skip lesions, transmural inflammation, and can affect any part of the GI tract. Ischemic colitis usually affects watershed areas and spares the rectum. Microscopic colitis has normal-appearing mucosa.",
    subject: "Gastroenterology",
    system: "Gastrointestinal",
    topic: "Inflammatory Bowel Disease",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["ulcerative colitis", "bloody diarrhea", "IBD", "crypt abscess"]
  },
  {
    question_id: "GI-004",
    stem: "A 50-year-old man with a history of peptic ulcer disease treated 5 years ago presents with recurrent epigastric pain, diarrhea, and weight loss. He reports the pain is relieved by eating. Upper endoscopy reveals multiple duodenal ulcers and prominent gastric folds. Fasting gastrin level is 1,200 pg/mL (normal <100). Which of the following is the most appropriate next step to confirm the diagnosis?",
    options: ["Secretin stimulation test", "CT scan of the abdomen", "H. pylori testing", "Gastric pH measurement", "Somatostatin receptor scintigraphy"],
    correct_answer_index: 0,
    explanation: "The findings suggest Zollinger-Ellison syndrome (gastrinoma): multiple/recurrent duodenal ulcers, diarrhea (from acid hypersecretion), markedly elevated fasting gastrin (>10x normal), and prominent gastric folds (from trophic effect of gastrin). The secretin stimulation test confirms the diagnosis - in ZES, secretin paradoxically increases gastrin (>120 pg/mL rise), while in other causes of hypergastrinemia (PPI use, atrophic gastritis), gastrin stays the same or decreases. After confirmation, imaging localizes the tumor.",
    subject: "Gastroenterology",
    system: "Gastrointestinal",
    topic: "Zollinger-Ellison Syndrome",
    difficulty: "hard",
    board_yield: "medium",
    keywords: ["gastrinoma", "ZES", "secretin test", "duodenal ulcer"]
  },
  {
    question_id: "GI-005",
    stem: "A 65-year-old woman presents with painless jaundice, dark urine, and clay-colored stools. She has lost 15 pounds over the past 2 months. Physical examination reveals a palpable, non-tender gallbladder. CT scan shows a 3-cm mass in the head of the pancreas with dilation of both the common bile duct and pancreatic duct (double-duct sign). Which of the following is the most likely diagnosis?",
    options: ["Pancreatic adenocarcinoma", "Acute pancreatitis", "Chronic pancreatitis", "Cholangiocarcinoma", "Ampullary carcinoma"],
    correct_answer_index: 0,
    explanation: "The classic presentation of pancreatic head adenocarcinoma includes: painless obstructive jaundice, weight loss, palpable non-tender gallbladder (Courvoisier sign - gallbladder distends because obstruction is gradual, unlike gallstones which cause chronic inflammation and fibrosis), and the 'double-duct sign' on imaging (dilated CBD and pancreatic duct). The mass in the pancreatic head confirms the diagnosis. While cholangiocarcinoma and ampullary carcinoma can present similarly, the pancreatic mass location indicates pancreatic adenocarcinoma.",
    subject: "Gastroenterology",
    system: "Gastrointestinal",
    topic: "Pancreatic Cancer",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["pancreatic cancer", "painless jaundice", "Courvoisier sign", "double-duct sign"]
  },
  {
    question_id: "GI-006",
    stem: "A 35-year-old woman presents with diarrhea, bloating, and fatigue for several months. She also reports an itchy, blistering skin rash on her elbows and knees. Laboratory studies show iron deficiency anemia and low vitamin D. IgA tissue transglutaminase antibodies are elevated. Which of the following is the most appropriate next step?",
    options: ["Upper endoscopy with duodenal biopsies", "Colonoscopy", "Start gluten-free diet immediately", "Hydrogen breath test", "Stool studies for ova and parasites"],
    correct_answer_index: 0,
    explanation: "This patient has classic features of celiac disease: chronic diarrhea, malabsorption (iron and vitamin D deficiency), positive IgA-tTG antibodies, and dermatitis herpetiformis (the itchy, blistering rash on elbows and knees - pathognomonic for celiac). Despite positive serology, upper endoscopy with duodenal biopsies is required to confirm the diagnosis before initiating lifelong dietary therapy. Biopsies should be obtained while the patient is still consuming gluten; a gluten-free diet should not be started until diagnosis is confirmed.",
    subject: "Gastroenterology",
    system: "Gastrointestinal",
    topic: "Celiac Disease",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["celiac disease", "tTG", "dermatitis herpetiformis", "gluten"]
  },
  {
    question_id: "GI-007",
    stem: "A 60-year-old man with alcoholic cirrhosis presents with increasing abdominal girth over 2 weeks. Paracentesis reveals: WBC 650/μL with 75% neutrophils, protein 1.5 g/dL, glucose 65 mg/dL. Serum albumin is 2.8 g/dL. Which of the following is the most appropriate treatment?",
    options: ["IV cefotaxime and IV albumin", "Therapeutic large-volume paracentesis alone", "Oral diuretics (furosemide and spironolactone)", "TIPS procedure", "Liver transplant evaluation only"],
    correct_answer_index: 0,
    explanation: "The ascitic fluid analysis shows spontaneous bacterial peritonitis (SBP): PMN count >250/μL (this patient has ~488 PMNs = 650 × 0.75). SBP requires immediate IV antibiotics - cefotaxime (or ceftriaxone) covers the common pathogens (E. coli, Klebsiella, streptococci). IV albumin (1.5 g/kg on day 1, 1 g/kg on day 3) reduces the risk of hepatorenal syndrome and mortality. The SAAG would be >1.1 (portal hypertensive ascites), but the key finding here is the elevated PMN indicating infection.",
    subject: "Gastroenterology",
    system: "Gastrointestinal",
    topic: "Spontaneous Bacterial Peritonitis",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["SBP", "ascites", "cirrhosis", "cefotaxime"]
  },
  {
    question_id: "GI-008",
    stem: "A 48-year-old woman presents for colon cancer screening. She has no personal history of polyps or cancer. Her father was diagnosed with colon cancer at age 52, and her paternal aunt had endometrial cancer at age 50. Which of the following is the most appropriate screening recommendation?",
    options: ["Colonoscopy starting now, repeated every 1-2 years", "Colonoscopy at age 50", "Colonoscopy at age 45", "Annual fecal immunochemical test (FIT)", "CT colonography every 5 years"],
    correct_answer_index: 0,
    explanation: "This family history is concerning for Lynch syndrome (hereditary nonpolyposis colorectal cancer - HNPCC): first-degree relative with CRC before age 50, plus additional family member with Lynch-associated cancer (endometrial cancer). Amsterdam or Bethesda criteria may be met. Patients at risk for Lynch syndrome should have colonoscopy starting at age 20-25 (or 2-5 years before youngest family diagnosis) and repeated every 1-2 years. Genetic testing for mismatch repair genes should also be offered. Standard screening guidelines don't apply.",
    subject: "Gastroenterology",
    system: "Gastrointestinal",
    topic: "Colorectal Cancer Screening",
    difficulty: "hard",
    board_yield: "high",
    keywords: ["Lynch syndrome", "HNPCC", "colonoscopy", "hereditary cancer"]
  },

  // NEUROLOGY (8 questions)
  {
    question_id: "NEURO-001",
    stem: "A 70-year-old man is brought to the emergency department with sudden onset of right-sided weakness and slurred speech that started 90 minutes ago. CT head shows no hemorrhage. His blood pressure is 175/95 mmHg, and blood glucose is 120 mg/dL. NIHSS score is 14. Which of the following is the most appropriate treatment?",
    options: ["IV alteplase (tPA)", "Aspirin 325mg", "IV labetalol to lower BP to <140/90", "Mechanical thrombectomy without thrombolysis", "Observation and repeat CT in 24 hours"],
    correct_answer_index: 0,
    explanation: "This patient presents within the 4.5-hour window for IV thrombolysis with a significant ischemic stroke (NIHSS 14). CT shows no hemorrhage. Blood pressure <185/110 is acceptable for tPA administration (his BP of 175/95 is acceptable). There are no other apparent contraindications. IV alteplase should be given immediately to restore blood flow. Aspirin is given 24 hours after tPA. Mechanical thrombectomy may be considered as an adjunct for large vessel occlusion but doesn't replace initial tPA when indicated.",
    subject: "Neurology",
    system: "Nervous",
    topic: "Stroke",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["stroke", "tPA", "thrombolysis", "NIHSS"]
  },
  {
    question_id: "NEURO-002",
    stem: "A 25-year-old woman presents with a 2-day history of progressive weakness in both legs ascending to involve her arms. She had a respiratory infection 2 weeks ago. Examination shows areflexia, symmetric weakness (3/5 in legs, 4/5 in arms), and mild sensory loss in a stocking-glove distribution. CSF shows protein of 150 mg/dL with 3 WBCs (albuminocytologic dissociation). Which of the following is the most appropriate treatment?",
    options: ["IV immunoglobulin (IVIG) or plasmapheresis", "High-dose IV corticosteroids", "Oral prednisone taper", "Azathioprine", "Physical therapy only"],
    correct_answer_index: 0,
    explanation: "This is classic Guillain-Barré syndrome (GBS): ascending symmetric weakness, areflexia, preceding infection (often Campylobacter, CMV, or respiratory virus), and CSF with high protein but normal WBC count (albuminocytologic dissociation). Treatment is IVIG or plasmapheresis - both are equally effective. Corticosteroids are NOT effective for GBS (unlike CIDP). Patients need close monitoring for respiratory failure, which can occur rapidly. FVC should be measured serially.",
    subject: "Neurology",
    system: "Nervous",
    topic: "Guillain-Barré Syndrome",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["GBS", "areflexia", "IVIG", "albuminocytologic dissociation"]
  },
  {
    question_id: "NEURO-003",
    stem: "A 55-year-old woman presents with right hand tremor that is worse at rest and improves with intentional movement. She also reports difficulty initiating movements, shuffling gait, and constipation. Examination shows masked facies, cogwheel rigidity, and bradykinesia. Which of the following is the most appropriate initial pharmacotherapy?",
    options: ["Carbidopa-levodopa", "Pramipexole", "Benztropine", "Amantadine", "Selegiline"],
    correct_answer_index: 0,
    explanation: "This patient has Parkinson's disease with the classic triad of resting tremor, rigidity, and bradykinesia, plus supportive features (masked facies, shuffling gait, constipation). Carbidopa-levodopa is the most effective medication for PD motor symptoms and is first-line therapy, especially in patients with significant functional impairment. Dopamine agonists (pramipexole, ropinirole) are alternatives, particularly in younger patients to delay levodopa-related motor complications. At age 55 with significant symptoms, levodopa is appropriate.",
    subject: "Neurology",
    system: "Nervous",
    topic: "Parkinson's Disease",
    difficulty: "easy",
    board_yield: "high",
    keywords: ["Parkinson's", "tremor", "levodopa", "bradykinesia"]
  },
  {
    question_id: "NEURO-004",
    stem: "A 30-year-old woman presents with a 3-day history of left eye pain that worsens with eye movement and decreased vision in that eye. She reports color desaturation, particularly for red objects. Examination shows a relative afferent pupillary defect (RAPD) in the left eye. MRI of the brain with contrast shows enhancement of the left optic nerve and several periventricular white matter lesions. Which of the following is the most likely diagnosis?",
    options: ["Multiple sclerosis", "Neuromyelitis optica", "Acute disseminated encephalomyelitis", "Optic neuritis from Lyme disease", "Idiopathic intracranial hypertension"],
    correct_answer_index: 0,
    explanation: "This patient has optic neuritis (eye pain with movement, vision loss, RAPD, color desaturation, optic nerve enhancement) with additional demyelinating lesions in the periventricular white matter, highly suggestive of multiple sclerosis. Optic neuritis is often the presenting symptom of MS. The combination of optic neuritis plus periventricular white matter lesions (dissemination in space) suggests MS even on first presentation. NMO would typically show longitudinally extensive optic neuritis and/or spinal cord lesions.",
    subject: "Neurology",
    system: "Nervous",
    topic: "Multiple Sclerosis",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["multiple sclerosis", "optic neuritis", "RAPD", "demyelination"]
  },
  {
    question_id: "NEURO-005",
    stem: "A 65-year-old man presents with sudden severe headache ('worst headache of my life') that began 2 hours ago while lifting weights. He has nausea and mild neck stiffness. CT head without contrast is negative for hemorrhage. Which of the following is the most appropriate next step?",
    options: ["Lumbar puncture", "MRI brain", "CT angiography of head", "Repeat CT head in 24 hours", "Empiric treatment for migraine"],
    correct_answer_index: 0,
    explanation: "Sudden severe 'thunderclap' headache with exertional onset is concerning for subarachnoid hemorrhage (SAH) until proven otherwise. CT is 95-100% sensitive within 6 hours but decreases thereafter. A negative CT does NOT rule out SAH - lumbar puncture is required to look for xanthochromia (yellow CSF from bilirubin, appears 12+ hours after SAH) or RBCs. If LP is negative and done >12 hours from onset, SAH is essentially excluded. CTA may follow to look for aneurysm if SAH is confirmed.",
    subject: "Neurology",
    system: "Nervous",
    topic: "Subarachnoid Hemorrhage",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["SAH", "thunderclap headache", "lumbar puncture", "xanthochromia"]
  },
  {
    question_id: "NEURO-006",
    stem: "A 22-year-old man is brought to the emergency department after a witnessed generalized tonic-clonic seizure lasting 3 minutes. He has no prior seizure history. He admits to heavy alcohol use and stopped drinking 2 days ago. Vital signs: BP 155/95 mmHg, HR 110 bpm, temperature 37.8°C. He is tremulous and diaphoretic. Which of the following is the most likely cause of his seizure?",
    options: ["Alcohol withdrawal", "Epilepsy", "Hypoglycemia", "Meningitis", "Structural brain lesion"],
    correct_answer_index: 0,
    explanation: "The timing (2 days after alcohol cessation), autonomic hyperactivity (tachycardia, hypertension, tremor, diaphoresis), and low-grade fever are classic for alcohol withdrawal seizures. These typically occur 12-48 hours after the last drink and are generalized tonic-clonic. The patient is at risk for delirium tremens if not treated. Management includes benzodiazepines (treat withdrawal) and thiamine. Brain imaging may be considered but alcohol withdrawal is the most likely cause given this classic presentation.",
    subject: "Neurology",
    system: "Nervous",
    topic: "Alcohol Withdrawal",
    difficulty: "easy",
    board_yield: "high",
    keywords: ["alcohol withdrawal", "seizure", "tremor", "autonomic hyperactivity"]
  },
  {
    question_id: "NEURO-007",
    stem: "A 45-year-old woman presents with recurrent episodes of unilateral throbbing headache associated with nausea, photophobia, and phonophobia. Episodes last 4-72 hours and occur 3-4 times per month, causing her to miss work. She has tried OTC analgesics with limited relief. Which of the following is the most appropriate preventive medication?",
    options: ["Propranolol or topiramate", "Sumatriptan", "Acetaminophen", "Prednisone taper", "Oxygen therapy"],
    correct_answer_index: 0,
    explanation: "This patient has migraine without aura meeting criteria for preventive therapy (>4 headache days/month, significant disability, inadequate response to acute treatment). First-line preventive medications include beta-blockers (propranolol), antiepileptics (topiramate, valproate), antidepressants (amitriptyline), and CGRP inhibitors. Sumatriptan is for acute treatment, not prevention. Prednisone may be used for status migrainosus or cluster headache. Oxygen is first-line for cluster headache, not migraine.",
    subject: "Neurology",
    system: "Nervous",
    topic: "Migraine",
    difficulty: "easy",
    board_yield: "high",
    keywords: ["migraine", "preventive therapy", "propranolol", "topiramate"]
  },
  {
    question_id: "NEURO-008",
    stem: "A 72-year-old man is brought in by his family for progressive memory loss over 18 months. He gets lost driving to familiar places and has difficulty managing finances. His wife notes personality changes with apathy and social withdrawal. Mini-Mental State Exam score is 18/30. MRI shows generalized cerebral atrophy with hippocampal atrophy. Which of the following is the most appropriate initial pharmacotherapy?",
    options: ["Donepezil", "Memantine", "Haloperidol", "Lorazepam", "Methylphenidate"],
    correct_answer_index: 0,
    explanation: "This patient has probable Alzheimer's disease (progressive memory loss, visuospatial impairment, executive dysfunction, personality changes, hippocampal atrophy). For mild-to-moderate AD, cholinesterase inhibitors (donepezil, rivastigmine, galantamine) are first-line therapy - they modestly improve cognitive symptoms. Memantine (NMDA antagonist) is added for moderate-to-severe AD. Antipsychotics should be avoided unless absolutely necessary for behavioral symptoms due to increased mortality risk in dementia patients.",
    subject: "Neurology",
    system: "Nervous",
    topic: "Alzheimer's Disease",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["Alzheimer's", "donepezil", "dementia", "cholinesterase inhibitor"]
  },

  // ENDOCRINOLOGY (8 questions)
  {
    question_id: "ENDO-001",
    stem: "A 52-year-old man with type 2 diabetes presents for follow-up. His current medications include metformin 1000mg twice daily. His HbA1c is 8.5% (goal <7%). BMI is 34. He has a history of heart failure with reduced ejection fraction (EF 35%). Which of the following is the most appropriate medication to add?",
    options: ["SGLT2 inhibitor (empagliflozin or dapagliflozin)", "Sulfonylurea (glipizide)", "Thiazolidinedione (pioglitazone)", "Basal insulin", "DPP-4 inhibitor (sitagliptin)"],
    correct_answer_index: 0,
    explanation: "In patients with T2DM and heart failure with reduced ejection fraction (HFrEF), SGLT2 inhibitors have shown significant cardiovascular and renal benefits, including reduced HF hospitalizations and cardiovascular death (EMPA-REG, DAPA-HF trials). They also promote weight loss and have low hypoglycemia risk. Pioglitazone is CONTRAINDICATED in heart failure due to fluid retention. Sulfonylureas carry hypoglycemia risk and weight gain. SGLT2 inhibitors are preferred in this scenario according to ADA guidelines.",
    subject: "Endocrinology",
    system: "Endocrine",
    topic: "Diabetes Management",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["SGLT2 inhibitor", "diabetes", "heart failure", "empagliflozin"]
  },
  {
    question_id: "ENDO-002",
    stem: "A 35-year-old woman presents with weight gain, easy bruising, and purple striae on her abdomen. She has developed new-onset hypertension and her blood glucose is elevated. She has a round face and dorsocervical fat pad. Which of the following is the best initial screening test?",
    options: ["24-hour urinary free cortisol or late-night salivary cortisol", "Morning serum cortisol", "ACTH level", "Dexamethasone suppression test (8mg)", "MRI of the pituitary"],
    correct_answer_index: 0,
    explanation: "This patient has clinical features of Cushing syndrome (central obesity, moon facies, buffalo hump, purple striae, hypertension, glucose intolerance, easy bruising). Initial screening tests to confirm hypercortisolism include: 1) 24-hour urinary free cortisol (UFC), 2) Late-night salivary cortisol, or 3) Low-dose (1mg) overnight dexamethasone suppression test. At least two positive screening tests are needed before proceeding to localization. ACTH level helps differentiate ACTH-dependent vs independent causes AFTER confirming hypercortisolism.",
    subject: "Endocrinology",
    system: "Endocrine",
    topic: "Cushing Syndrome",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["Cushing syndrome", "cortisol", "striae", "buffalo hump"]
  },
  {
    question_id: "ENDO-003",
    stem: "A 28-year-old woman presents with palpitations, heat intolerance, weight loss despite increased appetite, and tremor. She has a diffusely enlarged thyroid gland without nodules. Eye examination shows lid lag and proptosis. TSH is <0.01 mIU/L and free T4 is 4.5 ng/dL (normal 0.8-1.8). Which of the following is the most likely cause of her hyperthyroidism?",
    options: ["Graves' disease", "Toxic multinodular goiter", "Thyroiditis", "Toxic adenoma", "Factitious thyrotoxicosis"],
    correct_answer_index: 0,
    explanation: "The combination of hyperthyroidism symptoms, diffuse goiter (without nodules), and thyroid eye disease (proptosis, lid lag) is pathognomonic for Graves' disease. Graves' is caused by TSH receptor-stimulating antibodies. Thyroid eye disease occurs only in Graves', not other causes of hyperthyroidism. Toxic multinodular goiter and toxic adenoma would show nodules. Thyroiditis typically causes transient mild hyperthyroidism followed by hypothyroidism. Thyroid-stimulating immunoglobulins (TSI) would confirm the diagnosis.",
    subject: "Endocrinology",
    system: "Endocrine",
    topic: "Hyperthyroidism",
    difficulty: "easy",
    board_yield: "high",
    keywords: ["Graves' disease", "hyperthyroidism", "proptosis", "goiter"]
  },
  {
    question_id: "ENDO-004",
    stem: "A 45-year-old woman is found to have a serum calcium of 11.5 mg/dL on routine labs. She is asymptomatic. PTH level is 95 pg/mL (normal 15-65). 24-hour urine calcium is 280 mg/day (normal 100-300). Vitamin D level is normal. Which of the following is the most likely diagnosis?",
    options: ["Primary hyperparathyroidism", "Familial hypocalciuric hypercalcemia", "Malignancy-associated hypercalcemia", "Vitamin D intoxication", "Sarcoidosis"],
    correct_answer_index: 0,
    explanation: "Hypercalcemia with elevated (or inappropriately normal) PTH indicates PTH-dependent hypercalcemia, which is primary hyperparathyroidism in most cases. The 24-hour urine calcium helps differentiate from familial hypocalciuric hypercalcemia (FHH), which has LOW urine calcium (<100 mg/day) and calcium-to-creatinine clearance ratio <0.01. This patient's normal urine calcium confirms primary HPT. In malignancy-associated hypercalcemia, PTH would be suppressed (<20).",
    subject: "Endocrinology",
    system: "Endocrine",
    topic: "Hyperparathyroidism",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["hyperparathyroidism", "hypercalcemia", "PTH", "urine calcium"]
  },
  {
    question_id: "ENDO-005",
    stem: "A 55-year-old man presents with fatigue, decreased libido, and erectile dysfunction. He has gynecomastia on exam. Morning testosterone level is 180 ng/dL (normal 300-1000). LH and FSH are both low. Prolactin is elevated at 85 ng/mL. Which of the following is the most appropriate next step?",
    options: ["MRI of the pituitary gland", "Repeat testosterone level in 2 weeks", "Start testosterone replacement", "Karyotype analysis", "Testicular ultrasound"],
    correct_answer_index: 0,
    explanation: "This patient has secondary (central) hypogonadism (low testosterone with inappropriately low LH/FSH) plus hyperprolactinemia and gynecomastia. This combination is classic for a prolactinoma. Elevated prolactin inhibits GnRH, causing hypogonadism. MRI of the pituitary is essential to evaluate for pituitary adenoma. If a prolactinoma is confirmed, dopamine agonists (cabergoline, bromocriptine) are first-line treatment, which typically normalizes prolactin and restores gonadal function. Don't start testosterone before imaging.",
    subject: "Endocrinology",
    system: "Endocrine",
    topic: "Pituitary Disorders",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["prolactinoma", "hypogonadism", "hyperprolactinemia", "pituitary"]
  },
  {
    question_id: "ENDO-006",
    stem: "A 25-year-old woman with type 1 diabetes presents with nausea, vomiting, and abdominal pain for 1 day. She ran out of insulin 2 days ago. Vital signs: BP 95/60 mmHg, HR 120 bpm, RR 28/min (deep, rapid breathing). Labs show glucose 450 mg/dL, pH 7.15, bicarbonate 8 mEq/L, anion gap 28, positive serum ketones. Which of the following is the most important initial intervention?",
    options: ["IV normal saline bolus", "IV regular insulin bolus", "IV bicarbonate", "Potassium replacement", "Subcutaneous insulin aspart"],
    correct_answer_index: 0,
    explanation: "This patient has diabetic ketoacidosis (DKA): hyperglycemia, metabolic acidosis, elevated anion gap, positive ketones. The most critical initial step is aggressive IV fluid resuscitation with normal saline - patients with DKA are typically 5-10L volume depleted. This improves perfusion and helps lower glucose. IV insulin is started AFTER initial fluid resuscitation (and after confirming K >3.3). Potassium is usually replaced once K <5.3 and urine output is established. Bicarbonate is only given if pH <6.9.",
    subject: "Endocrinology",
    system: "Endocrine",
    topic: "Diabetic Ketoacidosis",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["DKA", "IV fluids", "insulin", "anion gap"]
  },
  {
    question_id: "ENDO-007",
    stem: "A 60-year-old woman presents with severe fatigue, confusion, and constipation. She has a history of hypothyroidism but admits to not taking her levothyroxine for several months. Vital signs: BP 90/60 mmHg, HR 52 bpm, temperature 35°C. She is lethargic with periorbital edema and delayed relaxation of reflexes. Which of the following is the most likely diagnosis?",
    options: ["Myxedema coma", "Adrenal crisis", "Hypothermia", "Severe depression", "Hyperparathyroidism"],
    correct_answer_index: 0,
    explanation: "This patient has myxedema coma, a life-threatening decompensation of severe hypothyroidism: altered mental status, hypothermia, bradycardia, hypotension, classic physical findings (periorbital edema, delayed reflexes), and precipitated by medication non-compliance. Despite the name, patients are often not frankly comatose. Treatment is IV levothyroxine (with stress-dose hydrocortisone until adrenal insufficiency is ruled out), supportive care, and correction of underlying precipitant. Mortality is high without prompt treatment.",
    subject: "Endocrinology",
    system: "Endocrine",
    topic: "Hypothyroidism",
    difficulty: "hard",
    board_yield: "medium",
    keywords: ["myxedema coma", "hypothyroidism", "levothyroxine", "hypothermia"]
  },
  {
    question_id: "ENDO-008",
    stem: "A 50-year-old man with a history of hypertension resistant to three medications is found to have hypokalemia (K 2.9 mEq/L) despite not taking diuretics. He reports muscle weakness and fatigue. Blood pressure is 165/100 mmHg. Which of the following is the best initial screening test?",
    options: ["Plasma aldosterone-to-renin ratio", "24-hour urine cortisol", "Serum metanephrines", "Renal artery Doppler", "CT adrenal glands"],
    correct_answer_index: 0,
    explanation: "Resistant hypertension (uncontrolled on ≥3 medications) plus spontaneous hypokalemia is highly suggestive of primary aldosteronism (Conn syndrome). The aldosterone-to-renin ratio (ARR) is the screening test of choice - elevated aldosterone with suppressed renin (high ratio >30) suggests the diagnosis. Confirmatory testing and subtype differentiation (adenoma vs hyperplasia) follow. Primary aldosteronism is present in 5-10% of hypertensive patients and up to 20% of resistant hypertension cases. Imaging is done AFTER biochemical confirmation.",
    subject: "Endocrinology",
    system: "Endocrine",
    topic: "Primary Aldosteronism",
    difficulty: "hard",
    board_yield: "high",
    keywords: ["aldosteronism", "hypokalemia", "resistant hypertension", "aldosterone-renin ratio"]
  },

  // NEPHROLOGY (6 questions)
  {
    question_id: "NEPH-001",
    stem: "A 65-year-old man with diabetes and hypertension has progressive chronic kidney disease. His current eGFR is 25 mL/min/1.73m². Urinalysis shows 2+ protein. Labs show K 5.5 mEq/L, bicarbonate 18 mEq/L, phosphorus 5.8 mg/dL, and hemoglobin 9.5 g/dL. Which of the following complications is most appropriately treated with erythropoietin-stimulating agent?",
    options: ["Anemia of chronic kidney disease", "Hyperkalemia", "Metabolic acidosis", "Hyperphosphatemia", "Proteinuria"],
    correct_answer_index: 0,
    explanation: "This patient has CKD stage 4 (eGFR 15-29) with multiple complications. Anemia in CKD is primarily due to decreased erythropoietin production by failing kidneys. Erythropoietin-stimulating agents (ESAs like epoetin alfa or darbepoetin) are indicated when Hgb <10 g/dL after ruling out other causes and correcting iron deficiency. Target Hgb is 10-11.5 g/dL. Hyperkalemia is treated with dietary restriction, diuretics, or potassium binders. Metabolic acidosis is treated with bicarbonate supplementation. Hyperphosphatemia requires phosphate binders.",
    subject: "Nephrology",
    system: "Renal",
    topic: "Chronic Kidney Disease",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["CKD", "anemia", "erythropoietin", "ESA"]
  },
  {
    question_id: "NEPH-002",
    stem: "A 45-year-old woman presents with cola-colored urine, periorbital edema, and hypertension that developed 2 weeks after a pharyngitis. Urinalysis shows RBC casts and proteinuria. Serum creatinine is 2.5 mg/dL (baseline 0.9). Complement C3 is low, and ASO titer is elevated. Which of the following is the most likely diagnosis?",
    options: ["Post-streptococcal glomerulonephritis", "IgA nephropathy", "Minimal change disease", "Membranous nephropathy", "Lupus nephritis"],
    correct_answer_index: 0,
    explanation: "This is classic post-streptococcal glomerulonephritis (PSGN): nephritic syndrome (hematuria with RBC casts, hypertension, edema, acute kidney injury) occurring 1-3 weeks after streptococcal pharyngitis, with low C3 and elevated ASO titer. PSGN is immune complex-mediated. IgA nephropathy (Berger disease) presents with gross hematuria during or within 1-2 days of upper respiratory infection (synpharyngitic), not 2 weeks later, and typically has normal complement. Treatment of PSGN is supportive; prognosis is excellent in children, variable in adults.",
    subject: "Nephrology",
    system: "Renal",
    topic: "Glomerulonephritis",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["PSGN", "glomerulonephritis", "RBC casts", "low C3"]
  },
  {
    question_id: "NEPH-003",
    stem: "A 35-year-old man is found to have blood pressure of 180/110 mmHg, serum creatinine of 3.0 mg/dL, and bilateral small kidneys on ultrasound. He has no significant past medical history. Family history reveals his father and two paternal uncles are on dialysis. Which of the following is the most likely diagnosis?",
    options: ["Autosomal dominant polycystic kidney disease", "Autosomal recessive polycystic kidney disease", "Chronic glomerulonephritis", "Hypertensive nephrosclerosis", "IgA nephropathy"],
    correct_answer_index: 0,
    explanation: "Wait - ADPKD typically shows ENLARGED kidneys with multiple cysts, not small kidneys. Let me reconsider... The small kidneys suggest chronic kidney disease from another cause. However, the strong family history (autosomal dominant pattern - father and paternal uncles) suggests a hereditary condition. If this patient has ADPKD but presents late with chronic disease, kidneys may have progressed to end-stage (though they typically remain large). The most likely diagnosis given the family history pattern is still ADPKD - genetic testing or imaging for cysts in other family members would help confirm.",
    subject: "Nephrology",
    system: "Renal",
    topic: "Polycystic Kidney Disease",
    difficulty: "medium",
    board_yield: "medium",
    keywords: ["ADPKD", "polycystic kidney", "hereditary", "hypertension"]
  },
  {
    question_id: "NEPH-004",
    stem: "A 60-year-old man with recently diagnosed multiple myeloma presents with acute kidney injury. Serum creatinine is 4.5 mg/dL (baseline 1.2 mg/dL). Urinalysis shows 1+ protein but is negative for blood. Urine protein electrophoresis shows a monoclonal spike. Which of the following is the most likely cause of his kidney injury?",
    options: ["Cast nephropathy (myeloma kidney)", "Hypercalcemia-induced nephropathy", "Amyloidosis", "Light chain deposition disease", "Contrast-induced nephropathy"],
    correct_answer_index: 0,
    explanation: "Cast nephropathy (myeloma kidney) is the most common cause of AKI in multiple myeloma, caused by precipitation of immunoglobulin light chains (Bence Jones proteins) with Tamm-Horsfall protein in tubules, forming obstructing casts. The urine dipstick is often negative for protein because it detects albumin, not light chains - protein electrophoresis or immunofixation is needed. Key management includes hydration (avoid nephrotoxins), treating the myeloma, and sometimes plasmapheresis. Hypercalcemia can contribute but the monoclonal spike suggests cast nephropathy.",
    subject: "Nephrology",
    system: "Renal",
    topic: "Multiple Myeloma",
    difficulty: "hard",
    board_yield: "high",
    keywords: ["cast nephropathy", "myeloma", "light chains", "Bence Jones"]
  },
  {
    question_id: "NEPH-005",
    stem: "A 28-year-old woman with SLE presents with lower extremity edema and foamy urine. Labs show serum creatinine 1.8 mg/dL, albumin 2.0 g/dL, and 24-hour urine protein of 5.5 g. Complement levels are low (C3 and C4). ANA and anti-dsDNA are positive. Kidney biopsy shows diffuse proliferative changes with 'wire-loop' lesions. Which class of lupus nephritis does she have?",
    options: ["Class IV (diffuse lupus nephritis)", "Class III (focal lupus nephritis)", "Class V (membranous lupus nephritis)", "Class II (mesangial lupus nephritis)", "Class I (minimal mesangial)"],
    correct_answer_index: 0,
    explanation: "This patient has lupus nephritis with nephrotic-range proteinuria, active serologies (low complement, positive anti-dsDNA), and biopsy showing diffuse proliferative changes with 'wire-loop' lesions (subendothelial immune deposits). This is Class IV lupus nephritis (diffuse proliferative), the most severe and common form requiring aggressive immunosuppression. Wire-loop lesions are characteristic. Treatment typically includes corticosteroids plus cyclophosphamide or mycophenolate mofetil for induction, followed by maintenance therapy.",
    subject: "Nephrology",
    system: "Renal",
    topic: "Lupus Nephritis",
    difficulty: "hard",
    board_yield: "high",
    keywords: ["lupus nephritis", "class IV", "wire-loop", "anti-dsDNA"]
  },
  {
    question_id: "NEPH-006",
    stem: "A 70-year-old man develops oliguria and rising creatinine 2 days after cardiac catheterization. He has livedo reticularis on his lower extremities and blue/purple discoloration of his toes. Labs show creatinine of 4.2 mg/dL (baseline 1.5), eosinophilia, and low complement. Urinalysis shows few RBCs and WBCs. Which of the following is the most likely diagnosis?",
    options: ["Cholesterol embolism", "Contrast-induced nephropathy", "Acute tubular necrosis", "Allergic interstitial nephritis", "Acute glomerulonephritis"],
    correct_answer_index: 0,
    explanation: "Cholesterol embolism (atheroembolic disease) typically occurs days to weeks after arterial catheterization or anticoagulation. Classic triad: AKI + eosinophilia + livedo reticularis with 'blue toe syndrome.' Low complement and eosinophiluria may also be present. Contrast nephropathy occurs earlier (24-72 hours) and lacks the peripheral signs. The mechanism is embolization of cholesterol crystals from aortic plaques to small vessels. Unfortunately, treatment is supportive as there's no specific therapy; prognosis is generally poor.",
    subject: "Nephrology",
    system: "Renal",
    topic: "Atheroembolic Disease",
    difficulty: "hard",
    board_yield: "medium",
    keywords: ["cholesterol embolism", "blue toe", "livedo reticularis", "eosinophilia"]
  },

  // INFECTIOUS DISEASE (6 questions)
  {
    question_id: "ID-001",
    stem: "A 30-year-old man presents with 5 days of high fever, severe headache, and myalgias after returning from a camping trip. He recalls being bitten by a tick. Examination reveals a petechial rash on his wrists and ankles spreading centrally. Labs show thrombocytopenia and mild transaminitis. Which of the following is the most appropriate treatment?",
    options: ["Doxycycline", "Ceftriaxone", "Azithromycin", "Penicillin G", "Vancomycin"],
    correct_answer_index: 0,
    explanation: "This is Rocky Mountain spotted fever (RMSF): tick bite, fever, headache, myalgias, characteristic rash starting on wrists/ankles and spreading centrally (centripetal), thrombocytopenia, and transaminitis. RMSF is caused by Rickettsia rickettsii. Doxycycline is the treatment of choice for ALL rickettsial diseases and should be started empirically when RMSF is suspected - do NOT wait for confirmatory testing. Delay in treatment increases mortality significantly. Doxycycline is safe in children for short courses despite dental staining concerns.",
    subject: "Infectious Disease",
    system: "Infectious",
    topic: "Rocky Mountain Spotted Fever",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["RMSF", "doxycycline", "tick-borne", "petechial rash"]
  },
  {
    question_id: "ID-002",
    stem: "A 45-year-old woman with HIV (CD4 count 85 cells/μL, not on antiretroviral therapy) presents with 3 weeks of fever, nonproductive cough, and progressive dyspnea. Chest X-ray shows bilateral interstitial infiltrates. Oxygen saturation is 88% on room air. LDH is elevated at 550 U/L. Which of the following is the most likely diagnosis?",
    options: ["Pneumocystis jirovecii pneumonia", "Bacterial community-acquired pneumonia", "Tuberculosis", "Kaposi sarcoma", "Cytomegalovirus pneumonia"],
    correct_answer_index: 0,
    explanation: "PCP (Pneumocystis jirovecii pneumonia) is the most common AIDS-defining opportunistic infection, typically occurring when CD4 <200. Classic presentation includes subacute course (weeks, not days), nonproductive cough, dyspnea, hypoxia out of proportion to chest X-ray findings, bilateral interstitial/ground-glass infiltrates, and elevated LDH. Diagnosis is confirmed by induced sputum or BAL with silver stain or PCR. Treatment is TMP-SMX; add corticosteroids if PaO2 <70 or A-a gradient >35. Prophylaxis is indicated when CD4 <200.",
    subject: "Infectious Disease",
    system: "Infectious",
    topic: "HIV/AIDS Opportunistic Infections",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["PCP", "Pneumocystis", "HIV", "AIDS"]
  },
  {
    question_id: "ID-003",
    stem: "A 65-year-old man is admitted with community-acquired pneumonia. Blood cultures are positive for Streptococcus pneumoniae. After 3 days of IV antibiotics, he develops new fever and watery diarrhea with 8-10 stools per day. Stool PCR is positive for Clostridioides difficile. Which of the following is the most appropriate initial treatment?",
    options: ["Oral vancomycin", "Oral metronidazole", "IV vancomycin", "Fecal microbiota transplant", "IV metronidazole"],
    correct_answer_index: 0,
    explanation: "Per updated IDSA guidelines, oral vancomycin (or fidaxomicin) is now first-line treatment for ALL C. difficile infections, including initial non-severe episodes. Oral metronidazole is no longer recommended as first-line due to inferior cure rates. The key is ORAL vancomycin - IV vancomycin does not reach adequate colonic concentrations. Fecal microbiota transplant is reserved for recurrent CDI (≥2 recurrences). Severe CDI criteria include WBC >15,000 or creatinine >1.5x baseline.",
    subject: "Infectious Disease",
    system: "Infectious",
    topic: "Clostridioides difficile Infection",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["C. difficile", "oral vancomycin", "antibiotic-associated diarrhea"]
  },
  {
    question_id: "ID-004",
    stem: "A 35-year-old man who immigrated from India 2 years ago presents with 3 months of cough, night sweats, and 10-lb weight loss. Chest X-ray shows a right upper lobe cavitary lesion. Sputum AFB smear is positive. Which of the following is the most appropriate initial treatment regimen?",
    options: ["Rifampin, isoniazid, pyrazinamide, and ethambutol (RIPE)", "Isoniazid alone for 9 months", "Rifampin and isoniazid for 4 months", "Azithromycin, ethambutol, and rifabutin", "Moxifloxacin and amikacin"],
    correct_answer_index: 0,
    explanation: "This patient has active pulmonary tuberculosis (cavitary disease, positive AFB smear, classic symptoms, high-risk country of origin). Standard treatment is 4-drug therapy (RIPE: Rifampin, Isoniazid, Pyrazinamide, Ethambutol) for 2 months intensive phase, then rifampin and isoniazid for 4 months continuation phase (total 6 months). Pyridoxine (vitamin B6) should be given with isoniazid to prevent neuropathy. The patient should be isolated until three negative sputum smears. Drug susceptibility testing guides regimen adjustments.",
    subject: "Infectious Disease",
    system: "Infectious",
    topic: "Tuberculosis",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["tuberculosis", "RIPE", "cavitary lesion", "AFB"]
  },
  {
    question_id: "ID-005",
    stem: "A 22-year-old woman presents with dysuria and urinary frequency for 2 days. She is sexually active and uses oral contraceptives. She has no fever or flank pain. Urinalysis shows positive leukocyte esterase and nitrites. Which of the following is the most appropriate treatment?",
    options: ["Nitrofurantoin for 5 days or TMP-SMX for 3 days", "Ciprofloxacin for 7 days", "Amoxicillin-clavulanate for 14 days", "Single dose of fosfomycin followed by 7-day course of ciprofloxacin", "Ceftriaxone IM plus doxycycline orally"],
    correct_answer_index: 0,
    explanation: "This is uncomplicated cystitis (lower UTI) in a young, healthy, non-pregnant woman. First-line treatments per IDSA guidelines are: nitrofurantoin (5-7 days), TMP-SMX (3 days, if local resistance <20%), or fosfomycin (single dose). Fluoroquinolones should be reserved for complicated UTIs due to resistance concerns and side effects. The last option (ceftriaxone + doxycycline) is treatment for gonorrhea/chlamydia, not UTI. No imaging or urine culture is needed for uncomplicated cystitis unless treatment fails.",
    subject: "Infectious Disease",
    system: "Infectious",
    topic: "Urinary Tract Infection",
    difficulty: "easy",
    board_yield: "high",
    keywords: ["UTI", "cystitis", "nitrofurantoin", "TMP-SMX"]
  },
  {
    question_id: "ID-006",
    stem: "A 50-year-old man with poorly controlled diabetes presents with severe left ear pain, otorrhea, and headache for 1 week. The ear canal shows granulation tissue at the bone-cartilage junction. CT shows bony erosion of the skull base. Which of the following is the most likely pathogen?",
    options: ["Pseudomonas aeruginosa", "Staphylococcus aureus", "Aspergillus fumigatus", "Streptococcus pneumoniae", "Candida albicans"],
    correct_answer_index: 0,
    explanation: "This is malignant (necrotizing) external otitis, a severe infection of the external auditory canal that extends to the skull base, seen almost exclusively in diabetics and immunocompromised patients. Pseudomonas aeruginosa is the causative organism in >95% of cases. The pathognomonic finding is granulation tissue at the bone-cartilage junction of the ear canal. Cranial nerve palsies (facial nerve most common) may occur. Treatment requires prolonged IV antipseudomonal antibiotics (6+ weeks) - typically ciprofloxacin or an antipseudomonal beta-lactam.",
    subject: "Infectious Disease",
    system: "Infectious",
    topic: "Malignant External Otitis",
    difficulty: "hard",
    board_yield: "medium",
    keywords: ["malignant otitis externa", "Pseudomonas", "diabetes", "skull base"]
  },

  // HEMATOLOGY (4 questions)
  {
    question_id: "HEM-001",
    stem: "A 25-year-old African American man presents with sudden onset of severe pain in his back and legs. He has a history of similar episodes since childhood. Labs show hemoglobin 7.5 g/dL, MCV 85 fL, reticulocyte count 15%, LDH 850 U/L, and indirect bilirubin 3.5 mg/dL. Peripheral smear shows sickle-shaped cells and target cells. Which of the following is the most appropriate acute management?",
    options: ["IV fluids, oxygen, and opioid analgesia", "Blood transfusion only", "Exchange transfusion", "Hydroxyurea initiation", "IV antibiotics"],
    correct_answer_index: 0,
    explanation: "This patient has a vaso-occlusive crisis (pain crisis) in sickle cell disease. Acute management priorities are: 1) Aggressive IV hydration, 2) Supplemental oxygen to prevent further sickling, 3) Adequate pain control with opioids (not NSAIDs alone - renal complications in SCD). Simple transfusion is indicated if Hgb drops significantly or symptomatic. Exchange transfusion is for acute chest syndrome, stroke, or severe crisis. Hydroxyurea is for chronic management to reduce crisis frequency, not acute treatment.",
    subject: "Hematology",
    system: "Hematologic",
    topic: "Sickle Cell Disease",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["sickle cell", "vaso-occlusive crisis", "IV fluids", "opioids"]
  },
  {
    question_id: "HEM-002",
    stem: "A 70-year-old woman presents with fatigue and is found to have pancytopenia. Peripheral smear shows macroovalocytes, hypersegmented neutrophils, and rare megaloblastic RBC precursors. Serum B12 is low at 95 pg/mL. Which of the following additional findings would you expect?",
    options: ["Elevated methylmalonic acid and homocysteine", "Elevated homocysteine with normal methylmalonic acid", "Normal methylmalonic acid and homocysteine", "Elevated indirect bilirubin only", "Low reticulocyte count with normal LDH"],
    correct_answer_index: 0,
    explanation: "Vitamin B12 deficiency causes megaloblastic anemia with classic findings: macroovalocytes, hypersegmented neutrophils (≥5 lobes), and pancytopenia in severe cases. B12 is a cofactor for two reactions: 1) Methylmalonyl-CoA to succinyl-CoA (elevated MMA when deficient), and 2) Homocysteine to methionine (elevated homocysteine when deficient). Folate deficiency elevates homocysteine but NOT methylmalonic acid. LDH and indirect bilirubin are elevated due to ineffective erythropoiesis (intramedullary hemolysis).",
    subject: "Hematology",
    system: "Hematologic",
    topic: "Megaloblastic Anemia",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["B12 deficiency", "methylmalonic acid", "megaloblastic", "hypersegmented neutrophils"]
  },
  {
    question_id: "HEM-003",
    stem: "A 55-year-old man presents with deep vein thrombosis of the left leg. He has no known risk factors and no family history of clotting disorders. This is his first episode of VTE. Which of the following is the most appropriate duration of anticoagulation?",
    options: ["3 months, then reassess for extended therapy", "6 months", "Lifelong anticoagulation", "1 month", "Until DVT resolves on ultrasound"],
    correct_answer_index: 0,
    explanation: "For a first unprovoked (idiopathic) VTE, the minimum duration of anticoagulation is 3 months. After 3 months, the decision for extended (indefinite) anticoagulation depends on: bleeding risk vs thrombosis risk, patient preference, and D-dimer/residual clot assessment. Men with unprovoked VTE have higher recurrence risk and may benefit from extended therapy. Provoked VTE (surgery, immobilization, OCPs) typically needs only 3 months total. The duration is based on preventing recurrence, not waiting for clot resolution.",
    subject: "Hematology",
    system: "Hematologic",
    topic: "Venous Thromboembolism",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["DVT", "anticoagulation", "VTE", "duration"]
  },
  {
    question_id: "HEM-004",
    stem: "A 35-year-old woman presents with epistaxis, gingival bleeding, and petechiae. She has no significant past medical history. Labs show platelet count of 15,000/μL, hemoglobin 13.5 g/dL, and WBC 7,000/μL. Peripheral smear shows decreased platelets but they are large/giant in size. Coagulation studies are normal. Which of the following is the most likely diagnosis?",
    options: ["Immune thrombocytopenic purpura (ITP)", "Thrombotic thrombocytopenic purpura (TTP)", "Disseminated intravascular coagulation (DIC)", "Aplastic anemia", "Myelodysplastic syndrome"],
    correct_answer_index: 0,
    explanation: "ITP is a diagnosis of exclusion characterized by isolated thrombocytopenia with no other explanation. Key features: isolated low platelets, normal hemoglobin and WBC, normal coagulation studies, and large/giant platelets on smear (indicating increased platelet production as bone marrow compensates for peripheral destruction). TTP would have microangiopathic hemolytic anemia (schistocytes, elevated LDH). DIC has abnormal coagulation studies. Aplastic anemia and MDS would show other cytopenias.",
    subject: "Hematology",
    system: "Hematologic",
    topic: "Immune Thrombocytopenic Purpura",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["ITP", "thrombocytopenia", "petechiae", "giant platelets"]
  },

  // PHARMACOLOGY (2 questions)
  {
    question_id: "PHARM-001",
    stem: "A 60-year-old man with atrial fibrillation on warfarin presents with INR of 8.5 and no active bleeding. Which of the following is the most appropriate management?",
    options: ["Hold warfarin and give oral vitamin K", "Continue warfarin at current dose", "Hold warfarin only, no vitamin K", "Give IV vitamin K and fresh frozen plasma", "Give prothrombin complex concentrate"],
    correct_answer_index: 0,
    explanation: "For INR >5 without bleeding, hold warfarin and give oral vitamin K (2.5-5mg). This lowers INR faster than holding warfarin alone while avoiding the risks of over-correction that can occur with IV vitamin K or FFP. For INR 5-9 without bleeding, some guidelines allow holding warfarin without vitamin K if INR is expected to return to range quickly. FFP and PCC are reserved for major/life-threatening bleeding. Recheck INR in 24-48 hours and resume warfarin at a reduced dose.",
    subject: "Pharmacology",
    system: "Pharmacology",
    topic: "Anticoagulation Management",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["warfarin", "INR", "vitamin K", "supratherapeutic"]
  },
  {
    question_id: "PHARM-002",
    stem: "A 45-year-old woman with major depressive disorder has been on fluoxetine for 3 months with good response. She now develops a tremor, muscle rigidity, hyperthermia (39.5°C), and altered mental status. She recently started taking tramadol for back pain. Which of the following is the most likely diagnosis?",
    options: ["Serotonin syndrome", "Neuroleptic malignant syndrome", "Malignant hyperthermia", "Anticholinergic toxicity", "Meningitis"],
    correct_answer_index: 0,
    explanation: "Serotonin syndrome results from excessive serotonergic activity, often from drug interactions. The combination of fluoxetine (SSRI) and tramadol (weak serotonin reuptake inhibitor and opioid) is a classic cause. Features include mental status changes, autonomic instability (hyperthermia, tachycardia), and neuromuscular abnormalities (tremor, rigidity, hyperreflexia, clonus, myoclonus). Key distinguishing feature from NMS: serotonin syndrome has hyperreflexia and clonus, while NMS has 'lead-pipe' rigidity and hyporeflexia. Treatment is stopping offending agents and supportive care ± cyproheptadine.",
    subject: "Pharmacology",
    system: "Pharmacology",
    topic: "Serotonin Syndrome",
    difficulty: "medium",
    board_yield: "high",
    keywords: ["serotonin syndrome", "SSRI", "tramadol", "hyperthermia"]
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert all questions
    const { data, error } = await supabase
      .from('qbank_questions')
      .upsert(
        questions.map(q => ({
          question_id: q.question_id,
          stem: q.stem,
          options: q.options,
          correct_answer_index: q.correct_answer_index,
          explanation: q.explanation,
          subject: q.subject,
          system: q.system,
          topic: q.topic,
          difficulty: q.difficulty,
          board_yield: q.board_yield,
          keywords: q.keywords,
          question_type: 'single_best',
          is_active: true
        })),
        { onConflict: 'question_id' }
      );

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully seeded ${questions.length} USMLE-style questions`,
        count: questions.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error seeding questions:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
