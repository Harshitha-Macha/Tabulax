import { LineChart, Zap, Users, Lock, Settings, Clock } from 'lucide-react';

const features = [
  {
    icon: <LineChart className="h-6 w-6 text-indigo-600" />,
    title: 'Advanced Analytics',
    description: 'Gain valuable insights with real-time analytics and comprehensive reporting tools.'
  },
  {
    icon: <Zap className="h-6 w-6 text-indigo-600" />,
    title: 'Automation',
    description: 'Automate repetitive tasks and workflows to save time and reduce human error.'
  },
  {
    icon: <Users className="h-6 w-6 text-indigo-600" />,
    title: 'Team Collaboration',
    description: 'Work seamlessly with your team in real-time with intuitive collaboration features.'
  },
  {
    icon: <Lock className="h-6 w-6 text-indigo-600" />,
    title: 'Enterprise Security',
    description: 'Rest easy with bank-level security protocols and data encryption.'
  },
  {
    icon: <Settings className="h-6 w-6 text-indigo-600" />,
    title: 'Customizable Workflows',
    description: 'Create and customize workflows that fit your team\'s unique processes.'
  },
  {
    icon: <Clock className="h-6 w-6 text-indigo-600" />,
    title: 'Time Tracking',
    description: 'Monitor project hours and track time spent on tasks with precision.'
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-white scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Everything you need to streamline your workflow
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Our comprehensive suite of features helps teams collaborate, automate, and achieve more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-6 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-5 group-hover:bg-indigo-100 transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900 group-hover:text-indigo-600 transition-colors duration-300">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 sm:p-10 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="max-w-lg">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to transform your workflow?</h3>
                  <p className="text-slate-700">
                    Join thousands of teams who have already streamlined their processes with Flowline.
                  </p>
                </div>
                <a
                  href="#"
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transition-shadow whitespace-nowrap hover:-translate-y-0.5 transform transition-transform duration-300"
                >
                  Start Free Trial
                </a>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-50 blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;