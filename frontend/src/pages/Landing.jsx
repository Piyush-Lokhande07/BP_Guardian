import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Shield, Heart, ChevronRight, Menu, X, TrendingDown, Users, Clock, Star, Linkedin, Twitter, Github } from 'lucide-react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    transition: { staggerChildren: 0.1 },
  };

  // ============ NAVBAR ============
  const Navbar = () => (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">BP Guardian</span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {['Home', 'Features', 'AI Insights', 'For Doctors', 'Contact'].map(
              (item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium"
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.a>
              )
            )}
          </div>

          {/* Get Started Button (Desktop) */}
          <motion.button
            className="hidden md:flex px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-full font-medium text-sm hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden pb-4 border-t border-slate-100"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {['Home', 'Features', 'AI Insights', 'For Doctors', 'Contact'].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block py-2 text-slate-600 hover:text-blue-600 text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              )
            )}
            <button className="w-full mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-full font-medium text-sm">
              Get Started
            </button>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );

  // ============ HERO SECTION ============
  const Hero = () => (
    <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div variants={fadeInUp} initial="initial" whileInView="whileInView">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Bridging AI and Doctors for{' '}
              <span className="bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
                Smarter Blood Pressure Care
              </span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Personalized, doctor-validated recommendations powered by real-time
              health data. Take control of your wellness with AI-driven insights
              and expert medical guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-full font-semibold hover:shadow-lg transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Demo
              </motion.button>
              <motion.button
                className="px-8 py-3 border-2 border-slate-200 text-slate-900 rounded-full font-semibold hover:border-blue-500 hover:text-blue-500 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
            </div>
          </motion.div>

          {/* Right Illustration */}
          <motion.div
            className="relative h-96 rounded-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src="/placeholder.svg?key=w0eiv"
              alt="AI Blood Pressure Monitoring"
              className="w-full h-full object-cover rounded-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );

  // ============ FEATURES SECTION ============
  const Features = () => {
    const features = [
      {
        icon: Activity,
        title: 'Continuous BP Tracking',
        description: 'IoT devices + manual entries for 24/7 monitoring',
      },
      {
        icon: Zap,
        title: 'AI-Powered Insights',
        description: 'Real-time analysis and predictive health trends',
      },
      {
        icon: Shield,
        title: 'Doctor Validation Loop',
        description: 'Expert review and approval before recommendations',
      },
      {
        icon: TrendingDown,
        title: 'Personalized Treatment',
        description: 'Cost-aware plans tailored to your needs',
      },
    ];

    return (
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="whileInView"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-slate-600">
              Everything you need for smarter cardiovascular health management
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  className="p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all"
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    );
  };

  // ============ HOW IT WORKS ============
  const HowItWorks = () => {
    const steps = [
      {
        number: '01',
        title: 'Record BP Readings',
        description: 'Connect your IoT device or manually log readings',
        icon: Heart,
      },
      {
        number: '02',
        title: 'AI Analysis',
        description: 'Advanced algorithms process data and identify patterns',
        icon: Zap,
      },
      {
        number: '03',
        title: 'Doctor Review',
        description: 'Licensed physicians validate and approve recommendations',
        icon: Shield,
      },
    ];

    return (
      <section id="ai-insights" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="whileInView"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              Three simple steps to better health outcomes
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
          >
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div key={idx} variants={fadeInUp}>
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <motion.div
                        className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mb-6"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Icon className="w-10 h-10 text-white" />
                      </motion.div>
                      <div className="text-5xl font-bold text-slate-100 -mt-8">
                        {step.number}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-3 text-center">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 text-center">
                      {step.description}
                    </p>

                    {/* Connector Line */}
                    {idx < steps.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-1/2 w-full h-1 bg-gradient-to-r from-blue-500 to-teal-500 -translate-y-1/2 ml-10 -z-10" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    );
  };

  // ============ TESTIMONIALS ============
  const Testimonials = () => {
    const testimonials = [
      {
        name: 'Dr. Sarah Chen',
        role: 'Cardiologist',
        image: '/placeholder.svg?key=hz4km',
        quote:
          'BP Guardian has revolutionized how I monitor my patients remote health. The AI insights are incredibly accurate and save me hours of analysis time.',
      },
      {
        name: 'James Mitchell',
        role: 'Patient',
        image: '/placeholder.svg?key=ft3ok',
        quote:
          'Having a AI-powered system that actually involves my doctor gives me confidence. I feel like my health is truly being managed by the best of both worlds.',
      },
      {
        name: 'Dr. Amara Okonkwo',
        role: 'Chief Medical Officer',
        image: '/placeholder.svg?key=zmnhs',
        quote:
          'The validation loop ensures patient safety while leveraging AI efficiency. This is the future of personalized healthcare.',
      },
    ];

    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="whileInView"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Trusted by Patients & Doctors
            </h2>
            <p className="text-lg text-slate-600">
              See what real users have to say about BP Guardian
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
          >
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                className="p-8 bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-shadow"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-slate-600 italic">{testimonial.quote}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    );
  };

  // ============ CTA BANNER ============
  const CTABanner = () => (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-4xl mx-auto p-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl text-center text-white"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Experience the Future of Chronic Care Today
        </h2>
        <p className="text-lg opacity-90 mb-8">
          Join thousands of patients and doctors transforming heart health management
        </p>
        <motion.button
          className="px-10 py-3 bg-white text-blue-600 rounded-full font-semibold hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Join Now
        </motion.button>
      </motion.div>
    </section>
  );

  // ============ FOOTER ============
  const Footer = () => (
    <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-teal-400 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg">BP Guardian</span>
            </div>
            <p className="text-slate-400 text-sm">
              Bridging AI and medical expertise for better cardiovascular health.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.2 }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.2 }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.2 }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </motion.a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2025 BP Guardian. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );

  // ============ MAIN RENDER ============
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  );
};

export default LandingPage;