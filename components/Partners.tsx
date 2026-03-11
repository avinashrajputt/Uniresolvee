import React from 'react';
import { Award, CheckCircle2, Briefcase } from 'lucide-react';

const partners = [
  { name: 'ETS (Educational Testing Service)', icon: 'E', color: 'from-green-600 to-emerald-600' },
  { name: 'Cambridge Assessment', icon: 'C', color: 'from-blue-600 to-cyan-600' },
  { name: 'Pearson VUE', icon: 'P', color: 'from-purple-600 to-pink-600' },
  { name: 'ACT', icon: 'A', color: 'from-orange-600 to-red-600' },
  { name: 'College Board', icon: 'CB', color: 'from-indigo-600 to-blue-600' },
  { name: 'British Council', icon: 'BC', color: 'from-red-600 to-pink-600' },
];

const Partners = React.memo(function Partners() {
  return (
    <section id="partners" className="w-full bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-[#071026] dark:via-[#0a1435] dark:to-[#071026] text-gray-900 dark:text-white py-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-green-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-purple-600/10 rounded-full blur-3xl"></div>
      
      <div className="w-full px-6 lg:px-12 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 mb-6 backdrop-blur-sm">
            <Briefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Strategic Partnerships</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-4xl font-extrabold mb-3">
            Partnered with <span className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">Leading Exam Bodies</span>
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Trusted by major testing organizations worldwide for reliable assessment solutions</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((p, idx) => (
            <div 
              key={p.name} 
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/80 to-gray-100/80 dark:from-[#0b1220]/80 dark:to-[#0f1a2b]/80 border border-gray-200 dark:border-white/10 backdrop-blur-sm hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/0 to-emerald-600/0 group-hover:from-green-600/10 group-hover:to-emerald-600/10 rounded-2xl transition-all duration-300"></div>
              
              <div className="relative z-10 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {p.icon}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg mb-1">{p.name}</div>
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Professional Partnership</span>
                  </div>
                </div>
                <Award className="h-8 w-8 text-yellow-500/30 group-hover:text-yellow-500/60 transition-colors duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default Partners;
