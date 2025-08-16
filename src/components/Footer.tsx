import { Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-foreground font-medium text-lg">
              Ibon Castro Llorente
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              PFG Ingeniería Informática - Universidad de Deusto - Curso 2025/26
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <a
                href="https://linkedin.com/in/ibon-castro"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            </Button>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 YunoCode. Final Degree Project - University of Deusto.
          </p>
        </div>
      </div>
    </footer>
  );
};