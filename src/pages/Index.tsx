import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { EditorPreview } from "@/components/EditorPreview";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";

const Index = () => {
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);

  const handleGetStarted = () => {
    setAuthModal("signup");
  };

  const handleNavigate = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={handleNavigate} />
      <main>
        <HeroSection onGetStarted={handleGetStarted} />
        <FeaturesSection />
        <EditorPreview />
        <ContactForm />
      </main>
      <Footer />
      <AuthModal
        type={authModal}
        isOpen={authModal !== null}
        onClose={() => setAuthModal(null)}
        onSwitchMode={(newType) => setAuthModal(newType)}
      />
    </div>
  );
};

export default Index;