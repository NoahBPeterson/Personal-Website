import React from "react";
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

export default function RepetitionPro() {
	const [textTabs, setTextTabs] = React.useState(1);
	return (
	<div className="section section-tabs">
		<Container>
			<div className="title">
				<h1 className="mb-3">RepetitionPro</h1>
			</div>
			<Row>
				<Col className="ml-auto mr-auto" md="10" xl="6">
					<Card>
						<CardHeader>
							<Nav className="nav-tabs-info" role="tablist" tabs>
								<NavItem>
									<NavLink
										className={`${textTabs === 1 ? 'active' : ''}`}
										onClick={() => setTextTabs(1)}
										style={{cursor: "pointer"}}
									>
										Overview
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink
										className={`${textTabs === 2 ? 'active' : ''}`}
										onClick={() => setTextTabs(2)}
										style={{cursor: "pointer"}}
									>
										Features
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink
										className={`${textTabs === 3 ? 'active' : ''}`}
										onClick={() => setTextTabs(3)}
										style={{cursor: "pointer"}}
									>
										Tech Stack
									</NavLink>
								</NavItem>
							</Nav>
						</CardHeader>
						<CardBody>
							<TabContent className="tab-space" activeTab={"link" + textTabs}>
								<TabPane tabId="link1">
									<p>
										A web-based spaced repetition platform built as a modern alternative to Anki.
										Designed with sensible defaults so you can start studying immediately
										without tweaking dozens of settings.
									</p>
									<p>
										Try it at{' '}
										<a href="https://repetitionpro.com" target="_blank" rel="noopener noreferrer">
											repetitionpro.com
										</a>
									</p>
								</TabPane>
								<TabPane tabId="link2">
									<ul>
										<li>Import existing Anki decks (.apkg format)</li>
										<li>AI-assisted deck generation from topics or prompts</li>
										<li>Rapid card creation with keyboard shortcuts and batch editing</li>
										<li>Spaced repetition with Again/Hard/Good/Easy rating</li>
										<li>JWT authentication with user accounts</li>
										<li>Optimized API with pre-calculated card state counts</li>
									</ul>
								</TabPane>
								<TabPane tabId="link3">
									<ul>
										<li>Rust + Axum backend with PostgreSQL</li>
										<li>TypeScript + React frontend with Radix UI</li>
										<li>JWT-based authentication</li>
										<li>Comprehensive test suite (Vitest + React Testing Library)</li>
									</ul>
								</TabPane>
							</TabContent>
						</CardBody>
					</Card>
				</Col>
				<Col className="ml-auto mr-auto" md="10" xl="6">
					<Card>
						<CardBody style={{ padding: 0, overflow: "hidden", borderRadius: "8px" }}>
							<a href="https://repetitionpro.com" target="_blank" rel="noopener noreferrer">
								<img
									src="/repetitionpro.png"
									alt="RepetitionPro Dashboard"
									style={{
										width: "100%",
										display: "block",
										borderRadius: "8px 8px 0 0",
									}}
								/>
							</a>
							<div className="text-center" style={{ padding: "1rem" }}>
								<a
									href="https://repetitionpro.com"
									target="_blank"
									rel="noopener noreferrer"
									className="btn btn-primary btn-round"
								>
									Visit RepetitionPro
								</a>
							</div>
						</CardBody>
					</Card>
				</Col>
			</Row>
		</Container>
	</div>
	);
}
