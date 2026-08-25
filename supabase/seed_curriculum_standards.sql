-- ============================================================================
-- CURRICULUM STANDARDS SPINE — seed data
--
-- Source registry, USMLE Step 2 CK content-outline taxonomy (category structure
-- only, cited to the USMLE publisher — no verbatim reproduction of their text),
-- and the six ACGME core competencies.
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Approved source registry
-- authority_tier: 1 = primary standard/regulator, 2 = society guideline or
-- peer-reviewed, 3 = curated reference/teaching atlas, 4 = open-license media.
-- allowed_for_retrieval gates what ATLAS's web reader may open.
-- ---------------------------------------------------------------------------
INSERT INTO public.content_sources
  (name, publisher, domain, url, source_type, authority_tier, license, allowed_for_retrieval, citation_format, notes)
VALUES
  ('USMLE Content Outline', 'NBME / FSMB', 'usmle.org', 'https://www.usmle.org/prepare-your-exam', 'exam_blueprint', 1, 'Copyright NBME/FSMB — structure cited, text not reproduced', true, 'USMLE Content Outline, NBME/FSMB', 'Canonical blueprint for Step 1 / Step 2 CK. Encode category structure and cite; never reproduce outline text verbatim.'),
  ('ACGME Common Program Requirements', 'ACGME', 'acgme.org', 'https://www.acgme.org', 'exam_blueprint', 1, 'Copyright ACGME — structure cited', true, 'ACGME Common Program Requirements', 'Source of the six core competencies used for rotation evaluations and LOR narratives.'),
  ('NBME Subject Examinations', 'NBME', 'nbme.org', 'https://www.nbme.org', 'exam_blueprint', 1, 'Copyright NBME', true, 'NBME Subject Examination content description', 'Shelf-exam scope reference for clerkship-level content.'),
  ('StatPearls / NCBI Bookshelf', 'National Library of Medicine', 'ncbi.nlm.nih.gov', 'https://www.ncbi.nlm.nih.gov/books/', 'reference', 2, 'CC BY (StatPearls chapters)', true, 'StatPearls [Internet]. Treasure Island (FL): StatPearls Publishing', 'Primary free full-text clinical reference for vignette grounding.'),
  ('PubMed', 'National Library of Medicine', 'pubmed.ncbi.nlm.nih.gov', 'https://pubmed.ncbi.nlm.nih.gov', 'peer_reviewed', 2, 'Abstracts publicly available', true, 'PubMed PMID', 'Use for primary-literature claims and evidence levels.'),
  ('CDC', 'Centers for Disease Control and Prevention', 'cdc.gov', 'https://www.cdc.gov', 'guideline', 1, 'U.S. Government work — public domain', true, 'CDC, [page title], accessed [date]', 'Immunization schedules, infectious disease, prevention.'),
  ('USPSTF Recommendations', 'U.S. Preventive Services Task Force', 'uspreventiveservicestaskforce.org', 'https://www.uspreventiveservicestaskforce.org', 'guideline', 1, 'U.S. Government work — public domain', true, 'USPSTF Recommendation Statement, [topic], [year]', 'Authoritative for all screening and health-maintenance questions.'),
  ('NIH / NHLBI', 'National Institutes of Health', 'nih.gov', 'https://www.nih.gov', 'guideline', 1, 'U.S. Government work — public domain', true, 'NIH/NHLBI, [document], [year]', 'Guidelines for asthma, cholesterol, hypertension and related topics.'),
  ('FDA Drug Labels (DailyMed)', 'U.S. Food and Drug Administration / NLM', 'dailymed.nlm.nih.gov', 'https://dailymed.nlm.nih.gov', 'guideline', 1, 'U.S. Government work — public domain', true, 'DailyMed prescribing information, [drug]', 'Authoritative for indications, dosing, black-box warnings in pharmacotherapy items.'),
  ('ACC / AHA Guidelines', 'American College of Cardiology / American Heart Association', 'ahajournals.org', 'https://www.ahajournals.org', 'guideline', 2, 'Publisher copyright — cite, do not reproduce', true, 'ACC/AHA Guideline, [topic], Circulation [year]', 'Cardiovascular management standard of care.'),
  ('ACOG', 'American College of Obstetricians and Gynecologists', 'acog.org', 'https://www.acog.org', 'guideline', 2, 'Publisher copyright', true, 'ACOG Practice Bulletin [number]', 'Obstetrics and gynecology standard of care.'),
  ('American Academy of Pediatrics', 'AAP', 'aap.org', 'https://www.aap.org', 'guideline', 2, 'Publisher copyright', true, 'AAP Clinical Practice Guideline, [topic]', 'Pediatrics standard of care and Bright Futures schedule.'),
  ('IDSA Guidelines', 'Infectious Diseases Society of America', 'idsociety.org', 'https://www.idsociety.org', 'guideline', 2, 'Publisher copyright', true, 'IDSA Clinical Practice Guideline, [topic], [year]', 'Antimicrobial selection and infectious-disease management.'),
  ('American Diabetes Association Standards of Care', 'ADA', 'diabetesjournals.org', 'https://diabetesjournals.org', 'guideline', 2, 'Publisher copyright', true, 'ADA Standards of Care in Diabetes, [year]', 'Endocrine management, updated annually — recheck each January.'),
  ('Radiopaedia', 'Radiopaedia.org', 'radiopaedia.org', 'https://radiopaedia.org', 'image_library', 3, 'CC BY-NC-SA (varies per case)', true, 'Radiopaedia.org, case [id], [author]', 'Primary radiology teaching atlas for the imaging curriculum. Check per-case license before reuse.'),
  ('Wikimedia Commons', 'Wikimedia Foundation', 'commons.wikimedia.org', 'https://commons.wikimedia.org', 'image_library', 4, 'CC / public domain (varies per file)', true, '[File title], Wikimedia Commons, [license]', 'Open-license fallback for images. Every image must pass faculty verification before it counts as curriculum.'),
  ('Livemed Academy Verified Media Library', 'Livemed Academy', 'livemedu.internal', NULL, 'internal', 1, 'Internal — faculty verified', false, 'Livemed Academy verified media library', 'Faculty-approved images in medical_media. Preferred over any external image source.')
ON CONFLICT (domain) DO UPDATE SET
  name = EXCLUDED.name,
  publisher = EXCLUDED.publisher,
  url = EXCLUDED.url,
  source_type = EXCLUDED.source_type,
  authority_tier = EXCLUDED.authority_tier,
  license = EXCLUDED.license,
  allowed_for_retrieval = EXCLUDED.allowed_for_retrieval,
  citation_format = EXCLUDED.citation_format,
  notes = EXCLUDED.notes,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 2) USMLE Step 2 CK content outline — ORGAN SYSTEM axis
-- Category names and published weight ranges only, cited to the USMLE outline.
-- Re-verify weights against the current outline each exam cycle.
-- ---------------------------------------------------------------------------
INSERT INTO public.usmle_blueprint_nodes (exam, axis, code, title, weight_low, weight_high, sort_order, source_id)
SELECT 'step2ck', 'system', v.code, v.title, v.wl, v.wh, v.so,
       (SELECT id FROM public.content_sources WHERE domain = 'usmle.org')
FROM (VALUES
  ('SYS-HUMDEV', 'Human Development', 1, 3, 10),
  ('SYS-IMMUNE', 'Immune System', 3, 5, 20),
  ('SYS-BLOOD', 'Blood & Lymphoreticular System', 4, 6, 30),
  ('SYS-BEHAV', 'Behavioral Health', 6, 10, 40),
  ('SYS-NEURO', 'Nervous System & Special Senses', 7, 11, 50),
  ('SYS-SKIN', 'Skin & Subcutaneous Tissue', 5, 9, 60),
  ('SYS-MSK', 'Musculoskeletal System', 5, 9, 70),
  ('SYS-CV', 'Cardiovascular System', 10, 14, 80),
  ('SYS-RESP', 'Respiratory System', 9, 13, 90),
  ('SYS-GI', 'Gastrointestinal System', 8, 12, 100),
  ('SYS-RENAL', 'Renal & Urinary System', 5, 9, 110),
  ('SYS-PREG', 'Pregnancy, Childbirth & the Puerperium', 5, 9, 120),
  ('SYS-FEMREPRO', 'Female Reproductive System & Breast', 4, 8, 130),
  ('SYS-MALEREPRO', 'Male Reproductive System', 1, 3, 140),
  ('SYS-ENDO', 'Endocrine System', 6, 10, 150),
  ('SYS-MULTI', 'Multisystem Processes & Disorders', 4, 6, 160),
  ('SYS-BIOSTAT', 'Biostatistics, Epidemiology & Interpretation of the Medical Literature', 3, 5, 170),
  ('SYS-SOCIAL', 'Social Sciences: Communication, Ethics & Patient Safety', 6, 10, 180)
) AS v(code, title, wl, wh, so)
ON CONFLICT (exam, axis, code) DO UPDATE SET
  title = EXCLUDED.title,
  weight_low = EXCLUDED.weight_low,
  weight_high = EXCLUDED.weight_high,
  sort_order = EXCLUDED.sort_order,
  source_id = EXCLUDED.source_id,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 3) USMLE Step 2 CK content outline — PHYSICIAN TASK / COMPETENCY axis
-- ---------------------------------------------------------------------------
INSERT INTO public.usmle_blueprint_nodes (exam, axis, code, title, description, weight_low, weight_high, sort_order, source_id)
SELECT 'step2ck', 'physician_task', v.code, v.title, v.descr, v.wl, v.wh, v.so,
       (SELECT id FROM public.content_sources WHERE domain = 'usmle.org')
FROM (VALUES
  ('PT-MK', 'Medical Knowledge: Applying Foundational Science Concepts', 'Mechanism of disease and pharmacology reasoning applied to a clinical scenario.', 10, 15, 10),
  ('PT-DX-HXPE', 'Patient Care — Diagnosis: History & Physical Examination', 'Selecting and interpreting historical and examination findings.', 7, 11, 20),
  ('PT-DX-LAB', 'Patient Care — Diagnosis: Laboratory & Diagnostic Studies', 'Choosing and interpreting labs and imaging, including test characteristics.', 10, 14, 30),
  ('PT-DX-DIAG', 'Patient Care — Diagnosis: Formulating the Most Likely Diagnosis', 'Differential construction and selection of the single best diagnosis.', 10, 14, 40),
  ('PT-DX-PROG', 'Patient Care — Diagnosis: Prognosis & Outcome', 'Natural history, risk stratification, and expected course.', 5, 9, 50),
  ('PT-MG-PREV', 'Patient Care — Management: Health Maintenance, Prevention & Surveillance', 'Screening, immunization, and risk-factor modification.', 7, 11, 60),
  ('PT-MG-PHARM', 'Patient Care — Management: Pharmacotherapy', 'Drug selection, dosing, monitoring, interactions, and adverse effects.', 10, 14, 70),
  ('PT-MG-INTERV', 'Patient Care — Management: Clinical Interventions', 'Procedures, supportive care, and non-pharmacologic management.', 8, 12, 80),
  ('PT-MG-MIXED', 'Patient Care — Management: Mixed Management', 'Multi-step management decisions and next-best-step sequencing.', 7, 11, 90),
  ('PT-PBLI', 'Practice-Based Learning & Improvement', 'Interpreting the medical literature and applying evidence to care.', 3, 5, 100),
  ('PT-PROF', 'Professionalism & Legal/Ethical Issues', 'Consent, capacity, confidentiality, disclosure, and professional conduct.', 3, 6, 110),
  ('PT-SBP', 'Systems-Based Practice & Patient Safety', 'Quality improvement, error analysis, care coordination, and cost awareness.', 5, 9, 120)
) AS v(code, title, descr, wl, wh, so)
ON CONFLICT (exam, axis, code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  weight_low = EXCLUDED.weight_low,
  weight_high = EXCLUDED.weight_high,
  sort_order = EXCLUDED.sort_order,
  source_id = EXCLUDED.source_id,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 4) USMLE Step 2 CK — CLINICAL DISCIPLINE axis (clerkship/shelf alignment)
-- ---------------------------------------------------------------------------
INSERT INTO public.usmle_blueprint_nodes (exam, axis, code, title, sort_order, source_id)
SELECT 'step2ck', 'discipline', v.code, v.title, v.so,
       (SELECT id FROM public.content_sources WHERE domain = 'nbme.org')
FROM (VALUES
  ('DISC-MED', 'Internal Medicine', 10),
  ('DISC-SURG', 'Surgery', 20),
  ('DISC-PEDS', 'Pediatrics', 30),
  ('DISC-OBGYN', 'Obstetrics & Gynecology', 40),
  ('DISC-PSYCH', 'Psychiatry', 50),
  ('DISC-FM', 'Family Medicine', 60),
  ('DISC-EM', 'Emergency Medicine', 70),
  ('DISC-NEURO', 'Neurology', 80),
  ('DISC-RADS', 'Radiology & Diagnostic Imaging', 90),
  ('DISC-PREV', 'Preventive Medicine & Public Health', 100)
) AS v(code, title, so)
ON CONFLICT (exam, axis, code) DO UPDATE SET
  title = EXCLUDED.title,
  sort_order = EXCLUDED.sort_order,
  source_id = EXCLUDED.source_id,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 5) ACGME core competencies — used by rotation evaluations and LOR narratives
-- ---------------------------------------------------------------------------
INSERT INTO public.acgme_competencies (code, title, description, sort_order, source_id)
SELECT v.code, v.title, v.descr, v.so,
       (SELECT id FROM public.content_sources WHERE domain = 'acgme.org')
FROM (VALUES
  ('ACGME-PC', 'Patient Care & Procedural Skills', 'Provides compassionate, appropriate and effective care; performs required procedures competently.', 10),
  ('ACGME-MK', 'Medical Knowledge', 'Demonstrates knowledge of biomedical, clinical, epidemiological and social-behavioral sciences and applies it to patient care.', 20),
  ('ACGME-PBLI', 'Practice-Based Learning & Improvement', 'Appraises and assimilates evidence, evaluates own practice, and improves through self-directed learning.', 30),
  ('ACGME-ICS', 'Interpersonal & Communication Skills', 'Communicates effectively with patients, families and the health care team; documents accurately.', 40),
  ('ACGME-PROF', 'Professionalism', 'Demonstrates responsibility, ethical principles, respect for patient autonomy, privacy and diversity.', 50),
  ('ACGME-SBP', 'Systems-Based Practice', 'Works within the larger health system, coordinates care, advocates for patients and considers cost.', 60)
) AS v(code, title, descr, so)
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  source_id = EXCLUDED.source_id,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 6) Backfill: map existing QBank questions to the organ-system axis using the
-- `system` text already stored on each question. Faculty can refine afterwards.
-- ---------------------------------------------------------------------------
INSERT INTO public.content_blueprint_map (content_type, content_id, blueprint_node_id, confidence, notes)
SELECT 'qbank_question', q.id::text, n.id, 'imported', 'Auto-mapped from qbank_questions.system on standards rollout'
FROM public.qbank_questions q
JOIN public.usmle_blueprint_nodes n
  ON n.exam = 'step2ck' AND n.axis = 'system'
 AND n.code = CASE
   WHEN q.system ILIKE '%cardio%' THEN 'SYS-CV'
   WHEN q.system ILIKE '%respir%' OR q.system ILIKE '%pulmon%' THEN 'SYS-RESP'
   WHEN q.system ILIKE '%gastro%' OR q.system ILIKE '%gi%' THEN 'SYS-GI'
   WHEN q.system ILIKE '%renal%' OR q.system ILIKE '%urinary%' OR q.system ILIKE '%nephro%' THEN 'SYS-RENAL'
   WHEN q.system ILIKE '%endocr%' THEN 'SYS-ENDO'
   WHEN q.system ILIKE '%neuro%' OR q.system ILIKE '%special sense%' THEN 'SYS-NEURO'
   WHEN q.system ILIKE '%psych%' OR q.system ILIKE '%behavior%' THEN 'SYS-BEHAV'
   WHEN q.system ILIKE '%musculo%' OR q.system ILIKE '%rheum%' OR q.system ILIKE '%ortho%' THEN 'SYS-MSK'
   WHEN q.system ILIKE '%derm%' OR q.system ILIKE '%skin%' THEN 'SYS-SKIN'
   WHEN q.system ILIKE '%hemat%' OR q.system ILIKE '%blood%' OR q.system ILIKE '%lymph%' THEN 'SYS-BLOOD'
   WHEN q.system ILIKE '%immun%' OR q.system ILIKE '%allerg%' THEN 'SYS-IMMUNE'
   WHEN q.system ILIKE '%pregnan%' OR q.system ILIKE '%obstet%' OR q.system ILIKE '%childbirth%' THEN 'SYS-PREG'
   WHEN q.system ILIKE '%female%' OR q.system ILIKE '%gynec%' OR q.system ILIKE '%breast%' THEN 'SYS-FEMREPRO'
   WHEN q.system ILIKE '%male repro%' THEN 'SYS-MALEREPRO'
   WHEN q.system ILIKE '%pediatr%' OR q.system ILIKE '%development%' THEN 'SYS-HUMDEV'
   WHEN q.system ILIKE '%biostat%' OR q.system ILIKE '%epidem%' OR q.system ILIKE '%literature%' THEN 'SYS-BIOSTAT'
   WHEN q.system ILIKE '%ethic%' OR q.system ILIKE '%social%' OR q.system ILIKE '%safety%' OR q.system ILIKE '%communicat%' THEN 'SYS-SOCIAL'
   WHEN q.system ILIKE '%multi%' OR q.system ILIKE '%infectious%' OR q.system ILIKE '%oncolog%' THEN 'SYS-MULTI'
   ELSE NULL
 END
WHERE q.is_active
ON CONFLICT DO NOTHING;
