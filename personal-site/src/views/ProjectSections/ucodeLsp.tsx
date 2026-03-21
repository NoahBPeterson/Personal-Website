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
	if (window.location.port !== "" && window.location.port !== "80" && window.location.port !== "443") {
		return `${protocol}//${hostname}:5001`;
	}
	return `${protocol}//${hostname}`;
}

export default function UcodeLspSection() {
	const [textTabs, setTextTabs] = React.useState(4);
	const [programText, setProgramText] = React.useState('// Try hovering over functions to see types!\nlet double = x => x * 2;\nlet nums = [1, 2, 3, 4, 5];\n\nlet doubled = map(nums, double);\nlet evens = filter(nums, x => x % 2 == 0);\n\nprintf(\"Doubled: %s\\n\", join(\", \", map(doubled, x => \"\" + x)));\nprintf(\"Evens: %s\\n\", join(\", \", map(evens, x => \"\" + x)));');
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
										A full-featured Language Server for the <code>ucode</code> scripting language, built in TypeScript. Provides a VS Code-like editing experience with real-time diagnostics, intelligent completions, and type-aware code analysis.
									</p>
									<p>
										Available as a{' '}
										<a href="https://marketplace.visualstudio.com/items?itemName=noahbpeterson.ucode-lsp">
											VS Code extension
										</a>
										{', '}
										<a href="https://www.npmjs.com/package/ucode-lsp">
											npm package
										</a>
										, and on{' '}
										<a href="https://github.com/noahBPeterson/ucode-lsp">
											<i className="fab fa-github">
												<i style={{fontSize: "0.5rem"}}>&nbsp;</i>
												GitHub
											</i>
										</a>
									</p>
								</TabPane>
								<TabPane tabId="link5">
									<ul>
										<li>Flow-sensitive type inference with union types and type narrowing</li>
										<li>Context-aware completions for 15+ modules, builtins, and user code</li>
										<li>Quick Fix code actions with type guard suggestions</li>
										<li>Cross-file go-to-definition and hover with full type signatures</li>
										<li>JSDoc annotation support with <code>@param</code> and <code>@returns</code></li>
										<li>Control flow graph analysis for unreachable code detection</li>
									</ul>
								</TabPane>
								<TabPane tabId="link6">
									<p>
										This live demo runs the real ucode LSP server and connects via WebSocket. Try hovering over functions, triggering completions with <code>Ctrl+Space</code>, or clicking the lightbulb for Quick Fixes.
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


