import { Star } from 'lucide-react';

const testimonials = [
  {
    content: "Flowline has transformed how our team collaborates. We've reduced meeting time by 30% and increased productivity across the board.",
    author: "Sarah Johnson",
    role: "Product Manager at Acme Inc.",
    rating: 5,
    image: "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    content: "The automation features alone have saved us countless hours. It's like having an extra team member dedicated to administrative tasks.",
    author: "Mark Thompson",
    role: "CTO at TechFlow",
    rating: 5,
    image: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    content: "We evaluated several workflow tools, but Flowline stood out for its intuitive interface and powerful customization options.",
    author: "Jessica Chen",
    role: "Operations Director at GlobalCorp",
    rating: 5,
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
];

const logos = [
  "Microsoft", "Google", "Amazon", "Netflix", "Spotify", "Adobe"
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Trusted by innovative teams
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            See what our customers are saying about Flowline.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-6">{testimonial.content}</p>
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-medium text-slate-900">{testimonial.author}</h4>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Logos */}
        <div className="mt-20">
          <p className="text-center text-slate-500 mb-8">Trusted by leading companies worldwide</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {logos.map((logo, index) => (
              <div key={index} className="text-slate-400 font-semibold text-xl">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;