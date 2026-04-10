import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle } from "lucide-react";

interface ProcessingSectionProps {
  onComplete: () => void;
}

const steps = [
  { text: "Cruzando histórico de exposição a cristais com faixa etária...", duration: 2500 },
  { text: "Analisando nível de obstrução das artérias cavernosas...", duration: 3000 },
  { text: "Calculando dosagem personalizada do Truque do Bicarbonato...", duration: 2500 },
  { text: "ALERTA: Nível de obstrução crítica detectado. Gerando vídeo de protocolo...", duration: 3000, isAlert: true },
];

const ProcessingSection = ({ onComplete }: ProcessingSectionProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep >= steps.length) {
      onComplete();
      return;
    }

    const stepDuration = steps[currentStep].duration;
    const targetProgress = ((currentStep + 1) / steps.length) * 100;
    const startProgress = (currentStep / steps.length) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (targetProgress - startProgress) / (stepDuration / 50);
        return Math.min(next, targetProgress);
      });
    }, 50);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setCurrentStep((prev) => prev + 1);
    }, stepDuration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [currentStep, onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-px bg-primary/20 scan-line" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full space-y-10 text-center"
      >
        {/* Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="mx-auto w-16 h-16 rounded-full border-2 border-primary/30 border-t-primary flex items-center justify-center"
        >
          <Shield className="w-6 h-6 text-primary" />
        </motion.div>

        <div className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">Processando Diagnóstico</h2>
          <p className="text-sm text-muted-foreground">Aguarde enquanto analisamos seus dados clínicos</p>
        </div>

        {/* Progress bar */}
        <div className="space-y-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
        </div>

        {/* Step texts */}
        <div className="min-h-[60px] flex items-center justify-center">
          {currentStep < steps.length && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-center gap-2 text-sm ${
                steps[currentStep].isAlert ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {steps[currentStep].isAlert && <AlertTriangle className="w-4 h-4" />}
              {steps[currentStep].text}
            </motion.div>
          )}
        </div>

        {/* Fake data points */}
        <div className="grid grid-cols-3 gap-4">
          {["Artérias", "Fluxo", "Cristais"].map((label, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.3 }}
              className="glass-surface rounded-lg p-3 space-y-1"
            >
              <span className="text-xs text-muted-foreground">{label}</span>
              <motion.span
                className="block font-heading text-lg font-bold text-primary"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {["87%", "42%", "HIGH"][i]}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ProcessingSection;
