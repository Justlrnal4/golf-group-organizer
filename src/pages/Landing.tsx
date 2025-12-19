import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

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
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-secondary/5 to-transparent blur-2xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-lg animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <img 
            src={logo} 
            alt="CrewSync Golf - Connect. Coordinate. Play." 
            className="h-40 w-auto drop-shadow-lg"
          />
        </div>

        {/* Headline */}
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-snug mb-6">
          No time to coordinate golf with the crew?
        </h1>
        
        {/* Value proposition */}
        <p className="text-lg text-muted-foreground mb-4 max-w-md mx-auto leading-relaxed">
          Share your availability, see what lines up best with your crew, and let <span className="font-semibold text-foreground">CrewSync</span> handle the rest.
        </p>
        
        <p className="text-base text-muted-foreground mb-12 max-w-sm mx-auto">
          All you have to do is <span className="font-semibold text-primary">show up</span> and catch up. ⛳
        </p>

        {/* Golf Animation Area */}
        <div className="relative h-40 mb-10 flex items-end justify-center">
          {/* Ground/Grass line */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full" />
          
          {/* Tee */}
          <div className="absolute bottom-1 left-1/2 translate-x-2 w-1.5 h-5 bg-gradient-to-b from-amber-100 to-amber-300 rounded-t-full" />
          
          {/* Golf Ball */}
          {showBall && (
            <div 
              className={cn(
                "absolute bottom-6 left-1/2 translate-x-1 w-6 h-6 rounded-full bg-gradient-to-br from-white to-gray-100 shadow-lg border border-gray-200 transition-all duration-500",
                ballFlying && "animate-ball-fly opacity-0"
              )}
            >
              {/* Ball dimples pattern */}
              <div className="absolute inset-0.5 rounded-full opacity-30">
                <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-gray-300" />
                <div className="absolute top-1 right-2 w-1 h-1 rounded-full bg-gray-300" />
                <div className="absolute top-2.5 left-2 w-1 h-1 rounded-full bg-gray-300" />
                <div className="absolute bottom-1.5 left-1.5 w-1 h-1 rounded-full bg-gray-300" />
                <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-gray-300" />
              </div>
            </div>
          )}

          {/* Golf Driver */}
          <div 
            className={cn(
              "absolute bottom-1 left-1/2 origin-bottom transition-transform duration-300 ease-out",
              isSwinging ? "rotate-[85deg] translate-x-6" : "-rotate-[50deg] -translate-x-14"
            )}
            style={{ transformOrigin: "50% 100%" }}
          >
            {/* Club shaft */}
            <div className="relative w-1 h-32">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500 rounded-full" />
              {/* Shaft shine */}
              <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-white/40 to-transparent rounded-full" />
            </div>
            
            {/* Club grip */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-10 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 rounded-t-lg">
              {/* Grip texture lines */}
              <div className="absolute inset-x-0.5 top-1 h-8 opacity-30">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-full h-px bg-gray-500 mb-1" />
                ))}
              </div>
            </div>
            
            {/* Driver Head - Large rounded shape */}
            <div 
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 origin-top"
              style={{ transform: 'translateX(-50%) rotate(45deg)' }}
            >
              {/* Main head body - rounded driver shape */}
              <div className="relative w-10 h-7 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-[50%] shadow-lg">
                {/* Head shine/highlight */}
                <div className="absolute top-1 left-1 w-4 h-2 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
                {/* Face of the club */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-5 bg-gradient-to-r from-gray-600 to-gray-500 rounded-r-sm" />
              </div>
            </div>
          </div>

          {/* Impact effect */}
          {isSwinging && (
            <div className="absolute bottom-6 left-1/2 translate-x-1">
              <div className="w-10 h-10 rounded-full bg-primary/40 animate-ping" />
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