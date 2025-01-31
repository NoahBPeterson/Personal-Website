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
// reactstrap components
import {Button, Card, CardHeader, CardBody,
		CardFooter, CardTitle, Container, Row, Col } from "reactstrap";

// core components
import IndexNavbar from "../../components/Navbars/IndexNavbar.tsx";
import Footer from "../../components/Footer/Footer.tsx";
import LoxInterpreterComponent from "./LoxInterpreterComponent.tsx";

export default function LoxInterpreter() {
	const [squares1to6, setSquares1to6] = useState("");
	const [squares7and8, setSquares7and8] = useState("");

	React.useEffect(() => {
		document.body.classList.toggle("register-page");
		document.documentElement.addEventListener("mousemove", followCursor);
		// Specify how to clean up after this effect:
		return function cleanup() {
			document.body.classList.toggle("register-page");
			document.documentElement.removeEventListener("mousemove", followCursor);
		};
	},[]);

	const followCursor = (event: MouseEvent) => {
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

	return (
	<>
		<IndexNavbar activeSection="LoxInterpreter" />
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
									<CardTitle tag="h4" style={{WebkitFilter: "invert(100%)", textAlign: "center"}}> csLox</CardTitle>
								</CardHeader>
								<CardBody>
									<p>
										A full language specification is available at the GitHub repository:
										<a href="https://github.com/NoahBPeterson/csLox">
											&nbsp;
											<i className="fab fa-github"><i style={{fontSize: "0.5rem"}}>&nbsp;</i>NoahBPeterson/csLox</i>		
										</a>
									</p>
								</CardBody>
							</Card>
						</Col>
						<Col>
							<LoxInterpreterComponent />
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
