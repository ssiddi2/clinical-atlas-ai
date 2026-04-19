

User is asking a process/walkthrough question, not requesting implementation. No plan or code needed — just a clear narrative of how an end-to-end session works on the platform today, given what's built (signup, course creation, lecture scheduling, Google Meet, attendance, USMLE Whisperer live quizzes, remediation).

I'll walk through it chronologically from the attending's and student's perspectives, then call out the differentiators. Keep it concise and concrete.

---

# How a Full Teaching Session Works on Livemed Academy

## Phase 1 — Before the session (you, the attending)

1. **Log in** at `/auth` → routed to `/physician-dashboard`.
2. **Create the course** once (e.g., "Inpatient Hospital Medicine — Spring 2026"). Set max students, dates, specialty = Internal Medicine.
3. **Bulk-invite students** by pasting their emails. They get an email + are auto-enrolled (status = `approved`) the moment they sign up.
4. **Schedule a lecture** inside the course:
   - Title (e.g., "Acute CHF Exacerbation — Admission to Discharge")
   - Date/time
   - **Paste a Google Meet link** (you create at meet.google.com/new)
   - Optional: attach pre-read PDFs as Course Materials
5. Students automatically see it on their `/virtual-classroom` page and get a notification.

## Phase 2 — Session start (T-0)

6. You click **"Go Live"** on the lecture card → status flips to `live`, a green pulsing dot appears for students.
7. Students click **"Join Lecture"** → opens your Google Meet in a new tab. Attendance is logged automatically when they join.
8. You teach in Meet — share slides, use the whiteboard, present a patient case, whatever your style is.

## Phase 3 — Mid-lecture engagement (the differentiator)

9. At any decision point ("OK class — what's your next step?") you click **"Live Quiz" (USMLE Whisperer™)** on the lecture card.
10. A modal opens. Type the topic (e.g., "BNP interpretation in acute decompensated heart failure") → click **Generate**.
11. ATLAS AI writes 5 NBME-style vignettes in ~15 seconds. You review them on screen.
12. Click **"Push to Students"** → every attendee gets a real-time notification + the quiz appears on their screen at `/live-quiz/:id`.
13. Students answer in real-time. You watch the **live heatmap** populate: "4/12 got Q3 correct — anchoring on troponin."
14. You teach to the miss right there in Meet. Close the loop in 90 seconds.

## Phase 4 — End of session

15. Click **"End Lecture"** → status flips to `completed`. Quiz auto-closes.
16. Students see their score + your AI explanations immediately.
17. Anyone who scored <70% gets auto-flagged for remediation in their Learning Unit queue.
18. You see a class-level performance report: which concepts were missed, who attended, who didn't.

## Phase 5 — After the session

19. Upload your slide deck → appears under Course Materials (only enrolled students can view).
20. Optional: schedule the next lecture, push a permanent QBank assignment, or send a follow-up note.
21. Attendance + quiz scores feed each student's MATCH Ready™ score predictor automatically.

---

## What makes this different from Zoom + Google Forms

- **Zero context-switching** — quiz, attendance, remediation, and analytics all live next to the lecture, not in 4 different tabs.
- **AI does the busywork** — you don't write 5 vignettes per lecture. ATLAS does, in 15 seconds, in NBME style.
- **The data flywheel** — every miss in your live quiz becomes a personalized study recommendation for that student tonight.
- **Audit trail** — for IMG students applying to residency, every lecture attended + score is timestamped and exportable as evidence of US clinical engagement.

## A typical 60-min Inpatient Medicine session might look like

```text
00:00  Go Live → students join Meet
00:05  Present admission: 68F with dyspnea, JVD, S3
00:15  USMLE Whisperer #1: "Most appropriate next test?" → 5 questions
00:20  Review misses live, teach BNP cutoffs
00:30  Continue case: diuresis, response, complications
00:45  USMLE Whisperer #2: "Discharge criteria + readmission risk"
00:55  Wrap, assign 10 QBank questions on CHF
01:00  End Lecture → analytics dashboard appears
```

That's the full loop. Want me to walk through what the **student's screen** looks like at each phase, or queue up a dry-run with a test student account so you can see it live before launch?

