import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Stethoscope,
  User,
  Activity,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Brain,
  ClipboardList,
  Pill,
  TestTube,
  MessageSquare,
} from "lucide-react";

interface CaseStep {
  id: number;
  title: string;
  icon: React.ElementType;
  description: string;
}

const RotationExperience = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [clinicalNote, setClinicalNote] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const steps: CaseStep[] = [
    { id: 0, title: "Patient Presentation", icon: User, description: "Review the case" },
    { id: 1, title: "Assessment", icon: ClipboardList, description: "Differential diagnosis" },
    { id: 2, title: "Plan", icon: FileText, description: "Order workup" },
    { id: 3, title: "Clinical Note", icon: FileText, description: "Document encounter" },
    { id: 4, title: "Faculty Feedback", icon: Brain, description: "ATLAS evaluation" },
  ];

  const patientCase = {
    age: 55,
    gender: "Male",
    chiefComplaint: "Chest pain for 2 hours",
    hpi: "55-year-old male with history of hypertension and hyperlipidemia presents with substernal chest pain radiating to the left arm, associated with diaphoresis and shortness of breath. Pain started 2 hours ago while climbing stairs. He describes it as 'pressure-like' and rates it 8/10.",
    vitals: {
      bp: "158/92 mmHg",
      hr: "98 bpm",
      rr: "22/min",
      temp: "98.4°F",
      spo2: "94% on RA",
    },
    pmh: ["Hypertension x 10 years", "Hyperlipidemia", "Former smoker (quit 5 years ago)", "Father had MI at age 60"],
    medications: ["Lisinopril 10mg daily", "Atorvastatin 20mg daily"],
    physicalExam: {
      general: "Anxious, diaphoretic male in mild distress",
      cardiac: "Regular rate, no murmurs, S1/S2 normal",
      pulmonary: "Clear to auscultation bilaterally",
      extremities: "No edema, pulses 2+ throughout",
    },
  };

  const differentialOptions = [
    { id: "stemi", label: "STEMI", correct: true },
    { id: "nstemi", label: "NSTEMI/Unstable Angina", correct: true },
    { id: "pe", label: "Pulmonary Embolism", correct: false },
    { id: "aortic_dissection", label: "Aortic Dissection", correct: true },
    { id: "pneumonia", label: "Pneumonia", correct: false },
    { id: "gerd", label: "GERD", correct: false },
    { id: "anxiety", label: "Panic Attack", correct: false },
    { id: "costochondritis", label: "Costochondritis", correct: false },
  ];

  const orderOptions = [
    { id: "ecg", label: "12-lead ECG", correct: true, category: "Diagnostic" },
    { id: "troponin", label: "Troponin I/T", correct: true, category: "Labs" },
    { id: "cbc", label: "CBC", correct: true, category: "Labs" },
    { id: "bmp", label: "BMP", correct: true, category: "Labs" },
    { id: "cxr", label: "Chest X-ray", correct: true, category: "Imaging" },
    { id: "aspirin", label: "Aspirin 325mg", correct: true, category: "Medications" },
    { id: "nitro", label: "Nitroglycerin SL", correct: true, category: "Medications" },
    { id: "heparin", label: "Heparin drip", correct: true, category: "Medications" },
    { id: "morphine", label: "Morphine 2-4mg IV", correct: false, category: "Medications" },
    { id: "ct_chest", label: "CT Chest with contrast", correct: false, category: "Imaging" },
  ];

  const toggleDiagnosis = (id: string) => {
    setSelectedDiagnoses((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const toggleOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            {/* Patient Header */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <User className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {patientCase.age}-year-old {patientCase.gender}
                </h3>
                <p className="text-muted-foreground">{patientCase.chiefComplaint}</p>
              </div>
              <Badge variant="destructive" className="ml-auto">Urgent</Badge>
            </div>

            {/* HPI */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  History of Present Illness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{patientCase.hpi}</p>
              </CardContent>
            </Card>

            {/* Vitals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent" />
                  Vital Signs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(patientCase.vitals).map(([key, value]) => (
                    <div key={key} className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase">{key}</p>
                      <p className="font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* PMH & Meds */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Past Medical History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {patientCase.pmh.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Pill className="h-5 w-5 text-accent" />
                    Medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {patientCase.medications.map((med, idx) => (
                      <li key={idx} className="text-sm">{med}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Physical Exam */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-accent" />
                  Physical Examination
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(patientCase.physicalExam).map(([system, finding]) => (
                    <div key={system} className="flex gap-4">
                      <span className="font-medium capitalize w-24">{system}:</span>
                      <span className="text-muted-foreground">{finding}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Differential Diagnosis</CardTitle>
                <CardDescription>
                  Select all diagnoses that should be on your differential for this presentation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {differentialOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => toggleDiagnosis(option.id)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedDiagnoses.includes(option.id)
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            selectedDiagnoses.includes(option.id)
                              ? "bg-accent border-accent"
                              : "border-muted-foreground"
                          }`}
                        >
                          {selectedDiagnoses.includes(option.id) && (
                            <CheckCircle className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Initial Workup & Management</CardTitle>
                <CardDescription>
                  Select the appropriate orders for this patient.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {["Diagnostic", "Labs", "Imaging", "Medications"].map((category) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <TestTube className="h-4 w-4 text-accent" />
                      {category}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {orderOptions
                        .filter((o) => o.category === category)
                        .map((option) => (
                          <button
                            key={option.id}
                            onClick={() => toggleOrder(option.id)}
                            className={`p-3 rounded-lg border text-left transition-all text-sm ${
                              selectedOrders.includes(option.id)
                                ? "border-accent bg-accent/10"
                                : "border-border hover:border-accent/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  selectedOrders.includes(option.id)
                                    ? "bg-accent border-accent"
                                    : "border-muted-foreground"
                                }`}
                              >
                                {selectedOrders.includes(option.id) && (
                                  <CheckCircle className="h-3 w-3 text-white" />
                                )}
                              </div>
                              <span>{option.label}</span>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Documentation</CardTitle>
                <CardDescription>
                  Write a brief assessment and plan note for this patient encounter.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Suggested Format:</h4>
                    <p className="text-sm text-muted-foreground">
                      A/P: [Age] y/o [gender] with [relevant PMH] presenting with [chief complaint]...
                      <br />
                      <br />
                      Most likely diagnosis is [X] given [supporting evidence].
                      <br />
                      Differential includes [Y, Z].
                      <br />
                      <br />
                      Plan:
                      <br />
                      1. [Diagnostic workup]
                      <br />
                      2. [Initial management]
                      <br />
                      3. [Disposition/next steps]
                    </p>
                  </div>
                  <Textarea
                    placeholder="Write your clinical note here..."
                    rows={10}
                    value={clinicalNote}
                    onChange={(e) => setClinicalNote(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card className="border-accent">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full gradient-livemed flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>ATLAS™ Faculty Evaluation</CardTitle>
                    <CardDescription>AI-powered assessment of your clinical reasoning</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Score */}
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="text-5xl font-bold text-gradient-livemed mb-2">87%</div>
                  <p className="text-muted-foreground">Overall Performance Score</p>
                </div>

                {/* Competency Breakdown */}
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { name: "Clinical Reasoning", score: 90, feedback: "Excellent differential diagnosis consideration" },
                    { name: "Medical Knowledge", score: 85, feedback: "Strong understanding of ACS workup" },
                    { name: "Patient Care", score: 88, feedback: "Appropriate initial management orders" },
                    { name: "Documentation", score: 82, feedback: "Clear and organized note structure" },
                  ].map((competency) => (
                    <Card key={competency.name}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{competency.name}</span>
                          <span className="text-accent font-bold">{competency.score}%</span>
                        </div>
                        <Progress value={competency.score} className="h-2 mb-2" />
                        <p className="text-xs text-muted-foreground">{competency.feedback}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Detailed Feedback */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-accent" />
                      Faculty Commentary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-livemed-success/10 border border-livemed-success/20 rounded-lg">
                      <h4 className="font-medium text-livemed-success mb-2">Strengths</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Correctly identified ACS as the primary concern</li>
                        <li>• Appropriate consideration of aortic dissection in differential</li>
                        <li>• Ordered all essential initial labs and ECG</li>
                        <li>• Initiated appropriate MONA therapy</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-livemed-warning/10 border border-livemed-warning/20 rounded-lg">
                      <h4 className="font-medium text-livemed-warning mb-2">Areas for Improvement</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Consider risk stratification using HEART or TIMI score</li>
                        <li>• Morphine is now controversial in ACS - current guidelines suggest avoiding</li>
                        <li>• Include cardiology consult in your plan for potential cath lab activation</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center gap-4">
                  <Button variant="outline" asChild>
                    <Link to="/rotations">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Rotations
                    </Link>
                  </Button>
                  <Button className="gradient-livemed" asChild>
                    <Link to="/atlas">
                      Discuss with ATLAS™
                      <MessageSquare className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="flex-1 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/rotations" className="hover:text-foreground">Rotations</Link>
            <span>/</span>
            <span>Internal Medicine</span>
            <span>/</span>
            <span>Case 1</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Chest Pain Evaluation</h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline">Internal Medicine</Badge>
            <Badge variant="outline">Cardiology</Badge>
            <span className="text-sm text-muted-foreground">~30 minutes</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Case Progress</span>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex justify-between">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  idx <= currentStep ? "text-accent" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    idx < currentStep
                      ? "bg-accent text-white"
                      : idx === currentStep
                      ? "bg-accent/20 border-2 border-accent"
                      : "bg-muted"
                  }`}
                >
                  {idx < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <span className="text-xs hidden md:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation */}
        {currentStep < steps.length - 1 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              className="gradient-livemed"
              onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
            >
              {currentStep === steps.length - 2 ? "Submit & Get Feedback" : "Continue"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default RotationExperience;
