import React, { useMemo } from 'react';
import { GraduationCap, Sparkles, Linkedin, Twitter, Github, Mail, ExternalLink, Heart } from 'lucide-react';

const Footer = React.memo(function Footer() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="w-full bg-gradient-to-b from-[#071026] via-[#0a1435] to-[#0f1729] text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-20 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-20 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/50">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div>
                <div className="font-semibold text-2xl text-white">
                  UniResolve
                </div>
                <div className="text-xs text-purple-300 flex items-center gap-1 mt-0.5">
                  <Sparkles className="h-3 w-3" />
                  AI-powered assessment platform
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm mb-6">
              Trusted by leading institutions to deliver accurate, fair, and fast grading at scale. Transform your assessment process with cutting-edge AI technology.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a 
                href="https://linkedin.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center h-10 w-10 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-600/20 transition-all duration-200"
              >
                <Linkedin className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center h-10 w-10 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-600/20 transition-all duration-200"
              >
                <Twitter className="h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
              </a>
              <a 
                href="https://github.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center h-10 w-10 rounded-lg bg-white/5 border border-white/10 hover:border-gray-500/50 hover:bg-gray-600/20 transition-all duration-200"
              >
                <Github className="h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-colors" />
              </a>
              <a 
                href="mailto:contact@uniresolve.com" 
                className="group flex items-center justify-center h-10 w-10 rounded-lg bg-white/5 border border-white/10 hover:border-pink-500/50 hover:bg-pink-600/20 transition-all duration-200"
              >
                <Mail className="h-5 w-5 text-gray-400 group-hover:text-pink-400 transition-colors" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="md:col-span-3">
            <h4 className="font-semibold text-base mb-4 text-white">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-200 inline-block">
                  Features
                </a>
              </li>
              <li>
                <a href="#universities" className="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-200 inline-block">
                  Universities
                </a>
              </li>
              <li>
                <a href="#partners" className="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-200 inline-block">
                  Partners
                </a>
              </li>
              <li>
                <a href="#about" className="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-200 inline-block">
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="md:col-span-4">
            <h4 className="font-semibold text-base mb-4 text-white">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#terms" className="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-200 inline-block">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-200 inline-block">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-200 inline-block">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            © {currentYear} <span className="text-purple-400 font-semibold">UniResolve</span> — All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Built with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            <span>for educators worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
