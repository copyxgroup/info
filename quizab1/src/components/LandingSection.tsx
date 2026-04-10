import { motion } from "framer-motion";
import { AlertTriangle, Star } from "lucide-react";
import { playPop } from "@/hooks/use-sound";
import nurseImg from "@/assets/nurse.png";

interface LandingSectionProps {
  onStart: () => void;
}

const ageOptions = ["35–45", "45–55", "55–65", "+65"];

const LandingSection = ({ onStart }: LandingSectionProps) => (
  <motion.section
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-screen flex flex-col items-center px-6 pt-20 pb-12 relative overflow-hidden"
  >
    {/* Background grid */}
    <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: 'linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)',
      backgroundSize: '60px 60px'
    }} />

    {/* Glow orb */}
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />

    <div className="relative max-w-3xl w-full flex flex-col items-center space-y-8 mt-8">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="inline-flex items-center gap-2 glass-surface px-4 py-2 rounded-full"
      >
        <AlertTriangle className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-primary tracking-wider uppercase">Alerta Médico</span>
      </motion.div>

      {/* Nurse illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative w-48 h-48 md:w-64 md:h-64"
      >
        <img
          src={nurseImg}
          alt="Profissional de saúde"
          className="w-full h-full object-contain drop-shadow-[0_0_40px_hsl(var(--coral-glow))]"
        />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-center"
      >
        Suas artérias podem estar bloqueadas por{" "}
        <span className="text-gradient-coral">cristais microscópicos</span> de ácido
      </motion.h1>


      {/* Age quiz block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="w-full max-w-lg space-y-5"
      >
        <h2 className="font-heading text-xl md:text-2xl font-semibold text-center">
          Quantos anos você tem?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {ageOptions.map((age, i) => (
            <motion.button
              key={age}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.08 }}
              onClick={() => { playPop(); onStart(); }}
              className="px-6 py-4 rounded-xl bg-primary/10 border border-primary/30 text-primary font-heading font-semibold text-base hover:bg-primary/20 transition-all glow-coral cursor-pointer"
            >
              {age}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Social proof */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="space-y-4 pt-4"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="text-green-400">✅</span>
            <span className="text-muted-foreground">Aprovado por mais de <span className="text-foreground font-medium">37.000 homens</span> no Brasil</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              ))}
            </span>
            <span className="text-muted-foreground">Avaliado em <span className="text-foreground font-medium">4.9/5</span> estrelas</span>
          </span>
        </div>
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span>✓ 100% Confidencial</span>
          <span>✓ Resultado em 2 min</span>
          <span>✓ Baseado em dados clínicos</span>
        </div>
      </motion.div>
    </div>
  </motion.section>
);

export default LandingSection;
