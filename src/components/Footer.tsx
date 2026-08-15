import React from 'react';
import { ThemeConfig } from '../types';

interface FooterProps {
  theme: ThemeConfig;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="w-full border-t border-zinc-900 bg-[#050505] mt-auto relative select-none">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 p-6 sm:p-8">
        {/* Left Metric: Temperature */}
        <div className="flex flex-col justify-center space-y-1.5 sm:border-r border-zinc-900 sm:pr-8">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">
            Temperature
          </span>
          <span className="text-xl sm:text-2xl font-light text-zinc-300 font-sans">
            24°C <span className="text-zinc-600">/</span> 75°F
          </span>
        </div>

        {/* Center Metric: Atmospheric Pressure */}
        <div className="flex flex-col justify-center sm:items-center space-y-1.5 sm:border-r border-zinc-900 sm:px-6">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">
            Atmospheric Pressure
          </span>
          <span className="text-xl sm:text-2xl font-light text-zinc-300 font-sans">
            1013.2 hPa
          </span>
        </div>

        {/* Right Section: Legal Trademark Notice */}
        <div className="flex flex-col justify-center sm:items-end space-y-1 sm:pl-8">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-0.5">
            Legal Notice
          </span>
          <p className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-[0.15em] sm:text-right max-w-[280px] leading-relaxed">
            Registered Trademark 2026<br />Made by Arpan Goswami
          </p>
        </div>
      </div>

      {/* Bottom subtle accent line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent opacity-40"></div>
    </footer>
  );
};
