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
// reactstrap components
import {
	Container,
	Row,
	Col,
	Card,
	CardHeader,
	CardBody,
	Button,
	FormGroup,
	Form,
	Input,
	UncontrolledTooltip,
} from "reactstrap";


export default function Contact() {
	
	return (
<		 section className="section">
			<Container>
				<Row>
					<Col md="6">
						<Card className="card-plain">
							<CardHeader>
								<h1 className="profile-title text-left">Contact</h1>
								{/*<h5 className="text-on-back">03</h5>*/}
							</CardHeader>
							<CardBody>
								<Form>
									<Row>
										<Col md="6">
											<FormGroup>
											<label>Your Name</label>
											<Input placeholder="First Last" type="text" />
											</FormGroup>
										</Col>
										<Col md="6">
											<FormGroup>
											<label>Email address</label>
											<Input placeholder="your@email.com" type="email" />
											</FormGroup>
										</Col>
									</Row>
									<Row>
										<Col md="6">
											<FormGroup>
												<label>Phone</label>
												<Input placeholder="(000)-000-0000" type="text" />
											</FormGroup>
										</Col>
										<Col md="6">
											<FormGroup>
												<label>Company</label>
												<Input placeholder="Company, Inc." type="text" />
											</FormGroup>
										</Col>
									</Row>
									<Row>
										<Col md="12">
											<FormGroup>
												<label>Message</label>
												<Input placeholder="Hello there!" type="textarea" />
											</FormGroup>
										</Col>
									</Row>
									<Button
										className="btn-round float-right"
										color="primary"
										data-placement="right"
										id="tooltip341148792"
										type="button"
										>
											Send message
									</Button>
									<UncontrolledTooltip
										delay={0}
										placement="right"
										target="tooltip341148792"
										>
											Can't wait for your message
									</UncontrolledTooltip>
								</Form>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</Container>
		</section>
	);
}
