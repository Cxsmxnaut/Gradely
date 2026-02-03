import { Eye, TrendingUp, Calculator, Zap, Shield, BarChart3, Mail, Smartphone, Bell } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Eye,
      title: "View all grades in one place",
      description: "See every class, assignment, and score without switching between pages. Everything you need, unified in one dashboard.",
    },
    {
      icon: Mail,
      title: "StudentVUE Mail integration",
      description: "Access your StudentVUE emails directly in Gradely. Never miss important grade notifications or teacher messages.",
    },
    {
      icon: TrendingUp,
      title: "Advanced grade progression charts",
      description: "Beautiful, interactive charts showing your grade progression over time with dynamic scaling and detailed insights.",
    },
    {
      icon: Smartphone,
      title: "Cross-device synchronization",
      description: "Login once and access your account seamlessly across all devices. Your credentials sync automatically.",
    },
    {
      icon: Calculator,
      title: "Calculate GPA automatically",
      description: "Get instant GPA calculations across all your classes—no manual math needed. Always know where you stand.",
    },
    {
      icon: Bell,
      title: "Real-time notifications",
      description: "Stay informed with instant notifications when new grades are posted or when you receive important messages.",
    },
    {
      icon: Shield,
      title: "Secure & private",
      description: "Your credentials are encrypted and stored securely. We never share your data with third parties.",
    },
    {
      icon: BarChart3,
      title: "Grade trends & insights",
      description: "Visualize your progress over time with beautiful charts and identify areas for improvement.",
    },
    {
      icon: Zap,
      title: "Lightning fast performance",
      description: "Optimized for speed with smart caching. Your data loads instantly, even on slower connections.",
    },
  ];

  return (
    <section id="features" className="relative py-32 px-6 bg-gray-950">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-purple-950/10 to-gray-950"></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
            <span className="text-sm text-violet-400 font-medium">Features</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Everything you need to
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              excel in school
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Gradely simplifies grade tracking with powerful features designed specifically for students.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-gradient-to-b from-white/5 to-white/[0.02] rounded-2xl p-8 border border-white/10 hover:border-violet-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/0 to-purple-600/0 group-hover:from-violet-600/5 group-hover:to-purple-600/5 rounded-2xl transition-all duration-300"></div>
              
              <div className="relative">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* New features highlight */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 backdrop-blur-sm">
            <span className="text-violet-400 font-medium">✨ NEW</span>
            <span className="text-white">StudentVUE Mail & Cross-Device Sync</span>
          </div>
        </div>
      </div>
    </section>
  );
}
