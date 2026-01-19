import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import PublicLayout from "./components/layout/PublicLayout";

// Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Atlas from "./pages/Atlas";
import Programs from "./pages/Programs";
import Rotations from "./pages/Rotations";
import VirtualRounds from "./pages/VirtualRounds";
import Institutions from "./pages/Institutions";
import Curriculum from "./pages/Curriculum";
import ModuleView from "./pages/ModuleView";
import Assessments from "./pages/Assessments";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import RotationExperience from "./pages/RotationExperience";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Residency from "./pages/Residency";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes with Header/Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/programs/:level" element={<Programs />} />
            <Route path="/rotations" element={<Rotations />} />
            <Route path="/institutions" element={<Institutions />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Route>

          {/* Auth Route (standalone) */}
          <Route path="/auth" element={<Auth />} />

          {/* Dashboard (authenticated) */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Curriculum (authenticated) */}
          <Route path="/curriculum" element={<Curriculum />} />
          <Route path="/curriculum/:moduleId" element={<ModuleView />} />

          {/* Assessments (authenticated) */}
          <Route path="/assessments" element={<Assessments />} />

          {/* Virtual Rotation Experience (authenticated) */}
          <Route path="/rotation-experience" element={<RotationExperience />} />

          {/* Live Virtual Rounds with US Physicians (authenticated) */}
          <Route path="/virtual-rounds" element={<VirtualRounds />} />

          {/* ATLAS AI Professor (authenticated) */}
          <Route path="/atlas" element={<Atlas />} />

          {/* Residency Readiness (authenticated) */}
          <Route path="/residency" element={<Residency />} />

          {/* Profile Settings (authenticated) */}
          <Route path="/profile" element={<Profile />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
