import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts - loaded eagerly as it wraps all public routes
import PublicLayout from "./components/layout/PublicLayout";

// Landing page loaded eagerly for fast initial paint
import Landing from "./pages/Landing";

// All other pages loaded lazily for code splitting
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Atlas = lazy(() => import("./pages/Atlas"));
const Programs = lazy(() => import("./pages/Programs"));
const Rotations = lazy(() => import("./pages/Rotations"));
const VirtualRounds = lazy(() => import("./pages/VirtualRounds"));
const Institutions = lazy(() => import("./pages/Institutions"));
const Curriculum = lazy(() => import("./pages/Curriculum"));
const ModuleView = lazy(() => import("./pages/ModuleView"));
const Assessments = lazy(() => import("./pages/Assessments"));
const DiagnosticAssessment = lazy(() => import("./pages/DiagnosticAssessment"));
const Apply = lazy(() => import("./pages/Apply"));
const Contact = lazy(() => import("./pages/Contact"));
const RotationExperience = lazy(() => import("./pages/RotationExperience"));
const About = lazy(() => import("./pages/About"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Residency = lazy(() => import("./pages/Residency"));
const Profile = lazy(() => import("./pages/Profile"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Admin = lazy(() => import("./pages/Admin"));
const ScorePredictor = lazy(() => import("./pages/ScorePredictor"));
const PendingApproval = lazy(() => import("./pages/PendingApproval"));
const NotFound = lazy(() => import("./pages/NotFound"));
const QBank = lazy(() => import("./pages/QBank"));
const QBankCreate = lazy(() => import("./pages/QBankCreate"));
const QBankSession = lazy(() => import("./pages/QBankSession"));
const QBankReview = lazy(() => import("./pages/QBankReview"));
const QBankPerformance = lazy(() => import("./pages/QBankPerformance"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Minimal loading fallback that matches the dark theme
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes with Header/Footer */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/programs/:level" element={<Programs />} />
              <Route path="/rotations" element={<Rotations />} />
              <Route path="/institutions" element={<Institutions />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/case-studies" element={<CaseStudies />} />
            </Route>

            {/* Auth Route (standalone) */}
            <Route path="/auth" element={<Auth />} />

            {/* Onboarding (after signup) */}
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Pending Approval (awaiting admin approval) */}
            <Route path="/pending-approval" element={<PendingApproval />} />

            {/* Dashboard (authenticated) */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Curriculum (authenticated) */}
            <Route path="/curriculum" element={<Curriculum />} />
            <Route path="/curriculum/:moduleId" element={<ModuleView />} />

            {/* Assessments (authenticated) */}
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/diagnostic" element={<DiagnosticAssessment />} />

            {/* Virtual Rotation Experience (authenticated) */}
            <Route path="/rotation-experience" element={<RotationExperience />} />

            {/* Live Virtual Rounds with US Physicians (authenticated) */}
            <Route path="/virtual-rounds" element={<VirtualRounds />} />

            {/* ATLAS AI Professor (authenticated) */}
            <Route path="/atlas" element={<Atlas />} />

            {/* Residency Readiness (authenticated) */}
            <Route path="/residency" element={<Residency />} />

            {/* MATCH Ready Score Predictor (authenticated) */}
            <Route path="/score-predictor" element={<ScorePredictor />} />

            {/* Profile Settings (authenticated) */}
            <Route path="/profile" element={<Profile />} />

            {/* QBank - Question Bank (authenticated) */}
            <Route path="/qbank" element={<QBank />} />
            <Route path="/qbank/create" element={<QBankCreate />} />
            <Route path="/qbank/session/:id" element={<QBankSession />} />
            <Route path="/qbank/review/:id" element={<QBankReview />} />
            <Route path="/qbank/performance" element={<QBankPerformance />} />

            {/* Admin Dashboard (platform_admin only) */}
            <Route path="/admin" element={<Admin />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
