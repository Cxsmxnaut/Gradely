import { Link2, Eye, TrendingUp } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Link2,
      title: "Connect StudentVUE",
      description: "Securely link your StudentVUE account in seconds. Your credentials are encrypted and safe.",
    },
    {
      number: "02",
      icon: Eye,
      title: "View grades instantly",
      description: "All your classes and assignments appear in a clean, beautiful dashboard tailored for students.",
    },
    {
      number: "03",
      icon: TrendingUp,
      title: "Stay on top of school",
      description: "Track your progress, calculate your GPA, and never miss an important grade update.",
    },
  ];

  return (
    <section id="how-it-works" className="relative py-32 px-6 bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm text-primary font-medium">How It Works</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Get started in
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              three simple steps
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Setting up Gradely is quick and easy. You'll be tracking your grades in under a minute.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting lines */}
          <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary/50 via-primary/30 to-primary/50"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Card */}
              <div className="bg-gradient-to-b from-card to-card/50 rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-300 group">
                {/* Step number badge */}
                <div className="relative mb-8">
                  <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/30 group-hover:scale-105 transition-transform duration-300">
                    <step.icon className="w-14 h-14 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 rounded-xl bg-background border-2 border-primary flex items-center justify-center">
                    <span className="text-sm font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-semibold text-foreground mb-3 text-center">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
