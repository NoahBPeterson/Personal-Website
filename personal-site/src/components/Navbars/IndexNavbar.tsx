/*!

=========================================================
* BLK Design System React - v1.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/blk-design-system-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/blk-design-system-react/blob/main/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import { Link } from "react-router-dom";
// reactstrap components
import {
  Button,
  Collapse,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
  Row,
  Col,
} from "reactstrap";

interface IndexNavbarProps {
  activeSection: string;
}

export default function IndexNavbar({ activeSection }: IndexNavbarProps) {
  const [collapseOpen, setCollapseOpen] = React.useState(false);
  const [collapseOut, setCollapseOut] = React.useState("");
  const [color, setColor] = React.useState("navbar-transparent");

  React.useEffect(() => {
    window.addEventListener("scroll", changeColor);
    return function cleanup() {
      window.removeEventListener("scroll", changeColor);
    };
  }, []);

  const changeColor = () => {
    if (document.documentElement.scrollTop > 99 || document.body.scrollTop > 99) {
      setColor("bg-info");
    } else if (document.documentElement.scrollTop < 100 || document.body.scrollTop < 100) {
      setColor("navbar-transparent");
    }
  };

  const toggleCollapse = () => {
    document.documentElement.classList.toggle("nav-open");
    setCollapseOpen(!collapseOpen);
  };

  const onCollapseExiting = () => {
    setCollapseOut("collapsing-out");
  };

  const onCollapseExited = () => {
    setCollapseOut("");
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      setCollapseOpen(false);
    }
  };

  return (
    <Navbar className={`fixed-top ${color} backdrop-blur-sm transition-colors duration-200`} expand="lg">
      <Container>
        <div className="navbar-translate">
          <NavbarBrand 
            href="#home"
            onClick={(e) => { e.preventDefault(); scrollToSection("home"); }}
            className="cursor-pointer"
          >
            <img src="icon.png" className="invert"style={{ filter: 'invert(1)' }}alt="Logo" />
          </NavbarBrand>
          <button
            aria-expanded={collapseOpen}
            className="navbar-toggler"
            onClick={toggleCollapse}
          >
            <span className="navbar-toggler-bar bar1" />
            <span className="navbar-toggler-bar bar2" />
            <span className="navbar-toggler-bar bar3" />
          </button>
        </div>
        <Collapse
          className={"justify-content-end " + collapseOut}
          navbar
          isOpen={collapseOpen}
          onExiting={onCollapseExiting}
          onExited={onCollapseExited}
        >
          <div className="navbar-collapse-header">
            <Row>
              <Col className="collapse-brand" xs="6">
                <img src="icon.png" className="invert" style={{ filter: 'invert(1)' }} alt="Logo" />
              </Col>
              <Col className="collapse-close text-right" xs="6">
                <button
                  aria-expanded={collapseOpen}
                  className="navbar-toggler"
                  onClick={toggleCollapse}
                >
                  <i className="tim-icons icon-simple-remove" />
                </button>
              </Col>
            </Row>
          </div>
          <Nav navbar>
            <NavItem className="p-0">
              <NavLink
                data-placement="bottom"
                href="https://github.com/NoahBPeterson"
                rel="noopener noreferrer"
                target="_blank"
                className="hover:text-white/80 transition-colors duration-200"
              >
                <i className="fab fa-github" />
                <p className="d-lg-none d-xl-none">GitHub</p>
              </NavLink>
            </NavItem>
            <NavItem className="p-0">
              <NavLink
                data-placement="bottom"
                href="https://www.linkedin.com/in/noah-peterson-a1b0a1149/"
                rel="noopener noreferrer"
                target="_blank"
                className="hover:text-white/80 transition-colors duration-200"
              >
                <i className="fab fa-linkedin" />
                <p className="d-lg-none d-xl-none">LinkedIn</p>
              </NavLink>
            </NavItem>
            <NavItem>
              <Button
                className={`nav-link d-lg-block ${activeSection === 'interpreter' ? 'active' : ''}`}
                color="primary"
                onClick={() => scrollToSection("interpreter")}
              >
                <i className="tim-icons icon-spaceship" /> Lox Interpreter
              </Button>
            </NavItem>
            <NavItem>
              <Button
                className={`nav-link d-lg-block ${activeSection === 'projects' ? 'active' : ''}`}
                color="default"
                onClick={() => scrollToSection("projects")}
              >
                <i className="fas fa-cubes" /> Projects
              </Button>
            </NavItem>
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
}
