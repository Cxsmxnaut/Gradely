export function FAQPage() {
  const faqs = [
    {
      question: "What is Gradely?",
      answer: "Gradely is a modern student dashboard that integrates with StudentVUE to help you track grades, calculate GPA, and stay on top of your academic progress in one beautiful interface."
    },
    {
      question: "How does Gradely work with StudentVUE?",
      answer: "Gradely securely connects to your StudentVUE account using your credentials. We fetch your grades, assignments, and other academic data and display them in an easy-to-use dashboard."
    },
    {
      question: "Is my data secure?",
      answer: "Yes! Your credentials are encrypted and stored securely. We use industry-standard encryption and never share your data with third parties. Your privacy is our top priority."
    },
    {
      question: "Can I use Gradely on multiple devices?",
      answer: "Yes! With cross-device synchronization, your account works seamlessly across all your devices. Login once and access your grades anywhere."
    },
    {
      question: "What happens if my school doesn't use StudentVUE?",
      answer: "Gradely is specifically designed for StudentVUE integration. If your school doesn't use StudentVUE, unfortunately Gradely won't be able to fetch your grade data."
    },
    {
      question: "How often are grades updated?",
      answer: "Grades are updated in real-time whenever your teachers post new grades in StudentVUE. You'll receive notifications for new grades and important updates."
    },
    {
      question: "Can I export my data?",
      answer: "Yes, you can export your grade data, GPA calculations, and progress reports at any time from your account settings."
    },
    {
      question: "What's included in the free plan?",
      answer: "The free plan includes grade tracking, GPA calculation, StudentVUE integration, basic email notifications, and single device access."
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel your subscription anytime from your account settings. No questions asked, and you'll continue to have access until the end of your billing period."
    },
    {
      question: "Is there a mobile app?",
      answer: "Gradely is designed to work perfectly on mobile browsers. We're working on native mobile apps for iOS and Android coming soon!"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Frequently Asked
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {" "}Questions
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Everything you need to know about Gradely. Can't find what you're looking for? 
            <a href="/contact" className="text-primary hover:underline ml-1">Contact us</a>.
          </p>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <details 
                key={index}
                className="group bg-card rounded-xl border border-border overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                  <h3 className="text-lg font-semibold text-foreground pr-4">
                    {faq.question}
                  </h3>
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 group-open:rotate-180 transition-transform">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
          
          {/* Still have questions */}
          <div className="mt-16 text-center p-8 bg-muted/50 rounded-xl border border-border">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
              >
                Contact Support
              </a>
              <a 
                href="mailto:support@gradely.app"
                className="inline-flex items-center justify-center px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors border border-border"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
