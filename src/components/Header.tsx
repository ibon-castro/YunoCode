import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Code, Menu, X } from "lucide-react";
import { AuthModal } from "./AuthModal";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "@/components/theme-provider";

interface HeaderProps {
  onNavigate?: (section: string) => void;
}

export const Header = ({ onNavigate }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);
  const { theme } = useTheme();

  const navigation = [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <>
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img
                src={theme === "dark" ? "/logo-white.svg" : "/logo-black.svg"}
                alt="YunoCode Logo"
                className="h-16 w-32"
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.(item.href.replace("#", ""));
                  }}
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Theme Toggle and Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                onClick={() => setAuthModal("login")}
                className="hover:bg-accent"
              >
                Log In
              </Button>
              <Button
                variant="default"
                onClick={() => setAuthModal("signup")}
                className="shadow-glow"
              >
                Sign Up
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <nav className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 px-4 py-2"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate?.(item.href.replace("#", ""));
                      setIsMenuOpen(false);
                    }}
                  >
                    {item.name}
                  </a>
                ))}
                <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setAuthModal("login");
                      setIsMenuOpen(false);
                    }}
                  >
                    Log In
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      setAuthModal("signup");
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        type={authModal}
        isOpen={authModal !== null}
        onClose={() => setAuthModal(null)}
        onSwitchMode={(newType) => setAuthModal(newType)}
      />
    </>
  );
};