import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { EditorPreview } from "@/components/EditorPreview";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import { AuthenticatedView } from "@/components/AuthenticatedView";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Index = () => {
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    setAuthModal("signup");
  };

  const handleNavigate = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (user) {
    return <AuthenticatedView />;
  }

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