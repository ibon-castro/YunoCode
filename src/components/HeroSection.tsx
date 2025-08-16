import { Button } from "@/components/ui/button";
import { Code, Users, Zap, Shield } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-primary-glow/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Content */}
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-accent/50 rounded-full border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">
                Real-time Collaboration
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Code Together{" "}
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                In Real-Time
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              The collaborative code editor that brings your team together.
              Write, edit, and execute code simultaneously with powerful
              real-time features.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="px-8 py-3 text-base"
            >
              <Code className="w-5 h-5 mr-2" />
              Start Coding Now
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 hover:shadow-medium transition-all duration-300">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Live Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Multiple developers coding simultaneously with real-time cursors and changes
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 hover:shadow-medium transition-all duration-300">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Code Execution</h3>
              <p className="text-sm text-muted-foreground">
                Run your code instantly with our powerful execution environment
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 hover:shadow-medium transition-all duration-300">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">
                Enterprise-grade security with encrypted sessions and private workspaces
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};