import { motion } from "framer-motion";
import { useEffect } from "react";

const Vsl2Section = () => {
  useEffect(() => {
    const s = document.createElement("script");
    s.src =
      "https://scripts.converteai.net/27d65a4a-43f3-4eda-8975-c299df6e2f47/players/69bf0f86891545b57a9bf2d7/v4/player.js";
    s.async = true;
    document.head.appendChild(s);

    return () => {
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
        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold leading-tight text-center"
        >
          <span className="text-gradient-coral">
            Parabéns! Conseguimos analisar o seu caso.
          </span>
          <br />
          <span className="text-foreground text-xl md:text-3xl lg:text-4xl">
            Veja como receber a sua receita personalizada:
          </span>
        </motion.h1>

        {/* VTurb video player */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full rounded-2xl overflow-hidden border border-primary/30 glow-coral"
        >
          <div
            dangerouslySetInnerHTML={{
              __html: `<vturb-smartplayer id="vid-69bf0f86891545b57a9bf2d7" style="display:block;margin:0 auto;width:100%;"></vturb-smartplayer>`,
            }}
          />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Vsl2Section;
