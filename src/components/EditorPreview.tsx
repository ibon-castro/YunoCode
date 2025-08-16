import { Construction } from "lucide-react";

export const EditorPreview = () => {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How It{" "}
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our collaborative code editor is coming soon with exciting features.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl border border-border shadow-large p-16 text-center">
            <Construction className="w-16 h-16 text-primary mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-card-foreground mb-4">
              Under Construction
            </h3>
            <p className="text-muted-foreground text-lg">
              We're working hard to bring you the best collaborative coding experience. 
              Stay tuned for updates!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};