import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Smartphone, 
  QrCode, 
  Check, 
  X, 
  Loader2, 
  Copy, 
  AlertTriangle,
  ShieldCheck,
  ShieldOff,
  Trash2
} from "lucide-react";
import { useMFA } from "@/hooks/useMFA";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function TwoFactorAuth() {
  const {
    factors,
    loading,
    enrolling,
    verifying,
    enrollmentData,
    error,
    enrollTOTP,
    verifyAndActivate,
    cancelEnrollment,
    unenrollFactor,
    hasMFAEnabled,
  } = useMFA();

  const [verificationCode, setVerificationCode] = useState("");
  const [showEnrollment, setShowEnrollment] = useState(false);

  const handleStartEnrollment = async () => {
    try {
      await enrollTOTP("Application Authenticator");
      setShowEnrollment(true);
    } catch (err) {
      toast.error("Impossible de démarrer la configuration 2FA");
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Le code doit contenir 6 chiffres");
      return;
    }

    const success = await verifyAndActivate(verificationCode);
    if (success) {
      toast.success("Authentification à deux facteurs activée !");
      setShowEnrollment(false);
      setVerificationCode("");
    }
  };

  const handleCancel = () => {
    cancelEnrollment();
    setShowEnrollment(false);
    setVerificationCode("");
  };

  const handleUnenroll = async (factorId: string) => {
    const success = await unenrollFactor(factorId);
    if (success) {
      toast.success("Authentification à deux facteurs désactivée");
    } else {
      toast.error("Impossible de désactiver le 2FA");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Clé copiée dans le presse-papiers");
  };

  if (loading) {
    return (
      <Card className="backdrop-blur-sm bg-card/80 border-primary/10 shadow-xl">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-card/80 border-primary/10 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Authentification à Deux Facteurs (2FA)
        </CardTitle>
        <CardDescription>
          Renforcez la sécurité de votre compte avec une application d'authentification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center gap-4 ${
            hasMFAEnabled 
              ? "bg-green-500/10 border border-green-500/20" 
              : "bg-yellow-500/10 border border-yellow-500/20"
          }`}
        >
          {hasMFAEnabled ? (
            <>
              <ShieldCheck className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-green-700 dark:text-green-400">2FA Activé</h3>
                <p className="text-sm text-muted-foreground">
                  Votre compte est protégé par l'authentification à deux facteurs
                </p>
              </div>
              <Badge variant="outline" className="ml-auto border-green-500 text-green-600">
                <Check className="h-3 w-3 mr-1" />
                Actif
              </Badge>
            </>
          ) : (
            <>
              <ShieldOff className="h-8 w-8 text-yellow-500" />
              <div>
                <h3 className="font-semibold text-yellow-700 dark:text-yellow-400">2FA Non Activé</h3>
                <p className="text-sm text-muted-foreground">
                  Activez le 2FA pour une sécurité renforcée
                </p>
              </div>
              <Badge variant="outline" className="ml-auto border-yellow-500 text-yellow-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Inactif
              </Badge>
            </>
          )}
        </motion.div>

        {/* Enrolled factors list */}
        {factors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <Label>Méthodes configurées</Label>
            {factors.map((factor) => (
              <div
                key={factor.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{factor.friendly_name || "Application Authenticator"}</p>
                    <p className="text-xs text-muted-foreground">
                      Ajouté le {new Date(factor.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Désactiver le 2FA ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action va désactiver l'authentification à deux facteurs sur votre compte.
                        Vous devrez la reconfigurer pour la réactiver.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleUnenroll(factor.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Désactiver
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </motion.div>
        )}

        {/* Enrollment flow */}
        <AnimatePresence mode="wait">
          {showEnrollment && enrollmentData ? (
            <motion.div
              key="enrollment"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              <Alert>
                <QrCode className="h-4 w-4" />
                <AlertDescription>
                  Scannez le QR code avec votre application d'authentification (Google Authenticator, Authy, etc.)
                </AlertDescription>
              </Alert>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 bg-white rounded-lg shadow-lg"
                >
                  <img
                    src={enrollmentData.qrCode}
                    alt="QR Code pour 2FA"
                    className="w-48 h-48"
                  />
                </motion.div>

                {/* Manual entry secret */}
                <div className="w-full space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Ou entrez cette clé manuellement :
                  </Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                      {enrollmentData.secret}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(enrollmentData.secret)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Verification code input */}
              <div className="space-y-3">
                <Label htmlFor="verification-code">
                  Entrez le code à 6 chiffres de votre application
                </Label>
                <Input
                  id="verification-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    {error}
                  </motion.p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                  disabled={verifying}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleVerify}
                  className="flex-1"
                  disabled={verifying || verificationCode.length !== 6}
                >
                  {verifying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Vérifier et Activer
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="setup-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {!hasMFAEnabled && (
                <Button
                  onClick={handleStartEnrollment}
                  className="w-full"
                  disabled={enrolling}
                >
                  {enrolling ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Smartphone className="mr-2 h-4 w-4" />
                  )}
                  Configurer l'authentification à deux facteurs
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 p-4 bg-muted/30 rounded-lg"
        >
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Pourquoi activer le 2FA ?
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Protection supplémentaire contre les accès non autorisés</li>
            <li>• Sécurisation de vos réservations et données personnelles</li>
            <li>• Alertes en cas de tentative de connexion suspecte</li>
          </ul>
        </motion.div>
      </CardContent>
    </Card>
  );
}
