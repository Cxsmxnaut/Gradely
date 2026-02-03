import { Button } from "@/app/components/ui/button";
import { ArrowRight } from "lucide-react";

export function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "Grade tracking",
        "GPA calculation",
        "StudentVUE integration",
        "Basic email notifications",
        "Single device"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Premium",
      price: "$4.99",
      period: "/month",
      description: "Best for serious students",
      features: [
        "Everything in Free",
        "Advanced grade analytics",
        "Email integration",
        "Cross-device sync",
        "Priority support",
        "Grade predictions",
        "Unlimited storage"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Student",
      price: "$2.99",
      period: "/month",
      description: "For students on a budget",
      features: [
        "Grade tracking",
        "GPA calculation",
        "StudentVUE integration",
        "Email notifications",
        "Cross-device sync",
        "Basic analytics"
      ],
      cta: "Get Started",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Simple, transparent
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {" "}pricing
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choose the plan that works best for you. Start free, upgrade anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`relative bg-card rounded-2xl p-8 border ${
                  plan.popular 
                    ? 'border-primary shadow-xl shadow-primary/10 scale-105' 
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <p className="text-muted-foreground">
              All plans include secure StudentVUE integration and basic features.
              <br />
              No credit card required for free plan.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
