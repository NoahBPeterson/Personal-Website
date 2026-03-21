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

import UcodeEditor from "../examples/UcodeEditor";
import UcodeLspComponent from "../examples/UcodeLspComponent";

function apiBase(): string {
	const hostname = window.location.hostname || "localhost";
	const protocol = window.location.protocol;
	if (window.location.port === "5173") {
		return `${protocol}//${hostname}:5001`;
	}
	return `${protocol}//${hostname}`;
}

export default function UcodeLspSection() {
	const [textTabs, setTextTabs] = React.useState(4);
	const [programText, setProgramText] = React.useState('import { create } from \"socket\";\nprint(\"Hello ucode\");');
	const [programExamples, setProgramExamples] = React.useState<JSX.Element[]>([]);
	const [exampleText, setExampleText] = React.useState('');

	const getExamples = async () => {
		if(programExamples.length > 0) return;
		const result = await fetch(`${apiBase()}/ucodeExamples`, {
			method: 'get',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		const body = await result.json();
		const items = [] as JSX.Element[];
		for(const [index, value] of body.entries()) {
			items.push(
				<option 
					style={{cursor:'pointer'}}
					value={index} key={index}
					onTouchStart={() => getExampleText(index)}
					onClick={() => getExampleText(index)}>
						{value}
				</option>
			)
		}
		setProgramExamples(items);
	}

	const getExampleText = async (chosenExample: number) => {
		const result = await fetch(`${apiBase()}/ucodeExamples/${chosenExample}`, {
			method: 'post',
			body: JSON.stringify({ string: exampleText }),
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			}
		});
		const body = await result.json();
		setProgramText(body);
	}

	React.useEffect(() => { getExamples(); }, []);
	return (
	<div className="section section-tabs">
		<Container>
			<div className="title">
				<h1 className="mb-3">
					ucode Language Server Protocol (LSP)
				</h1>
			</div>
			<Row>
				{/* LEFT: Tabs and descriptive content */}
				<Col className="ml-auto mr-auto" md="10" xl="6">
					<Card>
						<CardHeader>
							<Nav className="nav-tabs-info" role="tablist" tabs>
								<NavItem>
									<NavLink
										className={`${textTabs === 4 ? 'active' : ''}`}
										onClick={(e) => setTextTabs(4)}
										style={{cursor: "pointer"}}
									>
										Overview
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink
										className={`${textTabs === 5 ? 'active' : ''}`}
										onClick={(e) => setTextTabs(5)}
										style={{cursor: "pointer"}}
									>
										Features
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink
										className={`${textTabs === 6 ? 'active' : ''}`}
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
										A TypeScript-based Language Server for the <code>ucode</code> scripting language with autocompletion, diagnostics, go-to definition, and basic type inference.
									</p>
									<p>
										Source repository:&nbsp;
										<a href="https://github.com/noahBPeterson/ucode-lsp">
											<i className="fab fa-github">
												<i style={{fontSize: "0.5rem"}}>&nbsp;</i>
												NoahBPeterson/ucode-lsp
											</i>
										</a>
									</p>
								</TabPane>
								<TabPane tabId="link5">
									<ul>
										<li>Context-aware completions for builtins and modules</li>
										<li>Diagnostics with precise ranges and basic type inference</li>
										<li>Go to Definition and Hover information</li>
										<li>Optimized with caching</li>
									</ul>
								</TabPane>
								<TabPane tabId="link6">
									<p>
										This website demo runs the real ucode LSP in the backend and connects over WebSocket.
									</p>
								</TabPane>
							</TabContent>
						</CardBody>
					</Card>
				</Col>

				{/* RIGHT follows the csLox layout by rendering the unified component */}
				<Col className="ml-auto mr-auto" md="10" xl="6">
					<UcodeLspComponent />
				</Col>
			</Row>
		</Container>
	</div>
	);
}


