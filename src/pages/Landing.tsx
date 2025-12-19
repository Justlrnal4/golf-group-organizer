import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Landing = () => {
  const navigate = useNavigate();
  const [isSwinging, setIsSwinging] = useState(false);
  const [showBall, setShowBall] = useState(true);
  const [ballFlying, setBallFlying] = useState(false);

  const handleLetsGo = () => {
    setIsSwinging(true);
    
    // Ball flies after the swing connects
    setTimeout(() => {
      setBallFlying(true);
    }, 400);

    // Hide ball after it flies away
    setTimeout(() => {
      setShowBall(false);
    }, 900);

    // Navigate after animation completes
    setTimeout(() => {
      navigate("/create");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-primary/5 to-transparent blur-2xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl gradient-hero shadow-elevated">
            <Flag className="h-7 w-7 text-primary-foreground" />
            <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl opacity-60" />
          </div>
          <span className="font-display text-3xl font-bold text-foreground tracking-tight">
            CrewSync Golf
          </span>
        </div>

        {/* Tagline */}
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight leading-tight mb-4">
          Golf plans,{" "}
          <span className="text-gradient">sorted.</span>
        </h1>
        
        <p className="text-lg text-muted-foreground mb-12 max-w-sm mx-auto">
          Find the perfect tee time for your crew. Everyone votes, AI picks the best course.
        </p>

        {/* Golf Animation Area */}
        <div className="relative h-32 mb-10 flex items-end justify-center">
          {/* Tee */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-4 bg-amber-200 rounded-t-sm" />
          
          {/* Golf Ball */}
          {showBall && (
            <div 
              className={cn(
                "absolute bottom-4 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white shadow-lg border border-gray-200 transition-all duration-500",
                ballFlying && "animate-ball-fly opacity-0"
              )}
            >
              {/* Ball dimples */}
              <div className="absolute inset-1 rounded-full border border-gray-100" />
            </div>
          )}

          {/* Golf Club */}
          <div 
            className={cn(
              "absolute bottom-0 left-1/2 origin-bottom transition-transform duration-300 ease-out",
              isSwinging ? "rotate-[80deg] translate-x-8" : "-rotate-45 -translate-x-16"
            )}
            style={{ transformOrigin: "50% 100%" }}
          >
            {/* Club shaft */}
            <div className="w-1.5 h-28 bg-gradient-to-b from-gray-600 to-gray-400 rounded-t-sm" />
            {/* Club head */}
            <div className="absolute -bottom-1 -right-4 w-8 h-4 bg-gradient-to-r from-gray-700 to-gray-500 rounded-sm transform -rotate-12 shadow-md" />
            {/* Club grip */}
            <div className="absolute -top-1 left-0 w-1.5 h-8 bg-gray-800 rounded-t-md" />
          </div>

          {/* Impact effect */}
          {isSwinging && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="w-8 h-8 rounded-full bg-primary/30 animate-ping" />
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Button
          variant="hero"
          size="xl"
          onClick={handleLetsGo}
          disabled={isSwinging}
          className={cn(
            "px-12 text-lg font-bold transition-all duration-300",
            isSwinging && "scale-95 opacity-80"
          )}
        >
          {isSwinging ? (
            <span className="animate-pulse">Fore! 🏌️</span>
          ) : (
            "Let's Go!"
          )}
        </Button>

        {/* Subtitle */}
        <p className="mt-6 text-sm text-muted-foreground">
          No signup required • Free to use
        </p>
      </div>

      {/* Flying ball trail effect */}
      {ballFlying && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          <div className="absolute bottom-1/2 left-1/2 w-4 h-4 rounded-full bg-white shadow-lg animate-ball-fly-screen" />
        </div>
      )}
    </div>
  );
};

export default Landing;