import { GraduationCap } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface NavbarProps {
  onGetStarted?: () => void;
}

export function Navbar({ onGetStarted }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Gradely</span>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onGetStarted}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Log In
            </button>
            <Button 
              onClick={onGetStarted}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
