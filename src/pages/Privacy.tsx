const Privacy = () => {
  return (
    <div className="flex-1">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              enroll in courses, or contact us for support. This may include:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Name and contact information</li>
              <li>Educational background and institution</li>
              <li>Learning progress and assessment results</li>
              <li>Payment information for subscription services</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your learning experience</li>
              <li>Process transactions and send related information</li>
              <li>Send educational updates and promotional communications</li>
              <li>Respond to your comments and questions</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement industry-standard security measures to protect your personal information. 
              However, no method of transmission over the Internet is 100% secure, and we cannot 
              guarantee absolute security.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Service providers who assist in our operations</li>
              <li>Partner institutions (with your consent)</li>
              <li>Legal authorities when required by law</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              You have the right to access, update, or delete your personal information. You may also 
              opt out of promotional communications at any time.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Cookies and Tracking</h2>
            <p className="text-muted-foreground mb-4">
              We use cookies and similar tracking technologies to enhance your experience, analyze 
              usage patterns, and deliver personalized content.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. FERPA Compliance</h2>
            <p className="text-muted-foreground mb-4">
              For users affiliated with educational institutions, we comply with the Family Educational 
              Rights and Privacy Act (FERPA) regarding the protection of educational records.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about this Privacy Policy, please contact us at privacy@livemed.edu.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Privacy;