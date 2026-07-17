import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, Send } from "lucide-react";
import AppShell from "@/components/layout/AppShell";

const LORRequests = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      const { data } = await supabase
        .from("contact_inquiries")
        .select("*")
        .eq("inquiry_type", "lor_request")
        .eq("email", session.user.email!)
        .order("created_at", { ascending: false });
      setHistory(data || []);
    });
  }, [navigate]);

  const handleSubmit = async () => {
    if (!studentName || !studentEmail || !message) {
      toast({ title: "Missing info", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_inquiries").insert({
      full_name: user?.user_metadata?.first_name ? `Dr. ${user.user_metadata.first_name} ${user.user_metadata.last_name || ""}` : (user?.email || "Physician"),
      email: user?.email || "",
      inquiry_type: "lor_request",
      organization: "Livemed Academy",
      role: "physician",
      message: `Student: ${studentName} <${studentEmail}>\n\n${message}`,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "LOR request submitted", description: "The Livemed team will follow up shortly." });
      setStudentName(""); setStudentEmail(""); setMessage("");
    }
  };

  return (
    <AppShell>
      <main className="container mx-auto py-8 max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Letters of Recommendation</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Draft an LOR</CardTitle>
            <CardDescription>
              Submit a letter of recommendation for a Livemed student. The academic office will format it on institutional letterhead and route it to the student.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Student Name</Label>
                <Input id="studentName" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentEmail">Student Email</Label>
                <Input id="studentEmail" type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} placeholder="student@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Letter Content</Label>
              <Textarea id="message" rows={10} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe the student's clinical skills, professionalism, and readiness for residency..." />
            </div>
            <Button onClick={handleSubmit} disabled={submitting} className="w-full gradient-livemed">
              <Send className="mr-2 h-4 w-4" /> {submitting ? "Submitting..." : "Submit LOR"}
            </Button>
          </CardContent>
        </Card>

        {history.length > 0 && (
          <Card className="mt-6">
            <CardHeader><CardTitle>Previous Submissions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="p-3 rounded-lg border bg-background">
                  <p className="text-xs text-muted-foreground">{h.created_at ? new Date(h.created_at).toLocaleString() : ""}</p>
                  <pre className="text-sm whitespace-pre-wrap mt-1">{h.message}</pre>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </AppShell>
  );
};

export default LORRequests;