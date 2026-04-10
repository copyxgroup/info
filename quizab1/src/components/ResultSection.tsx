import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface ResultSectionProps {
  onStartQuiz2: () => void;
}

const ResultSection = ({ onStartQuiz2 }: ResultSectionProps) => {
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Load VTurb player script
    const s = document.createElement("script");
    s.src =
      "https://scripts.converteai.net/27d65a4a-43f3-4eda-8975-c299df6e2f47/players/69bf0f61596c6131b73ecf4e/v4/player.js";
    s.async = true;
    document.head.appendChild(s);

    // CTA delay script
    const videoId = "vid-69bf0f61596c6131b73ecf4e";
    let buttonShown = false;

    function showButton() {
      if (ctaRef.current) {
        ctaRef.current.style.display = "block";
        buttonShown = true;
        localStorage.setItem("ctaShown_" + videoId, "true");
      }
    }

    function checkTime() {
      if (buttonShown) return;
      const sp = (window as any).smartplayer;
      if (sp?.instances?.[0]) {
        const currentTime = sp.instances[0].video.currentTime;
        if (currentTime >= 443) showButton();
      }
    }

    if (localStorage.getItem("ctaShown_" + videoId) === "true") {
      // Small delay to ensure ref is ready
      setTimeout(showButton, 100);
    }

    const intervalId = setInterval(checkTime, 500);

    return () => {
      clearInterval(intervalId);
      try {
        document.head.removeChild(s);
      } catch (_) {}
    };
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center px-4 pt-24 pb-16 relative"
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="relative max-w-3xl w-full flex flex-col items-center space-y-8">
        {/* Top highlight badge */}

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-body text-2xl md:text-4xl lg:text-5xl font-bold leading-relaxed text-center text-foreground"
        >
          <span className="block">Descubra como receber a sua</span>
          <span className="block underline decoration-primary/60 decoration-2 underline-offset-4">receita personalizada para</span>
          <span className="relative inline-block mt-2">
            <span className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-125" />
            <span className="relative text-primary font-extrabold drop-shadow-[0_0_20px_hsl(var(--coral-glow))]">
              levantar o "amigão" ainda hoje
            </span>
          </span>
        </motion.h1>

        {/* VTurb video player */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full rounded-2xl overflow-hidden border border-primary/30 glow-coral"
        >
          <div
            dangerouslySetInnerHTML={{
              __html: `<vturb-smartplayer id="vid-69bf0f61596c6131b73ecf4e" style="display:block;margin:0 auto;width:100%;"></vturb-smartplayer>`,
            }}
          />
        </motion.div>

        {/* CTA Button - hidden until 7:23 in the video */}
        <button
          ref={ctaRef as any}
          id="cta-button-vsl"
          onClick={onStartQuiz2}
          style={{ display: "none" }}
          className="w-full max-w-md py-4 px-8 rounded-xl font-heading font-bold text-sm md:text-base uppercase tracking-wider text-center text-primary-foreground bg-gradient-to-r from-primary to-[hsl(10,100%,60%)] glow-coral pulse-glow transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          RESPONDER QUESTIONÁRIO RÁPIDO
        </button>
      </div>
    </motion.section>
  );
};

export default ResultSection;
