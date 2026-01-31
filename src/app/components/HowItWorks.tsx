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
    <section id="how-it-works" className="relative py-32 px-6 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
            <span className="text-sm text-violet-400 font-medium">How It Works</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Get started in
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              three simple steps
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Setting up Gradely is quick and easy. You'll be tracking your grades in under a minute.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting lines */}
          <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-violet-500/50 via-purple-500/50 to-violet-500/50"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Card */}
              <div className="bg-gradient-to-b from-white/5 to-white/[0.02] rounded-2xl p-8 border border-white/10 hover:border-violet-500/50 transition-all duration-300 group">
                {/* Step number badge */}
                <div className="relative mb-8">
                  <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-500/30 group-hover:scale-105 transition-transform duration-300">
                    <step.icon className="w-14 h-14 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 rounded-xl bg-gray-950 border-2 border-violet-500 flex items-center justify-center">
                    <span className="text-sm font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-semibold text-white mb-3 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-center">
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
