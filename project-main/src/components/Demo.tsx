import { useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const demoSteps = [
  {
    title: 'Visualize your workflow',
    description: 'Create custom workflows that match your team\'s process exactly.'
  },
  {
    title: 'Assign tasks and track progress',
    description: 'Delegate responsibilities and monitor progress in real-time.'
  },
  {
    title: 'Automate repetitive tasks',
    description: 'Set up automation rules to handle routine tasks automatically.'
  },
  {
    title: 'Generate comprehensive reports',
    description: 'Get insights into team performance and project status.'
  }
];

const Demo = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="demo" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            See Flowline in action
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Discover how Flowline can transform your team's productivity and collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Step Selector */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {demoSteps.map((step, index) => (
                <button
                  key={index}
                  className={`w-full text-left p-5 rounded-xl border transition-all ${
                    activeStep === index
                      ? 'border-indigo-200 bg-white shadow-md'
                      : 'border-slate-200 bg-white/50 hover:bg-white'
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 rounded-full p-1 ${
                      activeStep === index ? 'text-indigo-600' : 'text-slate-400'
                    }`}>
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className={`font-medium ${
                        activeStep === index ? 'text-indigo-600' : 'text-slate-900'
                      }`}>
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8">
              <a
                href="#"
                className="flex items-center text-indigo-600 font-medium hover:text-indigo-700"
              >
                Schedule a live demo <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Demo Display */}
          <div className="lg:col-span-3 relative">
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="h-12 bg-slate-100 flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                  <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                  <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                </div>
              </div>
              <div className="p-6 bg-white">
                {activeStep === 0 && (
                  <img
                    src="https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="Workflow visualization"
                    className="w-full h-auto rounded-lg"
                  />
                )}
                {activeStep === 1 && (
                  <img
                    src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="Task assignment"
                    className="w-full h-auto rounded-lg"
                  />
                )}
                {activeStep === 2 && (
                  <img
                    src="https://images.pexels.com/photos/3862130/pexels-photo-3862130.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="Task automation"
                    className="w-full h-auto rounded-lg"
                  />
                )}
                {activeStep === 3 && (
                  <img
                    src="https://images.pexels.com/photos/95916/pexels-photo-95916.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="Reports and analytics"
                    className="w-full h-auto rounded-lg"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo;