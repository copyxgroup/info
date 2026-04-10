import { Heart } from "lucide-react";

const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 glass-surface py-3 px-6">
    <div className="max-w-5xl mx-auto flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
        <Heart className="w-4 h-4 text-primary" fill="currentColor" />
      </div>
      <span className="font-heading text-sm font-medium tracking-wide text-muted-foreground">
        Portal de Desobstrução Microvascular
      </span>
    </div>
  </header>
);

export default Header;
