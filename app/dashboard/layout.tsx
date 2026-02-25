import Appbar from '@/components/top-bar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-[#071026] via-[#0a1435] to-[#0f1729] relative overflow-hidden'>
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <Appbar />
      <main className='flex-1 container mx-auto px-4 pt-20 relative z-10'>{children}</main>
    </div>
  );
};

export default Layout;
