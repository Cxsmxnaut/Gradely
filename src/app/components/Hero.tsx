import { Button } from "@/app/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background pt-20">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">StudentVUE Integration • Mail • Cross-Device Sync</span>
        </div>

        {/* Main headline */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6">
          <span className="text-foreground">Your grades.</span>
          <br />
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Smarter, connected, stress-free.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Connect your StudentVUE account and access grades, mail, and progress tracking across all your devices. The complete student dashboard.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg shadow-xl shadow-primary/30 group"
          >
            Connect StudentVUE
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="border-border bg-background hover:bg-muted text-foreground px-8 py-6 text-lg"
            onClick={() => window.location.href = '/gradely-login'}
          >
            Create Gradely Account
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="text-yellow-400">★</span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Join thousands of students improving their grades</p>
        </div>

        {/* Dashboard mockup */}
        <div className="mt-20 relative">
          <div className="relative max-w-5xl mx-auto">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-primary/10 blur-3xl rounded-3xl"></div>
            
            {/* Dashboard card */}
            <div className="relative bg-card rounded-2xl border border-border p-8 shadow-2xl">
              {/* Mock dashboard header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70"></div>
                  <div>
                    <div className="h-3 w-24 bg-muted rounded"></div>
                    <div className="h-2 w-16 bg-muted/50 rounded mt-2"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-destructive"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                </div>
              </div>

              {/* Mock navigation tabs */}
              <div className="flex gap-2 mb-6">
                {['Dashboard', 'Grades', 'Mail', 'Attendance'].map((tab, i) => (
                  <div 
                    key={i}
                    className={`px-4 py-2 rounded-lg text-xs font-medium ${
                      i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {tab}
                  </div>
                ))}
              </div>

              {/* Mock content grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'GPA', value: '3.7', trend: '+0.2' },
                  { label: 'Mail', value: '3 new', trend: 'Unread' },
                  { label: 'Attendance', value: '95%', trend: 'Good' }
                ].map((_, i) => (
                  <div key={i} className="bg-muted/50 rounded-xl p-6 border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-3 w-16 bg-muted rounded"></div>
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/30 to-primary/20"></div>
                    </div>
                    <div className="h-6 w-12 bg-gradient-to-r from-primary to-primary/70 rounded mb-2"></div>
                    <div className="h-2 w-full bg-muted rounded"></div>
                  </div>
                ))}
              </div>

              {/* Mock chart */}
              <div className="bg-muted/50 rounded-xl p-6 border border-border">
                <div className="h-3 w-32 bg-muted rounded mb-4"></div>
                <div className="flex items-end gap-2 h-32">
                  {[40, 65, 55, 80, 70, 90, 85, 95].map((height, i) => (
                    <div 
                      key={i}
                      className="flex-1 bg-gradient-to-t from-primary to-primary/70 rounded-t"
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
