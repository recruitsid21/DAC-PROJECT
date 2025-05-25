// client/src/pages/Home.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import "../styles/animations.css";

function HomePage() {
  useEffect(() => {
    // Initialize AOS on component mount
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
    });
  }, []);

  const stats = [
    { label: "Events Hosted", value: "10K+" },
    { label: "Happy Attendees", value: "250K+" },
    { label: "Cities", value: "50+" },
    { label: "Organizers", value: "1000+" },
  ];

  const features = [
    {
      title: "Easy Booking",
      description: "Book your favorite events in just a few clicks",
      icon: "🎫",
    },
    {
      title: "Secure Payments",
      description: "Multiple payment options with guaranteed security",
      icon: "🔒",
    },
    {
      title: "Instant Confirmation",
      description: "Get your tickets delivered instantly to your email",
      icon: "✉️",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Event Organizer",
      content:
        "The platform has revolutionized how we manage our events. Highly recommended!",
      avatar: "https://i.pravatar.cc/100?img=1",
    },
    {
      name: "Michael Chen",
      role: "Regular Attendee",
      content:
        "I've never had such a smooth experience booking event tickets. Simply amazing!",
      avatar: "https://i.pravatar.cc/100?img=2",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)] opacity-25"></div>
      {/* Animated Gradient Orbs with enhanced animations */}
      <motion.div
        animate={{
          x: [0, 20, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: "linear",
        }}
        className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
      />
      <motion.div
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 25,
          ease: "linear",
        }}
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
      />
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 30,
          ease: "linear",
        }}
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
      />
      {/* Hero Section */}
      <div className="relative container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto backdrop-blur-sm bg-white/30 rounded-2xl p-12 shadow-2xl hover:shadow-3xl transition-all duration-300"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl font-extrabold text-gray-900 mb-6 leading-tight"
          >
            <span className="block mb-2">Create Moments</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient">
              Book with Evenza
            </span>
          </motion.h1>
          <div className="space-y-6">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-2xl text-gray-800 font-medium leading-relaxed max-w-2xl mx-auto"
            >
              Your go-to platform for discovering, planning, and booking events
              with ease.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-12"
            >
              Whether you're here to attend an event or host one, Evenza brings
              it all together — browse exciting events, book tickets in seconds,
              or create and manage your own events with powerful tools for
              venues, scheduling, and ticketing.
            </motion.p>
          </div>

          {/* Enhanced Buttons Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              to="/events"
              className="group w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden"
            >
              <span className="relative z-10">Browse Events</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                whileHover={{ scale: 1.1 }}
              />
            </Link>

            <div className="flex gap-4 w-full sm:w-auto">
              <Link
                to="/login"
                className="flex-1 sm:flex-none px-8 py-4 text-lg font-semibold text-indigo-700 bg-white/90 backdrop-blur-sm border-2 border-indigo-600/30 rounded-xl hover:bg-white transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl hover:border-indigo-600"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="group flex-1 sm:flex-none px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden"
              >
                <span className="relative z-10">Sign Up</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ scale: 1.1 }}
                />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>{" "}
      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative py-24 bg-gradient-to-br from-white/80 via-indigo-50/50 to-purple-50/50 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-center mb-16 text-gray-900"
          >
            Why Choose{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient">
              Evenza
            </span>
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                whileHover={{ scale: 1.05, rotate: 1 }}
                className="group p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/50 border border-transparent hover:border-indigo-100"
              >
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>{" "}
      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                data-aos="zoom-in"
                data-aos-delay={index * 150}
                whileHover={{ scale: 1.05 }}
                className="text-center p-8 rounded-xl bg-white/60 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 group"
              >
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3 transform group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium group-hover:text-gray-800 transition-colors duration-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>{" "}
      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2
            className="text-4xl font-bold text-center mb-12 text-gray-900"
            data-aos="fade-up"
          >
            What People{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Say
            </span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 200}
                whileHover={{ scale: 1.02 }}
                className="p-8 rounded-xl bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group border border-transparent hover:border-indigo-100"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto bg-white/60 backdrop-blur-sm rounded-2xl p-12 shadow-2xl"
          >
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Ready to Experience Amazing Events?
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Join thousands of people who trust us for their event booking
              needs.
            </p>
            <Link
              to="/events"
              className="inline-block px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Explore Events Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
