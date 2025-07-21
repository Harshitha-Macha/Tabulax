import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-24">
      {/* Gradient Background Effect */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full opacity-70 blur-3xl"></div>
        <div className="absolute top-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-70 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-x">
            The Modern Workflow Platform
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-700 max-w-2xl mx-auto">
            Streamline your team's collaboration with our intuitive workflow tool. 
            Automate tasks, visualize progress, and achieve more together.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#demo"
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transition-shadow flex items-center justify-center"
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </a>
            <a
              href="#features"
              className="px-8 py-3.5 rounded-full border border-slate-200 hover:border-slate-300 font-medium transition-colors"
            >
              View Features
            </a>
          </div>
        </div>

        <div className="mt-16 sm:mt-20 relative">
          <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-100">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent"></div>
            <img
              src="https://images.pexels.com/photos/8964095/pexels-photo-8964095.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Flowline Dashboard"
              className="w-full h-auto"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100 text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">250K+</p>
              <p className="mt-2 text-slate-600">Active Users</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100 text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">98%</p>
              <p className="mt-2 text-slate-600">Customer Satisfaction</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100 text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">10M+</p>
              <p className="mt-2 text-slate-600">Tasks Completed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;