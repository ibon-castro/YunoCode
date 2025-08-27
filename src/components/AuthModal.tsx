import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Github, Mail, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AuthModalProps {
  type: "login" | "signup" | null;
  isOpen: boolean;
  onClose: () => void;
  onSwitchMode: (newType: "login" | "signup") => void;
}

export const AuthModal = ({ type, isOpen, onClose, onSwitchMode }: AuthModalProps) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loginField, setLoginField] = useState(""); // For username or email login
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateUsername = (username: string) => {
    const requirements = {
      length: username.length >= 3 && username.length <= 20,
      format: /^[a-zA-Z0-9_-]+$/.test(username),
      startEnd: /^[a-zA-Z0-9]/.test(username) && /[a-zA-Z0-9]$/.test(username)
    };
    
    return {
      isValid: Object.values(requirements).every(Boolean),
      requirements
    };
  };

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 10,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(requirements).filter(Boolean).length;
    const isValid = Object.values(requirements).every(Boolean); // All requirements must be met
    
    let strength = "Too Weak";
    let color = "bg-red-500";
    let percentage = (score / 5) * 100;
    
    if (score <= 1) {
      strength = "Too Weak";
      color = "bg-red-500";
    } else if (score === 2) {
      strength = "Unsafe";
      color = "bg-orange-500";
    } else if (score === 3) {
      strength = "Risky";
      color = "bg-yellow-500";
    } else if (score === 4) {
      strength = "Almost Secure";
      color = "bg-yellow-600";
    } else if (score === 5) {
      strength = "Secure";
      color = "bg-green-500";
    }
    
    return { requirements, isValid, score, strength, color, percentage };
  };

  const passwordValidation = type === "signup" ? validatePassword(password) : null;
  const usernameValidation = type === "signup" ? validateUsername(username) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (type === "signup") {
        if (password !== confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match",
            variant: "destructive",
          });
          return;
        }

        if (passwordValidation && !passwordValidation.isValid) {
          toast({
            title: "Error",
            description: "Password does not meet requirements",
            variant: "destructive",
          });
          return;
        }

        if (usernameValidation && !usernameValidation.isValid) {
          toast({
            title: "Error",
            description: "Username must be 3-20 characters, contain only letters, numbers, hyphens, and underscores, and start/end with a letter or number",
            variant: "destructive",
          });
          return;
        }

        // Check if username already exists
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username.toLowerCase())
          .maybeSingle();

        if (existingUser) {
          toast({
            title: "Error",
            description: "Username is already taken",
            variant: "destructive",
          });
          return;
        }
      }

      let result;
      
      if (type === "signup") {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              username: username.toLowerCase()
            }
          }
        });
      } else {
        // Try to determine if loginField is email or username
        const isEmail = loginField.includes('@');
        
        if (isEmail) {
          result = await supabase.auth.signInWithPassword({
            email: loginField,
            password
          });
        } else {
          // Get email from username
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', loginField.toLowerCase())
            .maybeSingle();

          if (!profile?.email) {
            toast({
              title: "Error",
              description: "Username not found",
              variant: "destructive",
            });
            return;
          }

          result = await supabase.auth.signInWithPassword({
            email: profile.email,
            password
          });
        }
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Success!",
        description: type === "login" ? "Welcome back!" : "Account created successfully!",
      });

      onClose();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setUsername("");
    setLoginField("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {type === "login" ? "Welcome Back" : "Create Account"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Social Login */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full" disabled={isLoading}>
              <Github className="w-4 h-4 mr-2" />
              Continue with GitHub
            </Button>
            <Button variant="outline" className="w-full" disabled={isLoading}>
              <Mail className="w-4 h-4 mr-2" />
              Continue with Google
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with {type === "login" ? "username/email" : "email"}
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {type === "login" ? (
              <div className="space-y-2">
                <Label htmlFor="loginField">Username or Email</Label>
                <Input
                  id="loginField"
                  type="text"
                  placeholder="Enter your username or email"
                  value={loginField}
                  onChange={(e) => setLoginField(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    required
                    disabled={isLoading}
                  />
                  {usernameValidation && username.length > 0 && !usernameValidation.isValid && (
                    <p className="text-xs text-destructive">
                      Username must be 3-20 characters, contain only letters, numbers, hyphens, and underscores
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {type === "signup" && passwordValidation && password.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Password Strength</span>
                  <span className="text-xs text-muted-foreground">{passwordValidation.strength}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${passwordValidation.color}`}
                    style={{ width: `${passwordValidation.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {type === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading
                ? "Loading..."
                : type === "login"
                ? "Sign In"
                : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {type === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => {
                resetForm();
                onSwitchMode(type === "login" ? "signup" : "login");
              }}
              disabled={isLoading}
            >
              {type === "login" ? "Sign up" : "Sign in"}
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};