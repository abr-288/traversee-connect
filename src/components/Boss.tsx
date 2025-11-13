import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTravelChatbot } from "@/hooks/useTravelChatbot";
import { useToast } from "@/hooks/use-toast";

export const Boss = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { sendMessage, loading } = useTravelChatbot();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: t("boss.welcome") }
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setInput("");

    const reply = await sendMessage(newMessages);
    
    if (reply) {
      setMessages(prev => [...prev, {
        role: "assistant" as const,
        content: reply
      }]);
    } else {
      toast({
        title: "Erreur",
        description: "Impossible d'obtenir une réponse. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
        size="icon"
      >
        <Bot className="h-8 w-8 text-primary-foreground" />
      </Button>

      {/* Fenêtre du chatbot */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[500px] shadow-2xl flex flex-col z-50">
          {/* En-tête */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <h3 className="font-semibold">{t("boss.title")}</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-primary text-white"
                        : "bg-muted"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !loading && handleSend()}
                placeholder={t("boss.placeholder")}
                className="flex-1"
                disabled={loading}
              />
              <Button onClick={handleSend} size="icon" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
