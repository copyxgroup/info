import { useState } from "react";
import Header from "@/components/Header";
import LandingSection from "@/components/LandingSection";
import ProcessingSection from "@/components/ProcessingSection";
import ResultSection from "@/components/ResultSection";
import QuizSection2 from "@/components/QuizSection2";
import Vsl2Section from "@/components/Vsl2Section";

type Stage = "landing" | "result" | "quiz2" | "processing" | "vsl2";

const Index = () => {
  const [stage, setStage] = useState<Stage>("landing");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {stage === "landing" && <LandingSection onStart={() => setStage("result")} />}
      {stage === "result" && <ResultSection onStartQuiz2={() => setStage("quiz2")} />}
      {stage === "quiz2" && <QuizSection2 onComplete={() => setStage("processing")} />}
      {stage === "processing" && <ProcessingSection onComplete={() => setStage("vsl2")} />}
      {stage === "vsl2" && <Vsl2Section />}
    </div>
  );
};

export default Index;
