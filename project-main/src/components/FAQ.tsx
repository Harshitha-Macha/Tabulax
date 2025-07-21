import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "How does the 14-day trial work?",
    answer: "Your trial begins as soon as you create an account. You'll have full access to all features of the Professional plan for 14 days, with no credit card required. We'll send you a reminder before your trial ends."
  },
  {
    question: "Can I change plans later?",
    answer: "Yes, you can upgrade, downgrade, or cancel your plan at any time. If you upgrade, you'll be charged the prorated difference for the remainder of your billing cycle. If you downgrade, your new rate will apply at the start of your next billing cycle."
  },
  {
    question: "Is there a limit to how many workflows I can create?",
    answer: "No, all plans allow you to create unlimited workflows. However, the number of active workflows and team members varies by plan."
  },
  {
    question: "Do you offer discounts for non-profits or educational institutions?",
    answer: "Yes, we offer special pricing for eligible non-profits, educational institutions, and open-source projects. Contact our sales team to learn more."
  },
  {
    question: "How secure is my data?",
    answer: "We take security seriously. We use industry-standard encryption, regular security audits, and follow best practices for data protection. Your data is backed up daily and we're compliant with GDPR and other privacy regulations."
  },
  {
    question: "Can I import data from other tools?",
    answer: "Yes, Flowline supports importing data from popular tools like Asana, Trello, Jira, and more. Our import wizard makes it easy to bring your existing workflows and tasks into Flowline."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Everything you need to know about Flowline. Can't find the answer you're looking for? 
            <a href="#" className="text-indigo-600 ml-1 font-medium">Contact our support team</a>.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="border border-slate-200 rounded-lg overflow-hidden"
              >
                <button
                  className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none bg-white hover:bg-slate-50 transition-colors"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="font-medium text-slate-900">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-500" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 bg-slate-50 text-slate-700">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;