import React, { useState, useRef } from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu, X, Linkedin, Github } from "lucide-react";
import CustomButton from "../components/CustomButton";
import theme from "../theme";

const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const aboutRef = useRef(null);
  const featuresRef = useRef(null);
  const pricingRef = useRef(null);
  const teamRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setMenuOpen(false);
  };

  const features = [
    {
      title: "Motion Tracking",
      description:
        "Real-time computer vision tracks body movement and analyzes joint angles to help patients perform exercises with proper posture.",
      icon: "/src/assets/feature1Icon.svg",
    },
    {
      title: "Personalized Exercise Plan",
      description:
        "Exercise guidance can be tailored according to the patient's rehabilitation needs, exercise type, and progress.",
      icon: "/src/assets/feature2Icon.svg",
    },
    {
      title: "Progress Tracking",
      description:
        "Track exercise performance and rehabilitation progress to stay consistent and monitor improvement over time.",
      icon: "/src/assets/feature3Icon.svg",
    },
  ];

  const teamMembers = [
    {
      name: "Fahim Ullah",
      role: "Lead",
      image: "/src/assets/team1.jpg",
      linkedin: "#",
    },
    {
      name: "Muhammad Ihtesham Ul Haq",
      role: "Group Member",
      image: "/src/assets/team2.jpg",
      linkedin: "#",
    },
    {
      name: "Muhammad Umair",
      role: "Group Member",
      image: "/src/assets/team3.jpg",
      linkedin: "#",
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: theme.gradients.warm,
      }}
    >
      {/* ==================== Navigation ==================== */}
      <nav
        className="fixed top-4 left-2 right-2 sm:left-4 sm:right-4 md:left-8 md:right-8 lg:left-32 lg:right-32 z-50 transition-all duration-300 backdrop-blur-lg rounded-2xl"
        style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          boxShadow: theme.shadows.sm,
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">

            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/src/assets/Physiovision.png"
                alt="Physiovision Logo"
                className="h-8 sm:h-10 lg:h-12 w-auto"
              />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4 lg:gap-8 ml-auto">
              <button
                onClick={() => scrollToSection(aboutRef)}
                className="text-sm lg:text-base font-semibold transition-colors hover:opacity-75"
                style={{ color: theme.colors.text.primary }}
              >
                About Us
              </button>

              <button
                onClick={() => scrollToSection(featuresRef)}
                className="text-sm lg:text-base font-semibold transition-colors hover:opacity-75"
                style={{ color: theme.colors.text.primary }}
              >
                Features
              </button>

              <button
                onClick={() => scrollToSection(pricingRef)}
                className="text-sm lg:text-base font-semibold transition-colors hover:opacity-75"
                style={{ color: theme.colors.text.primary }}
              >
                Pricing
              </button>

              <button
                onClick={() => scrollToSection(teamRef)}
                className="text-sm lg:text-base font-semibold transition-colors hover:opacity-75"
                style={{ color: theme.colors.text.primary }}
              >
                Team
              </button>

              <button
                onClick={() => scrollToSection(contactRef)}
                className="text-sm lg:text-base font-semibold transition-colors hover:opacity-75"
                style={{ color: theme.colors.text.primary }}
              >
                Contact
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2"
              style={{
                color: theme.colors.primary.blue,
              }}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div
              className="md:hidden py-3 px-2 space-y-2 backdrop-blur-lg rounded-b-lg"
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
              }}
            >
              <button
                onClick={() => scrollToSection(aboutRef)}
                className="block w-full text-left py-2 px-2 font-semibold text-sm rounded hover:bg-white/10 transition-colors"
                style={{ color: theme.colors.text.primary }}
              >
                About Us
              </button>

              <button
                onClick={() => scrollToSection(featuresRef)}
                className="block w-full text-left py-2 px-2 font-semibold text-sm rounded hover:bg-white/10 transition-colors"
                style={{ color: theme.colors.text.primary }}
              >
                Features
              </button>

              <button
                onClick={() => scrollToSection(pricingRef)}
                className="block w-full text-left py-2 px-2 font-semibold text-sm rounded hover:bg-white/10 transition-colors"
                style={{ color: theme.colors.text.primary }}
              >
                Pricing
              </button>

              <button
                onClick={() => scrollToSection(teamRef)}
                className="block w-full text-left py-2 px-2 font-semibold text-sm rounded hover:bg-white/10 transition-colors"
                style={{ color: theme.colors.text.primary }}
              >
                Team
              </button>

              <button
                onClick={() => scrollToSection(contactRef)}
                className="block w-full text-left py-2 px-2 font-semibold text-sm rounded hover:bg-white/10 transition-colors"
                style={{ color: theme.colors.text.primary }}
              >
                Contact
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ==================== Hero Section ==================== */}
      <section
        ref={aboutRef}
        className="relative pt-24 pb-32 px-4 min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute w-full h-full object-cover"
          >
            <source
              src="/src/assets/herosectionvideo.mp4"
              type="video/mp4"
            />
          </video>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="text-3xl md:text-5xl font-bold mb-6"
              style={{
                color: theme.colors.text.light,
              }}
            >
              PhysioVision
              <br />
              Computer Vision Based Physiotherapy & Rehabilitation System
            </h1>

            <p
              className="text-base md:text-lg mb-8 max-w-3xl mx-auto"
              style={{
                color: theme.colors.text.light,
              }}
            >
              PhysioVision is a computer vision-based physiotherapy and
              rehabilitation platform that uses real-time motion tracking and
              rule-based joint angle analysis to help patients perform
              exercises correctly at home.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/onboarding" className="block">
                <CustomButton
                  text="Get Started"
                  variant="primary"
                  fullWidth={false}
                  type="button"
                />
              </Link>
            </div>
          </Motion.div>
        </div>
      </section>

      {/* ==================== Features Section ==================== */}
      <section
        ref={featuresRef}
        className="py-20 px-4 md:px-8 lg:px-32"
        style={{
          backgroundColor: theme.colors.background.sidebar,
        }}
      >
        <div className="max-w-7xl mx-auto">

          {/* Section Heading */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl font-bold mb-4"
              style={{
                color: theme.colors.text.primary,
              }}
            >
              Features for Better Rehabilitation
            </h2>

            <p
              className="max-w-2xl mx-auto"
              style={{
                color: theme.colors.text.secondary,
              }}
            >
              PhysioVision provides intelligent tools to support patients
              during their physiotherapy and rehabilitation exercises.
            </p>
          </Motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <Motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                viewport={{
                  once: true,
                }}
                whileHover={{
                  y: -5,
                }}
                className="rounded-2xl p-8 shadow-lg transition-all duration-300 border-2"
                style={{
                  backgroundColor: theme.colors.background.card,
                  borderColor: theme.colors.border.light,
                }}
              >
                <div className="w-20 h-20 rounded-xl flex items-center justify-center mb-6">
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="w-14 h-14"
                  />
                </div>

                <h3
                  className="text-xl font-bold mb-3"
                  style={{
                    color: theme.colors.text.primary,
                  }}
                >
                  {feature.title}
                </h3>

                <p
                  style={{
                    color: theme.colors.text.secondary,
                  }}
                >
                  {feature.description}
                </p>
              </Motion.div>
            ))}
          </div>

          {/* App Preview */}
          <div className="grid md:grid-cols-2 gap-12 items-center mt-32">
            <Motion.div
              initial={{
                opacity: 0,
                x: -30,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.6,
              }}
              viewport={{
                once: true,
              }}
            >
              <img
                src="/src/assets/AppPreview.png"
                alt="PhysioVision Application Preview"
                className="w-full h-auto object-cover"
              />
            </Motion.div>

            <Motion.div
              initial={{
                opacity: 0,
                x: 30,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.6,
              }}
              viewport={{
                once: true,
              }}
            >
              <h3
                className="text-3xl font-bold mb-6"
                style={{
                  color: theme.colors.text.primary,
                }}
              >
                Accessible At-Home Physiotherapy
              </h3>

              <p
                className="text-lg leading-relaxed"
                style={{
                  color: theme.colors.text.secondary,
                }}
              >
                PhysioVision delivers accessible at-home physical therapy
                through computer vision and real-time motion analysis.
                Patients can perform rehabilitation exercises while receiving
                posture guidance and feedback based on joint-angle analysis.
              </p>
            </Motion.div>
          </div>
        </div>
      </section>

      {/* ==================== Pricing Section ==================== */}
      <section
        ref={pricingRef}
        className="py-24 px-4 md:px-8 lg:px-32"
        style={{
          backgroundColor: theme.colors.background.card,
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <Motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            viewport={{
              once: true,
            }}
          >
            <h2
              className="text-4xl font-bold mb-6"
              style={{
                color: theme.colors.text.primary,
              }}
            >
              Pricing
            </h2>

            <p
              className="text-lg mb-8"
              style={{
                color: theme.colors.text.secondary,
              }}
            >
              PhysioVision is designed to make physiotherapy and rehabilitation
              guidance more accessible from home.
            </p>

            <div
              className="rounded-2xl p-8 shadow-lg border-2 max-w-md mx-auto"
              style={{
                borderColor: theme.colors.border.light,
                backgroundColor: theme.colors.background.sidebar,
              }}
            >
              <h3
                className="text-2xl font-bold mb-4"
                style={{
                  color: theme.colors.text.primary,
                }}
              >
                Free Access
              </h3>

              <p
                style={{
                  color: theme.colors.text.secondary,
                }}
              >
                Access the core PhysioVision rehabilitation features and
                exercise guidance.
              </p>
            </div>
          </Motion.div>
        </div>
      </section>

      {/* ==================== Team Section ==================== */}
      <section
        ref={teamRef}
        className="py-32 px-4 md:px-8 lg:px-32"
        style={{
          backgroundColor: theme.colors.background.sidebar,
        }}
      >
        <div className="max-w-7xl mx-auto">

          {/* Team Heading */}
          <Motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            viewport={{
              once: true,
            }}
            className="text-center mb-20"
          >
            <h2
              className="text-4xl font-bold mb-4"
              style={{
                color: theme.colors.text.primary,
              }}
            >
              Meet the Team
            </h2>
          </Motion.div>

          {/* Team Members */}
          <div className="flex flex-wrap justify-center gap-12">
            {teamMembers.map((member, index) => (
              <Motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                viewport={{
                  once: true,
                }}
                className="flex flex-col items-center text-center w-48"
              >
                <div
                  className="relative w-40 h-40 rounded-2xl overflow-hidden mb-6 shadow-xl"
                  style={{
                    backgroundColor:
                      theme.colors.background.softBlue,
                  }}
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  {/* LinkedIn Button */}
                  {member.linkedin && member.linkedin !== "#" && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} LinkedIn`}
                      className="absolute bottom-3 right-3 p-2 rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor:
                          theme.colors.primary.blue,
                      }}
                    >
                      <Linkedin
                        size={20}
                        className="text-white"
                      />
                    </a>
                  )}
                </div>

                <span
                  className="font-bold text-base mb-2"
                  style={{
                    color: theme.colors.text.primary,
                  }}
                >
                  {member.name}
                </span>

                <p
                  className="text-sm"
                  style={{
                    color: theme.colors.text.secondary,
                  }}
                >
                  {member.role}
                </p>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== Footer ==================== */}
      <footer
        ref={contactRef}
        className="py-8 px-4 md:px-8 lg:px-32"
        style={{
          backgroundColor: theme.colors.primary.black,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 lg:gap-16">

            {/* Logo */}
            <img
              src="/src/assets/Physiovision.png"
              alt="Physiovision Logo"
              className="h-10"
            />

            {/* Copyright */}
            <p
              style={{
                color: theme.colors.text.light,
              }}
            >
              PhysioVision 2026 © All rights reserved.
            </p>

            {/* GitHub */}
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-base font-semibold hover:opacity-75 transition-opacity"
              style={{
                color: theme.colors.text.light,
              }}
            >
              <Github size={20} />
              Project GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;