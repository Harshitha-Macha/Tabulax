import { ArrowRight } from 'lucide-react';

const Newsletter = () => {
  return (
    <section className="py-20 bg-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
              <h2 className="text-2xl md:text-3xl font-bold">Stay updated with Flowline</h2>
              <p className="mt-4 text-indigo-100">
                Get the latest updates, tips, and best practices for optimizing your workflows.
              </p>
              <div className="mt-10 hidden md:block">
                <div className="inline-flex items-center space-x-2">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">Join over 50,000 subscribers</span>
                </div>
              </div>
            </div>
            <div className="p-8 md:p-12">
              <form className="space-y-4">
                <div>
                  <label htmlFor="full-name" className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full-name"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-md transition-shadow flex items-center justify-center"
                  >
                    Subscribe to Newsletter <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
                <div className="text-sm text-slate-500 mt-4">
                  By subscribing, you agree to our <a href="#" className="text-indigo-600">Privacy Policy</a> and <a href="#" className="text-indigo-600">Terms of Service</a>.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;