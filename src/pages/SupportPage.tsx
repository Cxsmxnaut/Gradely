export function SupportPage() {
  const supportCategories = [
    {
      title: "Getting Started",
      icon: "🚀",
      articles: [
        "How to connect StudentVUE",
        "Setting up your account",
        "Understanding your dashboard",
        "First-time setup guide"
      ]
    },
    {
      title: "Account & Billing",
      icon: "💳",
      articles: [
        "Managing your subscription",
        "Updating payment methods",
        "Canceling your plan",
        "Refund policy"
      ]
    },
    {
      title: "Technical Issues",
      icon: "🔧",
      articles: [
        "Troubleshooting connection issues",
        "Grade sync problems",
        "Mobile app issues",
        "Browser compatibility"
      ]
    },
    {
      title: "Features",
      icon: "⭐",
      articles: [
        "Using grade analytics",
        "Setting up notifications",
        "Exporting your data",
        "Cross-device sync"
      ]
    }
  ];

  const commonIssues = [
    {
      problem: "Grades not syncing",
      solution: "Check your StudentVUE credentials and ensure your internet connection is stable."
    },
    {
      problem: "Can't login",
      solution: "Reset your password or check if you're using the correct StudentVUE credentials."
    },
    {
      problem: "App not loading",
      solution: "Clear your browser cache and try refreshing the page."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Help &
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {" "}Support
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Find answers to common questions or get help from our support team.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full px-6 py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Support Categories */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-16">
            Browse by category
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {supportCategories.map((category, index) => (
              <div key={index} className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{category.title}</h3>
                <ul className="space-y-2">
                  {category.articles.map((article, i) => (
                    <li key={i}>
                      <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                        {article}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Issues */}
      <section className="py-32 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-16">
            Quick fixes for common issues
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {commonIssues.map((issue, index) => (
              <div key={index} className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {issue.problem}
                </h3>
                <p className="text-muted-foreground">
                  {issue.solution}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Still need help?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Our support team is here to help you 24/7
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Email Support</h3>
              <p className="text-muted-foreground mb-4">Get help via email</p>
              <a href="mailto:support@gradely.app" className="text-primary hover:underline">
                support@gradely.app
              </a>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Live Chat</h3>
              <p className="text-muted-foreground mb-4">Chat with our team</p>
              <button className="text-primary hover:underline">
                Start chat
              </button>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Documentation</h3>
              <p className="text-muted-foreground mb-4">Browse guides</p>
              <a href="/docs" className="text-primary hover:underline">
                View docs
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
