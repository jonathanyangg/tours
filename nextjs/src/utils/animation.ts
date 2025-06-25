/**
 * Animation and transition utilities for consistent UI interactions
 * 
 * This file contains predefined animation variants for Framer Motion
 * and utility functions for creating smooth transitions throughout the app.
 */

export const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: 10,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

export const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const scaleUp = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: { 
    scale: 0.95, 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

export const slideInFromRight = {
  hidden: { x: 20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: { 
    x: 20, 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const slideInFromLeft = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: { 
    x: -20, 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

// Hover animations for cards and interactive elements
export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.2 }
};

export const hoverSpring = {
  scale: 1.03,
  transition: { 
    type: "spring", 
    stiffness: 400, 
    damping: 10 
  }
};

// Button press animation
export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1 }
};

// Text appear animations for sequential reveal
export const textReveal = {
  hidden: { opacity: 0, y: 10 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: custom * 0.1,
      duration: 0.4, 
      ease: [0.16, 1, 0.3, 1]
    }
  })
};

// CSS utilities for common animation classes
export const cssAnimationClasses = {
  // Fade animations
  fadeIn: 'animate-fadeIn',
  slideIn: 'animate-slideIn',
  
  // Hover effects
  hoverGrow: 'hover:scale-105 transition-transform duration-200',
  hoverShrink: 'hover:scale-95 transition-transform duration-200',
  
  // Transitions
  smoothTransition: 'transition-all duration-300 ease-out',
  fastTransition: 'transition-all duration-150 ease-in-out',
  
  // Button press
  pressEffect: 'active:scale-95 transition-transform duration-75',
  
  // Focus states
  focusRing: 'focus:ring-2 focus:ring-primary/50 focus:outline-none',
};

const animations = {
  fadeInUp,
  staggerChildren,
  scaleUp,
  fadeIn,
  slideInFromRight,
  slideInFromLeft,
  hoverScale,
  hoverSpring,
  buttonTap,
  textReveal,
  cssAnimationClasses
};

export default animations; 