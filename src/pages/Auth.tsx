import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Plane, Shield, Lock, Mail, User, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      className="space-y-2"
    >
      <Label htmlFor={name} className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {label}
      </Label>
      <div className="relative">
        <motion.div
          animate={{
            boxShadow: isFocused 
              ? "0 0 0 3px hsl(var(--primary) / 0.2)" 
              : "0 0 0 0px transparent"
          }}
          className="rounded-lg overflow-hidden"
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
            className={`transition-all duration-300 pr-10 ${
              error 
                ? "border-destructive focus:ring-destructive" 
                : isFocused 
                  ? "border-primary" 
                  : ""
            }`}
          />
        </motion.div>
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <motion.div
              initial={false}
              animate={{ rotate: showPassword ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </motion.div>
          </button>
        )}
      </div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="text-xs text-destructive flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowUpdatePassword(true);
      }
      if (event === 'SIGNED_IN' && session) {
        navigate("/");
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
  const strengthLabels = ["Très faible", "Faible", "Moyen", "Fort", "Très fort"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/80 to-secondary relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [-2, 2, -2] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [10, -10, 10], rotate: [2, -2, 2] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"
        />
        
        {/* Floating icons */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/10"
            style={{
              top: `${15 + i * 15}%`,
              left: `${10 + i * 15}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            <Plane className="w-8 h-8" />
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative z-10 w-full max-w-md"
      >
        <Card className="backdrop-blur-xl bg-background/95 border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <motion.div 
              className="flex justify-center mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div 
                className="bg-gradient-to-br from-primary to-secondary p-4 rounded-2xl shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plane className="h-10 w-10 text-primary-foreground" />
              </motion.div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                B-Reserve
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-base">
                Votre agence de voyage de confiance
              </CardDescription>
            </motion.div>
            
            {/* Security badge */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground"
            >
              <Shield className="h-3 w-3 text-green-500" />
              <span>Connexion sécurisée SSL</span>
              <Lock className="h-3 w-3 text-green-500" />
            </motion.div>
          </CardHeader>
          
          <CardContent className="pt-4">
            <AnimatePresence mode="wait">
              {showUpdatePassword ? (
                <motion.div
                  key="update-password"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <AnimatedFormField
                      label="Nouveau mot de passe"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      icon={<Lock className="h-4 w-4 text-primary" />}
                      error={updateErrors.password}
                      value={updateForm.password}
                      onChange={(value) => setUpdateForm({ ...updateForm, password: value })}
                      showPasswordToggle
                    />
                    <AnimatedFormField
                      label="Confirmer le mot de passe"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      icon={<Lock className="h-4 w-4 text-primary" />}
                      error={updateErrors.confirmPassword}
                      value={updateForm.confirmPassword}
                      onChange={(value) => setUpdateForm({ ...updateForm, confirmPassword: value })}
                      showPasswordToggle
                    />
                    <motion.div variants={itemVariants}>
                      <Button 
                        type="submit" 
                        className="w-full gradient-primary" 
                        disabled={loading}
                      >
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            ⏳
                          </motion.div>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mettre à jour le mot de passe
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              ) : showResetPassword ? (
                <motion.div
                  key="reset-password"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4"
                >
                  <motion.div variants={itemVariants}>
                    <Button
                      variant="ghost"
                      onClick={() => setShowResetPassword(false)}
                      className="mb-2 hover:bg-primary/10"
                    >
                      ← Retour à la connexion
                    </Button>
                  </motion.div>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <AnimatedFormField
                      label="Email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      icon={<Mail className="h-4 w-4 text-primary" />}
                      error={resetErrors.email}
                      value={resetForm.email}
                      onChange={(value) => setResetForm({ email: value })}
                    />
                    <motion.div variants={itemVariants}>
                      <Button 
                        type="submit" 
                        className="w-full gradient-primary" 
                        disabled={loading}
                      >
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            ⏳
                          </motion.div>
                        ) : (
                          "Réinitialiser le mot de passe"
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="main-form"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <motion.div variants={itemVariants}>
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger 
                          value="signin"
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                        >
                          Connexion
                        </TabsTrigger>
                        <TabsTrigger 
                          value="signup"
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                        >
                          Inscription
                        </TabsTrigger>
                      </TabsList>
                    </motion.div>

                    <AnimatePresence mode="wait">
                      <TabsContent value="signin" className="mt-0">
                        <motion.form 
                          onSubmit={handleSignIn} 
                          className="space-y-4"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <AnimatedFormField
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="votre@email.com"
                            icon={<Mail className="h-4 w-4 text-primary" />}
                            error={signInErrors.email}
                            value={signInForm.email}
                            onChange={(value) => setSignInForm({ ...signInForm, email: value })}
                          />
                          <AnimatedFormField
                            label="Mot de passe"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            icon={<Lock className="h-4 w-4 text-primary" />}
                            error={signInErrors.password}
                            value={signInForm.password}
                            onChange={(value) => setSignInForm({ ...signInForm, password: value })}
                            showPasswordToggle
                          />
                          <motion.div variants={itemVariants}>
                            <Button 
                              type="submit" 
                              className="w-full gradient-primary h-12 text-base font-semibold" 
                              disabled={loading}
                            >
                              {loading ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="mr-2"
                                >
                                  ⏳
                                </motion.div>
                              ) : (
                                <motion.span
                                  className="flex items-center justify-center gap-2"
                                  whileHover={{ scale: 1.02 }}
                                >
                                  Se connecter
                                </motion.span>
                              )}
                            </Button>
                          </motion.div>
                          <motion.button
                            variants={itemVariants}
                            type="button"
                            onClick={() => setShowResetPassword(true)}
                            className="w-full text-sm text-muted-foreground hover:text-primary transition-colors py-2"
                            whileHover={{ scale: 1.02 }}
                          >
                            Mot de passe oublié ?
                          </motion.button>
                        </motion.form>
                      </TabsContent>

                      <TabsContent value="signup" className="mt-0">
                        <motion.form 
                          onSubmit={handleSignUp} 
                          className="space-y-4"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <AnimatedFormField
                            label="Nom complet"
                            name="fullName"
                            type="text"
                            placeholder="Jean Dupont"
                            icon={<User className="h-4 w-4 text-primary" />}
                            error={signUpErrors.fullName}
                            value={signUpForm.fullName}
                            onChange={(value) => setSignUpForm({ ...signUpForm, fullName: value })}
                          />
                          <AnimatedFormField
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="votre@email.com"
                            icon={<Mail className="h-4 w-4 text-primary" />}
                            error={signUpErrors.email}
                            value={signUpForm.email}
                            onChange={(value) => setSignUpForm({ ...signUpForm, email: value })}
                          />
                          <AnimatedFormField
                            label="Mot de passe"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            icon={<Lock className="h-4 w-4 text-primary" />}
                            error={signUpErrors.password}
                            value={signUpForm.password}
                            onChange={(value) => setSignUpForm({ ...signUpForm, password: value })}
                            showPasswordToggle
                          />
                          
                          {/* Password strength indicator */}
                          {signUpForm.password && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="space-y-2"
                            >
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                                      i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-muted"
                                    }`}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Force: {strengthLabels[passwordStrength - 1] || "Très faible"}
                              </p>
                            </motion.div>
                          )}
                          
                          <motion.div variants={itemVariants}>
                            <Button 
                              type="submit" 
                              className="w-full gradient-primary h-12 text-base font-semibold" 
                              disabled={loading}
                            >
                              {loading ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="mr-2"
                                >
                                  ⏳
                                </motion.div>
                              ) : (
                                <motion.span
                                  className="flex items-center justify-center gap-2"
                                  whileHover={{ scale: 1.02 }}
                                >
                                  Créer mon compte
                                </motion.span>
                              )}
                            </Button>
                          </motion.div>
                          
                          <motion.p 
                            variants={itemVariants}
                            className="text-xs text-center text-muted-foreground"
                          >
                            En vous inscrivant, vous acceptez nos{" "}
                            <a href="#" className="text-primary hover:underline">conditions d'utilisation</a>
                            {" "}et notre{" "}
                            <a href="#" className="text-primary hover:underline">politique de confidentialité</a>
                          </motion.p>
                        </motion.form>
                      </TabsContent>
                    </AnimatePresence>
                  </Tabs>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
        
        {/* Bottom decoration */}
        <motion.div 
          className="text-center mt-6 text-white/60 text-sm"
          variants={itemVariants}
        >
          © 2024 B-Reserve. Tous droits réservés.
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
