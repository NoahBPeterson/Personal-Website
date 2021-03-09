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
import {Button, Card, CardHeader, CardBody,
		CardFooter, CardTitle, Container, Row, Col } from "reactstrap";

// core components
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footer/Footer.js";

export default function LoxInterpreter() {
	const [squares1to6, setSquares1to6] = useState("");
	const [squares7and8, setSquares7and8] = useState("");
	const [programText, setProgramText] = useState('print "Hello, world!";');
	const [programResult, setProgramResult] = useState('');
	const [programExamples, setProgramExamples] = useState('');
	const [exampleText, setExampleText] = useState('');

	React.useEffect(() => {
		document.body.classList.toggle("register-page");
		document.documentElement.addEventListener("mousemove", followCursor);
		// Specify how to clean up after this effect:
		return function cleanup() {
			document.body.classList.toggle("register-page");
			document.documentElement.removeEventListener("mousemove", followCursor);
		};
	},[]);

	const followCursor = (event) => {
	let posX = event.clientX - window.innerWidth / 2;
	let posY = event.clientY - window.innerWidth / 6;
	setSquares1to6(
		"perspective(500px) rotateY(" +
		posX * 0.05 +
		"deg) rotateX(" +
		posY * -0.05 +
		"deg)"
	);
	setSquares7and8(
		"perspective(500px) rotateY(" +
		posX * 0.02 +
		"deg) rotateX(" +
		posY * -0.02 +
		"deg)"
		);
	};
	
	const runProgram = async () => {
		const result = await fetch(`http://localhost:5000/loxOutput`, {
			method: 'post',
			body: JSON.stringify({ text: programText }),
			headers: {
				'Content-Type': 'application/json',
			}
		});
		const body = await result.json();
		setProgramResult(body.trim());
	}
	
	const getExamples = async () => {
	const result = await fetch('http://localhost:5000/loxExamples', {
		method: 'get',
		headers: {
		'Content-Type': 'application/json',
		}
	});
	const body = await result.json();
	const items = [];
	for(const [index, value] of body.entries ()) {
		
		items.push(
			<option value={index} key={index} onClick={() => getExampleText(index)}>{value}</option>
		)
	}
	setProgramExamples(items);
	}

	const getExampleText = async (chosenExample) => {
	const result = await fetch('http://localhost:5000/loxExamples/'+chosenExample, {
		method: 'post',
		body: JSON.stringify(
		{ 
			string: exampleText,
		}),
		headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
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
				<Container style={{zIndex: 800}}>
					<Row>
						<Col className="offset-lg-0 offset-md-3" lg="3" md="4">
						<div
							className="square square-7"
							id="square7"
							style={{ transform: squares7and8 }}
							/>
						<div
							className="square square-8"
							id="square8"
							style={{ transform: squares7and8 }}
							/>
							<Card className="card-register">
								<CardHeader>
									<CardTitle tag="h4" style={{WebkitFilter: "invert(100%)", textAlign: "center"}}> cslox</CardTitle>
								</CardHeader>
								<CardBody />
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
										style={{height: '10rem', WebkitFilter: "brightness(1000%)", border: "0.0625rem solid", padding: "0.625rem", fontSize: "1rem", zIndex: 900}}
										id="input" 
										rows={10} cols={60} 
										value= {programText}
										onChange={(event) => setProgramText(event.target.value)} />
								</CardBody>
								<CardBody style={{borderColor: "#8c3db9"}}>
									<textarea 
										className="form-control" 
										style={{borderColor: "#8c3db9", WebkitFilter: "brightness(1000%)", border: "0.0625rem solid", padding: "0.625rem", fontSize: "1rem", zIndex: 900}}
										id="output" rows={3} cols={50} value={programResult}/>
								</CardBody>
							</Card>
							<Row>
								<Col>
									<select onClick={() => getExamples()} className="dropdown-with-icons" aria-labelledby="navbarDropdownMenuLink">
										<option value={-1} key={-1}>Example Programs</option>
										{programExamples}
									</select>
								</Col>
								<Col>
									<Button className="btn-round" color="primary" size="lg" onClick={() => runProgram()}>
										Run
									</Button>
								</Col>
							</Row>
									
									
						</Col>
					</Row>

					<div className="register-bg" />
					<div className="square square-1"
						id="square1"
						style={{ transform: squares1to6 }}
						/>
					<div className="square square-2"
						id="square2"
						style={{ transform: squares1to6 }}
						/>
					<div className="square square-3"
						id="square3"
						style={{ transform: squares1to6 }}
						/>
					<div className="square square-4"
						id="square4"
						style={{ transform: squares1to6 }}
						/>
					<div className="square square-5"
						id="square5"
						style={{ transform: squares1to6 }}
						/>
					<div className="square square-6"
						id="square6"
						style={{ transform: squares1to6 }}
						/>
				</Container>

			</div>
		
		</div>
		
		<Footer />
		
	</div>
	
	</>
);
}
