import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Plane, Shield, Lock, Mail, User, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { MFAVerification } from "@/components/MFAVerification";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoLight from "@/assets/logo-light.png";
import bannerHotels from "@/assets/ordinateur.jpg";
import heroBeach from "@/assets/hero-beach.jpg";
import destinationCity from "@/assets/destination-city.jpg";
import { useTranslation } from "react-i18next";

// Schémas de validation Zod sécurisés
const emailSchema = z
  .string()
  .trim()
  .min(1, "L'email est requis")
  .email("Format d'email invalide")
  .max(255, "L'email ne peut pas dépasser 255 caractères");

const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre");

const nameSchema = z
  .string()
  .trim()
  .min(2, "Le nom doit contenir au moins 2 caractères")
  .max(100, "Le nom ne peut pas dépasser 100 caractères")
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom contient des caractères invalides");

const signUpSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis"),
});

const resetPasswordSchema = z.object({
  email: emailSchema,
});

const updatePasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// Animation configurations
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.5,
      staggerChildren: 0.1
    } as Transition
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.3 } as Transition
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 } as Transition
  }
};

interface FormFieldProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  icon: React.ReactNode;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  showPasswordToggle?: boolean;
}

const AnimatedFormField = ({ 
  label, 
  name, 
  type, 
  placeholder, 
  icon, 
  error,
  value,
  onChange,
  showPasswordToggle 
}: FormFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      variants={itemVariants}
      className="space-y-1.5 md:space-y-2"
    >
      <Label htmlFor={name} className="flex items-center gap-2 text-xs md:text-sm font-medium text-foreground/80">
        <span className="text-primary">{icon}</span>
        {label}
      </Label>
      <div className="relative group">
        <motion.div
          animate={{
            boxShadow: isFocused 
              ? "0 0 0 3px hsl(var(--primary) / 0.15)" 
              : "0 0 0 0px transparent"
          }}
          className="rounded-xl overflow-hidden"
        >
          <Input
            id={name}
            name={name}
            type={showPasswordToggle && showPassword ? "text" : type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`h-12 md:h-11 text-base md:text-sm rounded-xl border-2 bg-background/50 backdrop-blur-sm transition-all duration-300 pr-12 placeholder:text-muted-foreground/50 ${
              error 
                ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20" 
                : isFocused 
                  ? "border-primary/50 bg-background" 
                  : "border-border/50 hover:border-border"
            }`}
          />
        </motion.div>
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1 rounded-lg hover:bg-primary/10"
          >
            <motion.div
              initial={false}
              animate={{ rotate: showPassword ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {showPassword ? <EyeOff className="h-5 w-5 md:h-4 md:w-4" /> : <Eye className="h-5 w-5 md:h-4 md:w-4" />}
            </motion.div>
          </button>
        )}
      </div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            className="text-xs text-destructive flex items-center gap-1.5 pt-0.5"
          >
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            <span>{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [showMFAVerification, setShowMFAVerification] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [rememberMe, setRememberMe] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Form states
  const [signInForm, setSignInForm] = useState({ email: "", password: "" });
  const [signUpForm, setSignUpForm] = useState({ fullName: "", email: "", password: "" });
  const [resetForm, setResetForm] = useState({ email: "" });
  const [updateForm, setUpdateForm] = useState({ password: "", confirmPassword: "" });
  
  // Error states
  const [signInErrors, setSignInErrors] = useState<Record<string, string>>({});
  const [signUpErrors, setSignUpErrors] = useState<Record<string, string>>({});
  const [resetErrors, setResetErrors] = useState<Record<string, string>>({});
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowUpdatePassword(true);
      }
      if (event === 'SIGNED_IN' && session) {
        // Check if MFA is required
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        
        if (aalData && aalData.nextLevel === 'aal2' && aalData.currentLevel === 'aal1') {
          // User has MFA enabled but hasn't verified yet
          setShowMFAVerification(true);
        } else {
          navigate("/");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = <T extends z.ZodSchema>(schema: T, data: z.infer<T>) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { valid: false, errors };
    }
    return { valid: true, errors: {} };
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const validation = validateForm(signUpSchema, signUpForm);
    setSignUpErrors(validation.errors);
    
    if (!validation.valid) return;
    
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: signUpForm.email.trim(),
      password: signUpForm.password,
      options: {
        data: { full_name: signUpForm.fullName.trim() },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    setLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          title: "Compte existant",
          description: "Un compte existe déjà avec cet email. Connectez-vous ou réinitialisez votre mot de passe.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Inscription réussie",
        description: "Vérifiez votre email pour confirmer votre compte",
      });
      setSignUpForm({ fullName: "", email: "", password: "" });
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const validation = validateForm(signInSchema, signInForm);
    setSignInErrors(validation.errors);
    
    if (!validation.valid) return;
    
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: signInForm.email.trim(),
      password: signInForm.password,
    });

    setLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast({
          title: "Identifiants incorrects",
          description: "Email ou mot de passe invalide. Vérifiez vos informations.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur B-Reserve!",
      });
      navigate("/");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      setLoading(false);
      toast({
        title: "Erreur Google",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const validation = validateForm(resetPasswordSchema, resetForm);
    setResetErrors(validation.errors);
    
    if (!validation.valid) return;
    
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetForm.email.trim(), {
      redirectTo: `${window.location.origin}/auth`,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe",
      });
      setShowResetPassword(false);
      setResetForm({ email: "" });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const validation = validateForm(updatePasswordSchema, updateForm);
    setUpdateErrors(validation.errors);
    
    if (!validation.valid) return;
    
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: updateForm.password });

    setLoading(false);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès",
      });
      setShowUpdatePassword(false);
      navigate("/");
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(signUpForm.password);
  const strengthColors = ["bg-destructive", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];
  const strengthLabels = [
    t('auth.passwordStrength.veryWeak'),
    t('auth.passwordStrength.weak'),
    t('auth.passwordStrength.medium'),
    t('auth.passwordStrength.strong'),
    t('auth.passwordStrength.veryStrong')
  ];

  // Show MFA verification screen
  if (showMFAVerification) {
    return (
      <MFAVerification 
        onSuccess={() => {
          toast({
            title: "Vérification réussie",
            description: "Bienvenue sur B-Reserve!",
          });
          navigate("/");
        }}
        onBack={() => {
          setShowMFAVerification(false);
          supabase.auth.signOut();
        }}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
      {/* Professional Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={logoLight}
              alt="B-Reserve"
              className="h-8 w-auto"
            />
            <span className="text-xl font-semibold text-gray-900">B-Reserve</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Accueil
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Services
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </a>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg"
            >
              Connexion
            </Button>
          </div>
        </div>
      </nav>
      
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 z-20 gap-2 hover:bg-gray-100 rounded-lg text-gray-600 border border-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Retour</span>
      </Button>
      
      <div className="w-full max-w-6xl flex flex-col lg:flex-row">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center">
          <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl w-full max-w-lg">
            <CardHeader className="text-center pb-6 pt-4 px-6">
              <div className="flex justify-center mb-4">
                <img 
                  src={logoLight}
                  alt="B-Reserve"
                  className="h-10 w-auto"
                />
              </div>
              <CardTitle className="text-2xl font-semibold text-gray-900 mb-2">
                B-Reserve
              </CardTitle>
              <CardDescription className="text-gray-600">
                {t('auth.yourAgency')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-6 pb-8">
            <AnimatePresence mode="wait">
              {showUpdatePassword ? (
                <div key="update-password">
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={updateForm.password}
                        onChange={(e) => setUpdateForm({ ...updateForm, password: e.target.value })}
                        className="h-11 border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le mot de passe
                      </label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={updateForm.confirmPassword}
                        onChange={(e) => setUpdateForm({ ...updateForm, confirmPassword: e.target.value })}
                        className="h-11 border-gray-300 rounded-md"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition-colors" 
                      disabled={loading}
                    >
                      {loading ? "Chargement..." : "Mettre à jour"}
                    </Button>
                  </form>
                </div>
              ) : showResetPassword ? (
                <div key="reset-password" className="space-y-4">
                  <Button
                    variant="ghost"
                    onClick={() => setShowResetPassword(false)}
                    className="mb-4 text-gray-600 hover:text-gray-900"
                  >
                    ← Retour à la connexion
                  </Button>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        placeholder="votre@email.com"
                        value={resetForm.email}
                        onChange={(e) => setResetForm({ email: e.target.value })}
                        className="h-11 border-gray-300 rounded-md"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition-colors" 
                      disabled={loading}
                    >
                      {loading ? "Chargement..." : "Réinitialiser le mot de passe"}
                    </Button>
                  </form>
                </div>
              ) : (
                <div key="main-form">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 h-11 bg-gray-100 p-1 rounded-xl">
                      <TabsTrigger 
                        value="signin"
                        className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-sm font-medium text-gray-700 data-[state=active]:text-gray-900"
                      >
                        Connexion
                      </TabsTrigger>
                      <TabsTrigger 
                        value="signup"
                        className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-sm font-medium text-gray-700 data-[state=active]:text-gray-900"
                      >
                        Inscription
                      </TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                      <TabsContent value="signin" className="mt-0">
                        <form onSubmit={handleSignIn} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email
                            </label>
                            <Input
                              type="email"
                              placeholder="votre@email.com"
                              value={signInForm.email}
                              onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                              className="h-11 border-gray-300 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mot de passe
                            </label>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              value={signInForm.password}
                              onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                              className="h-11 border-gray-300 rounded-xl"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                              />
                              <span className="text-sm text-gray-600">Se souvenir de moi</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowResetPassword(true)}
                              className="text-sm text-gray-600 hover:text-gray-900"
                            >
                              Mot de passe oublié ?
                            </button>
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors" 
                            disabled={loading}
                          >
                            {loading ? "Chargement..." : "Se connecter"}
                          </Button>
                          
                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-4 bg-white text-gray-500">ou</span>
                            </div>
                          </div>
                          
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-11 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors rounded-xl"
                            disabled={loading}
                            onClick={handleGoogleSignIn}
                          >
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continuer avec Google
                          </Button>
                        </form>
                      </TabsContent>

                      <TabsContent value="signup" className="mt-0">
                        <form onSubmit={handleSignUp} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nom complet
                            </label>
                            <Input
                              type="text"
                              placeholder="Jean Dupont"
                              value={signUpForm.fullName}
                              onChange={(e) => setSignUpForm({ ...signUpForm, fullName: e.target.value })}
                              className="h-11 border-gray-300 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email
                            </label>
                            <Input
                              type="email"
                              placeholder="votre@email.com"
                              value={signUpForm.email}
                              onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                              className="h-11 border-gray-300 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mot de passe
                            </label>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              value={signUpForm.password}
                              onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                              className="h-11 border-gray-300 rounded-xl"
                            />
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors" 
                            disabled={loading}
                          >
                            {loading ? "Chargement..." : "Créer un compte"}
                          </Button>
                          
                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-4 bg-white text-gray-500">ou</span>
                            </div>
                          </div>
                          
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-11 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors rounded-xl"
                            disabled={loading}
                            onClick={handleGoogleSignIn}
                          >
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            S'inscrire avec Google
                          </Button>
                          
                          <p className="text-xs text-center text-gray-500 leading-relaxed">
                            En vous inscrivant, vous acceptez nos{" "}
                            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">conditions d'utilisation</a>
                            {" "}et notre{" "}
                            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">politique de confidentialité</a>
                          </p>
                        </form>
                      </TabsContent>
                    </AnimatePresence>
                  </Tabs>
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
        </div>

        {/* Right side - Image */}
        <div className="flex-1 hidden lg:flex items-center justify-center">
          <div className="relative w-full h-[550px] lg:h-[650px] rounded-3xl overflow-hidden shadow-xl">
            <img 
              src={bannerHotels}
              alt="Connexion sécurisée"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-gray-900/60" />
            
            {/* Content overlay on image */}
            <div className="relative z-10 flex flex-col justify-center items-center h-full text-white p-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">
                {activeTab === "signin" ? "Bienvenue" : "Rejoignez-nous"}
              </h2>
              <p className="text-lg text-center text-white/90 max-w-md">
                {activeTab === "signin" 
                  ? "Connectez-vous pour accéder à des milliers de destinations et réserver vos prochains voyages."
                  : "Créez votre compte et découvrez un monde de possibilités de voyage à portée de clic."
                }
              </p>
              
              <div className="mt-8 grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm text-white/70">destinations</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-white/70">sécurisé</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm text-white/70">support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Auth;
