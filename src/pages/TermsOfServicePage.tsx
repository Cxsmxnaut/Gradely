export function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Terms of
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {" "}Service
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            By using Gradely, you agree to these terms and conditions.
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    By accessing and using Gradely, you accept and agree to be bound by the terms 
                    and provision of this agreement. If you do not agree to abide by the above, 
                    please do not use this service.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Description of Service</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    Gradely is a student dashboard service that integrates with StudentVUE to provide 
                    grade tracking, GPA calculation, and academic progress monitoring. The service 
                    is provided "as is" and may be subject to change without notice.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. User Responsibilities</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>As a user of Gradely, you agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Use the service for legitimate educational purposes only</li>
                    <li>Not attempt to circumvent or compromise our security measures</li>
                    <li>Respect the intellectual property rights of others</li>
                    <li>Comply with all applicable laws and regulations</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. StudentVUE Integration</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    Gradely integrates with StudentVUE educational systems. By using this integration, 
                    you acknowledge that:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You have the right to access your StudentVUE account</li>
                    <li>You are responsible for maintaining your StudentVUE credentials</li>
                    <li>Gradely is not affiliated with or endorsed by StudentVUE or Edupoint</li>
                    <li>StudentVUE is a registered trademark of Edupoint Educational Systems LLC</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Privacy and Data Protection</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    Your privacy is important to us. Our use and protection of your personal information 
                    is governed by our Privacy Policy, which is incorporated into these Terms of Service 
                    by reference.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Intellectual Property</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    The service and its original content, features, and functionality are owned by Gradely 
                    and are protected by international copyright, trademark, and other intellectual 
                    property laws.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. User-Generated Content</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    You retain ownership of any content you submit to Gradely. By submitting content, 
                    you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, 
                    and display such content in connection with the service.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Paid Services</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    Some features of Gradely may require payment. By subscribing to paid services, 
                    you agree to pay all applicable fees. All fees are non-refundable unless otherwise 
                    specified.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Termination</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    We may terminate or suspend your account immediately, without prior notice or 
                    liability, for any reason, including if you breach the Terms of Service.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Disclaimer of Warranties</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    The service is provided on an "AS IS" and "AS AVAILABLE" basis. Gradely makes 
                    no warranties, expressed or implied, and hereby disclaims all warranties including, 
                    without limitation, implied warranties of merchantability, fitness for a particular 
                    purpose, or non-infringement.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">11. Limitation of Liability</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    In no event shall Gradely, its directors, employees, partners, agents, suppliers, 
                    or affiliates be liable for any indirect, incidental, special, consequential, or 
                    punitive damages, including loss of profits, data, use, goodwill, or other intangible 
                    losses, resulting from your use of the service.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">12. Governing Law</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    These Terms of Service shall be interpreted and governed by the laws of the State 
                    of California, United States, without regard to its conflict of law provisions.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">13. Changes to Terms</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    We reserve the right to modify these terms at any time. If we make material changes, 
                    we will notify you by email or by posting a notice on our site prior to the effective 
                    date of the changes.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">14. Contact Information</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    If you have any questions about these Terms of Service, please contact us at:
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg border border-border">
                    <p><strong>Email:</strong> legal@gradely.app</p>
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
