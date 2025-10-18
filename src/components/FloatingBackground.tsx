import React from 'react';

const FloatingBackground = () => {
  return (
    <div className="floating-background fixed inset-0 z-0">
      {/* Animated floating orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 animate-float blur-xl"></div>
      <div className="absolute bottom-32 left-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-accent/15 to-secondary/15 animate-float delay-2000 blur-2xl"></div>
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-transparent to-surface/60"></div>
    </div>
  );
};

export default FloatingBackground;