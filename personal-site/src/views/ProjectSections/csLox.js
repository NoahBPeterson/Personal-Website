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
import classnames from "classnames";
// reactstrap components
import {
	TabContent,
	TabPane,
	Container,
	Row,
	Col,
	Card,
	CardHeader,
	CardBody,
	Nav,
	NavItem,
	NavLink,
} from "reactstrap";

import LoxInterpreterComponent from "../examples/LoxInterpreterComponent.js";

export default function CsLox() {
	const [iconTabs, setIconsTabs] = React.useState(1);
	const [textTabs, setTextTabs] = React.useState(4);
	return (
	<div className="section section-tabs">
		<Container>
		<div className="title">
			<h3 className="mb-3">csLox</h3>
		</div>
		<Row>
			<Col className="ml-auto mr-auto" md="10" xl="6">
				<Card>
					<CardHeader>
						<Nav className="nav-tabs-info" role="tablist" tabs>
							<NavItem>
								<NavLink
									className={classnames({
									active: textTabs === 4,
									})}
									onClick={(e) => setTextTabs(4)}
									style={{cursor: "pointer"}}
								>
									Overview
								</NavLink>
							</NavItem>
							<NavItem>
								<NavLink
									className={classnames({
									active: textTabs === 5,
									})}
									onClick={(e) => setTextTabs(5)}
									style={{cursor: "pointer"}}
								>
									Language Details
								</NavLink>
							</NavItem>
							<NavItem>
								<NavLink
									className={classnames({
									active: textTabs === 6,
									})}
									style={{cursor: "pointer"}}
									onClick={(e) => setTextTabs(6)}
									>
									Website Demo
								</NavLink>
							</NavItem>
						</Nav>
					</CardHeader>
					<CardBody>
						<TabContent className="tab-space" activeTab={"link" + textTabs}>
							<TabPane tabId="link4">
								<p>
									csLox is an interpreter for the Lox programming language.
									It is a treewalk interpreter, which executes code by traversing the abstract syntax tree.

								</p>
							</TabPane>
							<TabPane tabId="link5">
								<p>
									Lox is a dynamically typed functional programming language with support for objects. Variables
									are statically scoped, and can be one of four types: a floating point number, a boolean, a string,
									and nil.
								</p>
								<p>
									A full language specification is available here:
									<a href="https://github.com/NoahBPeterson/csLox">
										&nbsp;
										<i className="fab fa-github">NoahBPeterson/csLox</i>		
									</a>
								</p>
							</TabPane>
							<TabPane tabId="link6">
								<p>
									The Lox interpreter program is run by a Node.js application. This app accepts program text 
									given to it from the demo, which is put into a named file that is used as an argument when 
									running the interpreter. The output of the interpreter is then sent to the website. It times 
									out after five seconds to avoid instances of the interpreter never exiting.
								</p>
							</TabPane>
						</TabContent>
					</CardBody>
				</Card>
			</Col>
			<Col className="ml-auto mr-auto" md="10" xl="6">
				<LoxInterpreterComponent />
			</Col>
		</Row>
		</Container>
	</div>
	);
}
