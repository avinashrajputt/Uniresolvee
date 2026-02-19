import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#071026] text-white mt-16 border-t border-[#0f1724]/50">
      <div className="w-full px-22 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#6d5df6] to-[#3b82f6] flex items-center justify-center font-bold">AI</div>
              <div>
                <div className="font-semibold text-lg">UniResolve</div>
                <div className="text-sm text-muted">AI-powered assessment for universities</div>
              </div>
            </div>
            <p className="text-sm text-muted max-w-sm">Trusted by leading institutions to deliver accurate, fair, and fast grading at scale.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#universities" className="hover:text-white">Universities</a></li>
              <li><a href="#partners" className="hover:text-white">Partners</a></li>
              <li><a href="#about" className="hover:text-white">About</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="#" className="hover:text-white">Terms</a></li>
              <li><a href="#" className="hover:text-white">Privacy</a></li>
              <li><a href="#contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[#0b1420]/40 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted">© {new Date().getFullYear()} UniResolve — All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-muted hover:text-white">LinkedIn</a>
            <a href="#" className="text-sm text-muted hover:text-white">Twitter</a>
            <a href="#" className="text-sm text-muted hover:text-white">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
