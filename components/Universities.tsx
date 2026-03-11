import React from 'react';
import { GraduationCap, Users, TrendingUp } from 'lucide-react';

const universities = [
  { name: 'Harvard University', stat: '20,000+ students', initial: 'H', color: 'from-red-600 to-pink-600' },
  { name: 'Stanford University', stat: '15,000+ students', initial: 'S', color: 'from-red-600 to-orange-600' },
  { name: 'MIT', stat: '18,000+ students', initial: 'M', color: 'from-gray-700 to-gray-900' },
  { name: 'Oxford University', stat: '25,000+ students', initial: 'O', color: 'from-blue-700 to-blue-900' },
  { name: 'Cambridge University', stat: '22,000+ students', initial: 'C', color: 'from-cyan-600 to-blue-700' },
  { name: 'Yale University', stat: '14,000+ students', initial: 'Y', color: 'from-blue-600 to-indigo-700' },
  { name: 'Princeton University', stat: '12,000+ students', initial: 'P', color: 'from-orange-600 to-orange-800' },
  { name: 'UC Berkeley', stat: '30,000+ students', initial: 'U', color: 'from-blue-600 to-yellow-600' },
];

const Universities = React.memo(function Universities() {
  return (
    <section id="universities" className="w-full bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-[#071026] dark:via-[#0a1435] dark:to-[#071026] py-12 text-gray-900 dark:text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-20 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-20 w-56 h-56 bg-purple-600/10 rounded-full blur-3xl"></div>
      
      <div className="w-full px-6 lg:px-12 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 mb-6 backdrop-blur-sm">
            <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Educational Excellence</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-4xl font-extrabold mb-3">
            Trusted by <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">Leading Universities</span>
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Join hundreds of educational institutions using our platform for accurate assessments.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {universities.map((u, idx) => (
            <div 
              key={u.name} 
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/80 to-gray-100/80 dark:from-[#0b1220]/80 dark:to-[#0f1a2b]/80 border border-gray-200 dark:border-white/10 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-cyan-600/0 group-hover:from-blue-600/10 group-hover:to-cyan-600/10 rounded-2xl transition-all duration-300"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${u.color} flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {u.initial}
                </div>
                <div className="font-bold text-lg mb-2">{u.name}</div>
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <Users className="h-4 w-4" />
                  {u.stat}
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>Active</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default Universities;
