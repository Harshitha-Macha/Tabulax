import { Check, X } from 'lucide-react';

const plans = [
  {
    name: "Starter",
    price: "$9",
    description: "Perfect for individuals and small teams getting started.",
    features: [
      "Up to 5 team members",
      "Basic workflow templates",
      "Task management",
      "Email support",
      "1GB storage"
    ],
    notIncluded: [
      "Advanced automation",
      "Custom reporting",
      "API access",
      "Priority support"
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Professional",
    price: "$29",
    description: "Ideal for growing teams that need more power and flexibility.",
    features: [
      "Up to 20 team members",
      "Advanced workflow templates",
      "Custom fields",
      "Basic automation",
      "Task dependencies",
      "10GB storage",
      "Priority email support"
    ],
    notIncluded: [
      "Custom reporting",
      "API access"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "$79",
    description: "Advanced features for large teams with complex workflows.",
    features: [
      "Unlimited team members",
      "Custom workflow creation",
      "Advanced automation",
      "Custom reporting",
      "API access",
      "SAML SSO",
      "100GB storage",
      "24/7 premium support"
    ],
    notIncluded: [],
    cta: "Contact Sales",
    popular: false
  }
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Choose the plan that's right for your team. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl overflow-hidden border transition-all ${
                plan.popular 
                  ? 'border-indigo-200 shadow-lg ring-1 ring-indigo-500 scale-105 md:scale-105 z-10' 
                  : 'border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="ml-1 text-slate-600">/month</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{plan.description}</p>

                <div className="mt-6">
                  <a
                    href="#"
                    className={`block w-full py-3 text-center rounded-lg font-medium ${
                      plan.popular
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-md transition-shadow'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              </div>

              <div className="px-6 pb-6">
                <div className="border-t border-slate-100 pt-6">
                  <ul className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature, i) => (
                      <li key={i} className="flex text-slate-400">
                        <X className="h-5 w-5 text-slate-300 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600">
            Need a custom plan? <a href="#" className="text-indigo-600 font-medium">Contact our sales team</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;