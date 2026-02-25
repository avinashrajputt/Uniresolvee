"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { GraduationCap, Menu, X } from 'lucide-react';
// ThemeToggle removed per request (hidden)

const Navbar = React.memo(function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Throttle scroll events for better performance
  const handleScroll = useCallback(() => {
    const sections = ['home', 'universities', 'partners', 'features', 'contact'];
    const scrollPosition = window.scrollY + 100;

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const offsetTop = element.offsetTop;
        const offsetBottom = offsetTop + element.offsetHeight;
        if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
          setActiveSection(section);
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    let throttleTimer: NodeJS.Timeout;
    const throttledScroll = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        handleScroll();
        throttleTimer = null as any;
      }, 100);
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [handleScroll]);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f1729]/95 backdrop-blur-xl border-b border-purple-500/10">
        <div className="w-full px-6 lg:px-12 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/40 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-500/50">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="text-white font-semibold text-xl tracking-tight">UniResolve</div>
            </Link>

            <div className="hidden md:flex gap-1 items-center">
              {[
                { id: 'home', label: 'Home' },
                { id: 'universities', label: 'Universities' },
                { id: 'partners', label: 'Partners' },
                { id: 'features', label: 'Features' },
                { id: 'contact', label: 'Contact' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === item.id
                      ? 'text-white bg-purple-600/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <Link 
                href="/auth/login" 
                className="px-5 py-2 border border-purple-400/30 text-white rounded-lg text-sm font-medium hover:bg-purple-500/10 hover:border-purple-400/50 transition-all duration-200"
              >
                Login
              </Link>
              <Link 
                href="/auth/signup" 
                className="px-5 py-2 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-700 hover:via-purple-600 hover:to-indigo-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40"
              >
                Sign Up
              </Link>
            </div>
            <button 
              className="md:hidden p-2 rounded-lg border border-purple-400/30 text-white hover:bg-purple-500/10 transition-all duration-200" 
              onClick={() => setMobileOpen((s) => !s)} 
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed top-[68px] left-0 right-0 z-40 bg-[#0f1729]/98 backdrop-blur-xl border-b border-purple-500/10 shadow-xl">
          <div className="px-6 py-6 space-y-2">
            {[
              { id: 'home', label: 'Home' },
              { id: 'universities', label: 'Universities' },
              { id: 'partners', label: 'Partners' },
              { id: 'features', label: 'Features' },
              { id: 'contact', label: 'Contact' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full text-left py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeSection === item.id
                    ? 'text-white bg-purple-600/20'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="flex gap-3 pt-4 mt-4 border-t border-white/10">
              <Link 
                href="/auth/login" 
                onClick={() => setMobileOpen(false)}
                className="flex-1 px-4 py-3 border border-purple-400/30 text-white rounded-lg text-center text-sm font-medium hover:bg-purple-500/10 transition-all duration-200"
              >
                Login
              </Link>
              <Link 
                href="/auth/signup" 
                onClick={() => setMobileOpen(false)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white rounded-lg text-center text-sm font-semibold shadow-lg shadow-purple-500/30 transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Spacer no longer needed due to ConditionalLayout handling */}
    </>
  );
});

export default Navbar;
