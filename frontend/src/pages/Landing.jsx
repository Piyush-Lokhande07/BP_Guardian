/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  // Simple hero retained from original layout
  const Hero = () => (
    <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeInUp} initial="initial" whileInView="whileInView">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Bridging AI and Doctors for{' '}
              <span className="bg-linear-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
                Smarter Blood Pressure Care
              </span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Personalized, doctor-validated recommendations powered by real-time
              health data. Take control of your wellness with AI-driven insights
              and expert medical guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <motion.button
                  className="px-8 py-3 bg-linear-to-r from-blue-500 to-teal-500 text-white rounded-full font-semibold hover:shadow-lg transition-shadow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  className="px-8 py-3 border-2 border-slate-200 text-slate-900 rounded-full font-semibold hover:border-blue-500 hover:text-blue-500 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login
                </motion.button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="relative h-96 rounded-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Illustration intentionally left blank */}
          </motion.div>
        </div>
      </div>
    </section>
  );

  // Simplified footer with a single quote per request
  const Footer = () => (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xl italic text-slate-700">"Your heart, our AI, and trusted doctors — together for better health."</p>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Footer />
    </div>
  );
};

export default LandingPage;