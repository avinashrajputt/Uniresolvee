import React from 'react'
import { Brain, CheckCircle, FileStack, GitMerge, Scale, BookOpen, Upload, BookMarked, Shield, Zap } from 'lucide-react'

const features = [
  { 
    title: 'AI-based handwriting & equation recognition', 
    icon: Brain,
    color: 'from-purple-600 to-pink-600',
    description: 'Advanced OCR technology'
  },
  { 
    title: 'Automated subjective & MCQ evaluation', 
    icon: CheckCircle,
    color: 'from-blue-600 to-cyan-600',
    description: 'Quick and accurate grading'
  },
  { 
    title: 'Multi-sheet upload & processing', 
    icon: FileStack,
    color: 'from-green-600 to-emerald-600',
    description: 'Batch processing support'
  },
  { 
    title: 'Auto question–answer mapping', 
    icon: GitMerge,
    color: 'from-orange-600 to-red-600',
    description: 'Smart content alignment'
  },
  { 
    title: 'Bias-free AI scoring', 
    icon: Scale,
    color: 'from-indigo-600 to-purple-600',
    description: 'Fair and consistent results'
  },
  { 
    title: 'Question bank with difficulty tags', 
    icon: BookOpen,
    color: 'from-pink-600 to-rose-600',
    description: 'Organized test library'
  },
  { 
    title: 'Study material & syllabus upload', 
    icon: Upload,
    color: 'from-cyan-600 to-blue-600',
    description: 'Comprehensive resources'
  },
  { 
    title: 'E-book integration', 
    icon: BookMarked,
    color: 'from-yellow-600 to-orange-600',
    description: 'Digital learning materials'
  },
  { 
    title: 'Role-based access control', 
    icon: Shield,
    color: 'from-red-600 to-pink-600',
    description: 'Secure permissions system'
  },
];

const Features = React.memo(function Features() {
  return (
    <section id="features" className="w-full text-white bg-gradient-to-b from-[#071026] via-[#0a1435] to-[#071026] py-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-56 h-56 bg-purple-600/10 rounded-full blur-3xl"></div>
      
      <div className="w-full px-6 lg:px-12 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 mb-6 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">Powerful Features</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-4xl font-extrabold mb-3">
            Everything You <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Need</span>
          </h2>
          <p className="text-base text-gray-300 max-w-2xl mx-auto">Comprehensive tools and capabilities to streamline your assessment workflow</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const IconComponent = f.icon;
            return (
              <div 
                key={f.title} 
                className="group relative p-6 rounded-2xl bg-gradient-to-br from-[#0b1220]/80 to-[#0f1a2b]/80 border border-white/10 backdrop-blur-sm hover:border-indigo-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-purple-600/0 group-hover:from-indigo-600/10 group-hover:to-purple-600/10 rounded-2xl transition-all duration-300"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg mb-2">{f.title}</div>
                    <div className="text-sm text-gray-400">{f.description}</div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-indigo-400 text-sm font-medium group-hover:gap-3 transition-all duration-300">
                    <span>Learn more</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  )
});

export default Features;
