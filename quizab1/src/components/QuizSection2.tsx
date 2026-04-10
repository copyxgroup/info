import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { playClick, playSuccess } from "@/hooks/use-sound";
import nurseImg from "@/assets/nurse.png";

interface QuizSection2Props {
  onComplete: () => void;
}

const questions = [
  {
    id: 1,
    question: "1) Qual é o seu principal objetivo com a receita personalizada?",
    options: [
      "Melhorar a função erétil",
      "Melhorar o controle da ejaculação",
      "Maximizar o desempenho com a minha parceira (aprimorar os 2 itens acima) 👆",
    ],
  },
  {
    id: 2,
    question:
      "2) Qual das opções abaixo melhor descreve o seu problema/incômodo atualmente",
    options: [
      "Dificuldade em ter ereções fortes",
      "Dificuldade em manter a ereção",
      "As duas coisas acima 👆",
      "Prefiro não responder agora",
    ],
  },
  {
    id: 3,
    question: "3) Com que frequência você tem problemas de ereção?",
    options: [
      "Nunca",
      "Raramente",
      "Muitas vezes",
      "O tempo todo",
      "Prefiro não responder",
    ],
  },
  {
    id: 4,
    question: "4) Há quanto tempo você vem tendo problemas de ereção?",
    options: [
      "Menos de 1 ano",
      "Entre 1 a 5 anos",
      "Entre 5 e 10 anos",
      "Há mais de 10 anos",
      "Prefiro não responder",
    ],
  },
  {
    id: 5,
    question: "5) Atualmente, você consegue fazer sexo duas vezes seguidas?",
    options: [
      "Sim, mas preciso me esforçar bastante",
      "Não, não consigo",
      "Às vezes consigo",
      "Prefiro não responder",
    ],
  },
  {
    id: 6,
    question: "6) Com que frequência você tem ereções quando acorda?",
    options: [
      "Nunca",
      "Raramente",
      "Em alguns dias da semana",
      "O tempo todo",
      "Prefiro não responder",
    ],
  },
  {
    id: 7,
    question: "7) Quão rígida é a sua ereção durante a masturbação?",
    subtitle: "Selecione uma nota na escala 0 a 10 abaixo",
    options: ["1-2", "3-4", "5-6", "7-8", "9-10"],
  },
];

const QuizSection2 = ({ onComplete }: QuizSection2Props) => {
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
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Progress bar - RED */}
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
          className="relative max-w-2xl w-full space-y-8"
        >
          {/* Nurse image */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-56 h-56 md:w-72 md:h-72"
            >
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-125" />
              <img
                src={nurseImg}
                alt="Profissional de saúde"
                className="relative w-full h-full object-contain drop-shadow-[0_0_40px_hsl(var(--coral-glow))]"
              />
            </motion.div>
          </div>

          {/* Question header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {currentQ + 1} de {questions.length}
              </span>
            </div>
            <h2 className="font-heading text-xl md:text-2xl font-semibold leading-snug text-foreground">
              {q.question}
            </h2>
            {q.subtitle && (
              <p className="text-sm text-muted-foreground">{q.subtitle}</p>
            )}
          </div>

          {/* Options - RED themed */}
          <div className="space-y-3">
            {q.options.map((option, i) => (
              <motion.button
                key={option}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                onClick={handleAnswer}
                className="w-full text-left px-5 py-4 rounded-xl border border-primary/30 bg-primary/8 hover:bg-primary/18 transition-all group flex items-center justify-between glow-coral"
              >
                <span className="text-sm md:text-base font-medium text-foreground">
                  {option}
                </span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuizSection2;
