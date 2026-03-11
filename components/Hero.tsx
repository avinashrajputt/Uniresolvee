import React from 'react'
import Image from 'next/image'
import { Sparkles, ArrowRight, Play } from 'lucide-react'

const Hero = React.memo(function Hero() {
  return (
    <section id="home" className="w-full bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-[#071026] dark:via-[#0a1435] dark:to-[#071026] text-gray-900 dark:text-white py-16 md:py-20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="w-full px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 lg:col-span-7 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 mb-6 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">AI-Powered Assessment Platform</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold leading-tight mb-5">
              <span className="bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 dark:from-white dark:via-indigo-100 dark:to-purple-200 bg-clip-text text-transparent">UniResolve</span>
              <br />
              <span className="text-gray-900 dark:text-white">Automated Assessment for</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-500 bg-clip-text text-transparent">Universities</span>
            </h1>
            
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl md:max-w-none md:pr-8 mb-6 leading-relaxed">
              Trusted AI-powered evaluation that speeds up grading, improves fairness, and provides actionable feedback for educators. Fast, explainable, and easy to integrate.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3 justify-center md:justify-start">
              <a href="/auth/login" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#contact" className="inline-flex items-center justify-center gap-2 border-2 border-indigo-500/50 hover:border-indigo-600 bg-indigo-100 hover:bg-indigo-200 dark:border-indigo-500/30 dark:hover:border-indigo-500/50 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-white px-6 py-3 rounded-xl font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105">
                <Play className="h-4 w-4" />
                Request Demo
              </a>
            </div>
          </div>

          <div className="md:col-span-5 lg:col-span-5 flex items-center justify-center relative">
            <div className="relative w-full max-w-[600px]">
              {/* decorative blurred shapes behind the screenshot */}
              <div className="hidden md:block absolute -right-8 -top-8 w-48 h-48 rounded-full bg-gradient-to-br from-indigo-600/30 to-purple-600/30 blur-3xl animate-pulse"></div>
              <div className="hidden md:block absolute -left-6 -bottom-6 w-40 h-40 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>

              <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/10 to-purple-600/10 z-10"></div>
                <Image
                  src="https://www.testportal.net/img/2438x1808/787b387f05/hero-app-screen-v2-en-5.png/m/1200x0/filters:quality(75):format(webp)"
                  alt="UniResolve app preview"
                  width={1200}
                  height={800}
                  className="w-full h-auto object-cover block"
                  priority
                  loading="eager"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
});

export default Hero;
