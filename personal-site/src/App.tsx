import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Container } from "reactstrap";

// core components
import IndexNavbar from "./components/Navbars/IndexNavbar";
import Footer from "./components/Footer/Footer";

// sections
import BackgroundBubbles from "./views/ProjectSections/backgroundBubbles";
import CsLox from "./views/ProjectSections/csLox";
import BlockTrack from "./views/ProjectSections/blockTrack";
import SpawnerTiers from "./views/ProjectSections/spawnerTiers";
import LoxInterpreterComponent from "./views/examples/LoxInterpreterComponent";

export default function App() {
  const [activeSection, setActiveSection] = useState("home");
  const location = useLocation();

  useEffect(() => {
    // Add index-page class
    document.body.classList.toggle("index-page");

    // Handle initial hash navigation
    const hash = location.hash.replace("#", "");
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }

    // Set up intersection observer for section highlighting
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe all sections
    document.querySelectorAll("section[id]").forEach((section) => {
      observer.observe(section);
    });

    // Cleanup function
    return () => {
      document.body.classList.toggle("index-page");
      observer.disconnect();
    };
  }, [location]);

  return (
    <>
      <IndexNavbar activeSection={activeSection} />
      <div className="wrapper">
        {/* Hero Section */}
        <section id="home" className="page-header">
          <div className="page-header-image" />
          <div className="content">
            <Container>
              <div className="content-center brand">
                <h1 className="h1-seo">Noah Peterson</h1>
                <h3 className="d-none d-sm-block">
                  Software Engineer & Full Stack Developer
                </h3>
              </div>
            </Container>
          </div>
          <div className="squares square1" />
          <div className="squares square2" />
          <div className="squares square3" />
          <div className="squares square4" />
          <div className="squares square5" />
          <div className="squares square6" />
          <div className="squares square7" />
        </section>

        {/* Projects Section */}
        <div className="main">
          <section id="projects" className="section section-javascript">
            <BackgroundBubbles value={0} />
            <CsLox />
            <BlockTrack />
            <div className="section section-navbars">
              <BackgroundBubbles value={1} />
              <SpawnerTiers />
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </>
  );
}
