import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { playClick, playSuccess } from "@/hooks/use-sound";

interface QuizSectionProps {
  onComplete: () => void;
}

const questions = [
  {
    id: 1,
    tag: "Acúmulo",
    question: "Qual sua faixa etária?",
    subtitle: "Isso determina há quantos anos os cristais ácidos estão se acumulando",
    options: ["18-35 anos", "36-50 anos", "51-65 anos", "66+ anos"],
  },
  {
    id: 2,
    tag: "Sintoma",
    question: "Com que frequência você sente que seu pênis fica 'murcho, mole ou enrugado' no momento da relação?",
    options: ["Nunca", "Às vezes", "Frequentemente", "Sempre"],
  },
  {
    id: 3,
    tag: "Resistência",
    question: "Sente que medicamentos como Viagra ou Tadalafila estão parando de funcionar ou causando fortes dores?",
    options: ["Nunca usei", "Uso mas tenho medo", "Sinto que perdem o efeito"],
  },
  {
    id: 4,
    tag: "Toxicidade",
    question: "Com que frequência você consome refrigerantes, alimentos processados ou água em garrafas plásticas?",
    options: ["Raramente", "3-4x por semana", "Todos os dias"],
  },
  {
    id: 5,
    tag: "Indicador",
    question: "Você ainda acorda com a 'ereção matinal' potente ou ela desapareceu nos últimos meses?",
    options: ["Sim, ainda tenho", "Poucas vezes", "Desapareceu completamente"],
  },
  {
    id: 6,
    tag: "Impacto",
    question: "Você sente que sua parceira está decepcionada ou 'fingindo' que não se importa com a sua falta de rigidez?",
    options: ["Vida íntima ótima", "Sinto ela fria", "Tenho pavor de traição"],
  },
  {
    id: 7,
    tag: "Compromisso",
    question: "Se o Dr. Marcelo revelasse uma receita de 30s com bicarbonato para dissolver esses cristais hoje, você a seguiria?",
    options: ["SIM! QUERO LIMPAR MINHAS ARTÉRIAS AGORA"],
    isFinal: true,
  },
];

const QuizSection = ({ onComplete }: QuizSectionProps) => {
  const [currentQ, setCurrentQ] = useState(0);

  const handleAnswer = () => {
    if (currentQ < questions.length - 1) {
      playClick();
      setCurrentQ((prev) => prev + 1);
    } else {
      playSuccess();
      onComplete();
    }
  };

  const q = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12 relative">
      {/* Progress bar */}
      <div className="fixed top-14 left-0 right-0 h-1 bg-muted z-40">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl w-full space-y-8"
        >
          {/* Question header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-primary tracking-wider uppercase glass-surface px-3 py-1 rounded-full">
                {q.tag}
              </span>
              <span className="text-xs text-muted-foreground">
                {currentQ + 1} de {questions.length}
              </span>
            </div>
            <h2 className="font-heading text-xl md:text-2xl font-semibold leading-snug">
              {q.question}
            </h2>
            {q.subtitle && (
              <p className="text-sm text-muted-foreground">{q.subtitle}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((option, i) => (
              <motion.button
                key={option}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                onClick={handleAnswer}
                className={`w-full text-left px-5 py-4 rounded-xl glass-surface hover:bg-[hsl(var(--surface-glass-hover))] transition-all group flex items-center justify-between ${
                  q.isFinal
                    ? "bg-primary/10 border-primary/30 hover:bg-primary/20"
                    : ""
                }`}
              >
                <span className={`text-sm md:text-base font-medium ${q.isFinal ? "text-primary" : ""}`}>
                  {option}
                </span>
                <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${q.isFinal ? "text-primary" : "text-muted-foreground"}`} />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuizSection;
