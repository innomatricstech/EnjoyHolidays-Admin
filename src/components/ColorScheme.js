export const colorScheme = {
  // Primary colors matching sidebar
  primary: {
    from: 'from-yellow-500',
    via: 'via-orange-400',
    to: 'to-orange-500',
    gradient: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    gradientHover: 'hover:from-yellow-600 hover:to-orange-600',
    text: 'text-yellow-400',
    bg: 'bg-yellow-500',
  },
  
  // Secondary colors
  secondary: {
    from: 'from-slate-800',
    to: 'to-slate-900',
    gradient: 'bg-gradient-to-r from-slate-800 to-slate-900',
    gradientHover: 'hover:from-slate-700 hover:to-slate-800',
  },
  
  // Success colors
  success: {
    gradient: 'bg-gradient-to-r from-emerald-500 to-green-500',
    gradientHover: 'hover:from-emerald-600 hover:to-green-600',
  },
  
  // Button styles
  buttons: {
    primary: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-300',
    secondary: 'bg-gradient-to-r from-slate-800 to-slate-900 text-white font-medium hover:from-slate-700 hover:to-slate-800 transition-all duration-300 border border-white/10',
    success: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300',
  }
};