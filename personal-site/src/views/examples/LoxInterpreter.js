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
import React, { useState } from "react";
import classnames from "classnames";
import { Link } from "react-router-dom";
// reactstrap components
import {Button, Card, CardHeader, CardBody, CardFooter, CardTitle, Label, FormGroup,
  Form, Input, InputGroupAddon, InputGroupText, InputGroup, Container, Row, Col,DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
} from "reactstrap";
import {
	Collapse,
	NavbarBrand,
	Navbar,
	NavItem,
	NavLink,
	Nav,
  } from "reactstrap";

// core components
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footer/Footer.js";
import LoxBackground from "../../components/Backgrounds/LoxBackground.js"

export default function LoxInterpreter() {

  const [fullNameFocus, setFullNameFocus] = React.useState(false);
  const [emailFocus, setEmailFocus] = React.useState(false);
  const [passwordFocus, setPasswordFocus] = React.useState(false);


  const [programText, setProgramText] = useState('');
  const [programResult, setProgramResult] = useState('');
  const [programExamples, setProgramExamples] = useState('');
  const [exampleText, setExampleText] = useState('');
  

  
  const runProgram = async () => {
      const result = await fetch(`http://localhost:5000/loxOutput`, {
          method: 'post',
          body: JSON.stringify({ text: programText }),
          headers: {
              'Content-Type': 'application/json',
          }
      });
      const body = await result.json();
	  setProgramResult(body);
  }
  
  const getExamples = async () => {
    const result = await fetch('http://localhost:5000/loxExamples', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      }
    });
	const body = await result.json();
	console.log(body);
	const items = [];
	for(const [index, value] of body.entries ()) {
		items.push(
				<div>
					<DropdownItem key={index}onClick={() => getExampleText(index)} tag={Link} >
						{value}
					</DropdownItem>
				</div>
			);     
			console.log(value);           
	}
	console.log(items);
    setProgramExamples(items);
  }

  const getExampleText = async (chosenExample) => {
    const result = await fetch('http://localhost:5000/loxExamples', {
      method: 'post',
      body: JSON.stringify({ text: exampleText }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const body = await result.json();
    setProgramText(body);
  }

  return (
    <>
      <IndexNavbar />
      <div className="wrapper">
        <div className="page-header">
          <div className="page-header-image" />
          <div className="content">
            <Container>
              <Row>
                <Col className="offset-lg-0 offset-md-3" lg="3" md="4">
                  <LoxBackground />
                  <Card className="card-register">
                    <CardHeader>
                      <CardTitle tag="h4" style={{WebkitFilter: "invert(100%)", textAlign: "center"}}> cslox</CardTitle>
                    </CardHeader>
                    <CardBody>
                    </CardBody>
                    <CardFooter>
                      <Button className="btn-round" color="primary" size="lg">
                        Get Started
                      </Button>
                    </CardFooter>
                  </Card>
                </Col>
                <Col>
					<Card>
						<CardBody>
							<textarea 
							className="form-control-plaintext" 
							style={{height: '10rem', WebkitFilter: "brightness(1000%)", border: "0.0625rem solid", padding: "0.625rem"}}
							id="input" 
							rows={10} cols={50} 
							onChange={(event) => setProgramText(event.target.value)} />
						</CardBody>
						<CardBody style={{borderColor: "#8c3db9"}}>
							<textarea 
							className="form-control" 
							style={{borderColor: "#8c3db9", WebkitFilter: "brightness(1000%)", border: "0.0625rem solid", padding: "0.625rem"}}
							id="output" rows={3} cols={50} value={programResult}/>
						</CardBody>
					</Card>

							<Button className="btn-round" color="primary" size="lg" onClick={() => runProgram()}>
								Run
							</Button>
			</Col>
			<Col>
				<Navbar className="bg-primary" expand="lg" >
					<Container>
						<UncontrolledDropdown nav>
								<DropdownToggle
									aria-expanded={false}
									aria-haspopup={true}
									caret
									color="default"
									data-toggle="dropdown"
									id="navbarDropdownMenuLink"
									nav
									onClick={() => getExamples()}
								>
								<i className="fa fa-cogs d-lg-none d-xl-none"></i>
								<p style={{WebkitFilter: "brightness(1000%)"}}>Examples</p>
								
								</DropdownToggle>
								<DropdownMenu className="dropdown-with-icons" aria-labelledby="navbarDropdownMenuLink">
									{programExamples}
								</DropdownMenu>
						</UncontrolledDropdown>
					</Container>
				</Navbar>
			</Col>

              </Row>

            </Container>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
