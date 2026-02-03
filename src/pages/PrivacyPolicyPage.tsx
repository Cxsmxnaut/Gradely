export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Privacy
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {" "}Policy
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Information We Collect</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    We collect information you provide directly to us, such as when you create an account, 
                    connect your StudentVUE account, or contact us for support.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>StudentVUE credentials (encrypted and stored securely)</li>
                    <li>Email address and account information</li>
                    <li>Usage data and analytics</li>
                    <li>Device and browser information</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">How We Use Your Information</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide and maintain our service</li>
                    <li>Connect to your StudentVUE account</li>
                    <li>Send you important notifications</li>
                    <li>Improve our service and user experience</li>
                    <li>Respond to your support requests</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Data Security</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    We take data security seriously. Your StudentVUE credentials are encrypted using 
                    industry-standard encryption protocols. We implement appropriate technical and 
                    organizational measures to protect your personal information against unauthorized 
                    access, alteration, disclosure, or destruction.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Data Sharing</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    We do not sell, trade, or otherwise transfer your personal information to third parties 
                    without your consent, except as described in this policy:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>StudentVUE (to access your academic data)</li>
                    <li>Service providers who assist in operating our service</li>
                    <li>When required by law or to protect our rights</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Your Rights</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Delete your account and data</li>
                    <li>Opt-out of certain communications</li>
                    <li>Export your data</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Cookies and Tracking</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    We use cookies and similar tracking technologies to improve your experience, 
                    analyze usage patterns, and provide personalized content. You can control cookies 
                    through your browser settings.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Children's Privacy</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    Gradely is designed for students under 18. We comply with applicable laws 
                    regarding children's privacy and require parental consent for data collection 
                    where required by law.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Changes to This Policy</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    We may update this privacy policy from time to time. We will notify you of any 
                    changes by posting the new policy on this page and updating the "Last Updated" date.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    If you have any questions about this Privacy Policy, please contact us at:
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg border border-border">
                    <p><strong>Email:</strong> privacy@gradely.app</p>
                    <p><strong>Address:</strong> 123 Student Way, San Francisco, CA 94102</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
