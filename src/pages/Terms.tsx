const Terms = () => {
  return (
    <div className="flex-1">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing and using Livemed Academy ("the Platform"), you accept and agree to be 
              bound by the terms and provisions of this agreement. If you do not agree to abide by 
              these terms, please do not use this service.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground mb-4">
              Livemed Academy provides an AI-powered professional medical education platform designed for medical 
              students, physicians, and healthcare professionals. Our services include but are not limited to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Virtual clinical observerships and case-based learning</li>
              <li>AI-assisted tutoring through ATLAS™</li>
              <li>USMLE preparation resources</li>
              <li>Continuing medical education (CME)</li>
              <li>Progress tracking and competency assessments</li>
              <li>Professional certificates and credentials</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2a. Educational Disclaimer</h2>
            <p className="text-muted-foreground mb-4">
              Livemed Academy is a professional education platform offering clinical training, 
              continuing medical education, and competency-based credentials. Livemed Academy 
              is not a degree-granting institution and does not award MD or equivalent medical degrees.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground mb-4">
              To access certain features of the Platform, you must register for an account. You agree 
              to provide accurate, current, and complete information during registration and to update 
              such information to keep it accurate, current, and complete.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Educational Content Disclaimer</h2>
            <p className="text-muted-foreground mb-4">
              The content provided on Livemed Academy is for educational purposes only and should not 
              be considered medical advice. Users should always consult with qualified healthcare 
              professionals for medical decisions. All clinical decisions require real attending physician oversight.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Intellectual Property</h2>
            <p className="text-muted-foreground mb-4">
              All content, features, and functionality of the Platform are owned by Livemed Academy 
              and are protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Subscription and Payments</h2>
            <p className="text-muted-foreground mb-4">
              Certain features require a paid subscription. Subscription fees are billed in advance 
              on a monthly or annual basis. Refunds may be issued at our discretion in accordance 
              with our refund policy.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Termination</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right to terminate or suspend your account at any time for violations 
              of these terms or for any other reason at our sole discretion.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contact Information</h2>
            <p className="text-muted-foreground mb-4">
              For questions about these Terms, please contact us at legal@livemed.edu.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;