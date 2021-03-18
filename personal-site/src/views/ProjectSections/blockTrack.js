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


export default function BlockTrack() {
	const [textTabs, setTextTabs] = React.useState(4);
	return (
	<div className="section section-tabs">
		<Container>
			<div className="title">
				<h1 className="mb-3" >
					<img src={require("assets/img/BlockTrackIcon.png").default} />
					<i style={{fontSize: "1rem"}}>&nbsp;</i>
					BlockTrack
				</h1>
			</div>
			<Row>
				<Col className="ml-auto mr-auto" md="10" xl="6">
					<iframe width="560" height="315" 
						src="https://www.youtube.com/embed/k2hY17WVuaU" frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen/>
				</Col>
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
										Implementation Details
									</NavLink>
								</NavItem>
							</Nav>
						</CardHeader>
						<CardBody>
							<TabContent className="tab-space" activeTab={"link" + textTabs}>
								<TabPane tabId="link4">
									<p>
										BlockTrack is an administrative tool for use in Minecraft: Bedrock Edition servers.
										It gives administrators the ability to track block placement history and user
										history to combat bad behavior.
									</p>
								</TabPane>
								<TabPane tabId="link5">
									<p>
										There are event handlers triggered when blocks are placed or broken. This adds a
										new history record with the player's username, the datetime of the action, and the
										location of the block. The database calls are done asynchronously using the server
										scheduler to avoid making blocking I/O calls on the main thread.
											
									</p>
									<p>
										The source repository is available here:
										<a href="https://github.com/NoahBPeterson/BlockTrack">
											&nbsp;
											<i className="fab fa-github">
												<i style={{fontSize: "0.5rem"}}>
													&nbsp;
												</i>
												NoahBPeterson/BlockTrack
											</i>		
										</a>
									</p>
									<p>
										The plugin is available here:&nbsp;
										<a href="https://cloudburstmc.org/resources/blocktrack.477/">
											BlockTrack - CloudBurstMC
										</a>
									</p>
								</TabPane>
							</TabContent>
						</CardBody>
					</Card>
				</Col>
			</Row>
		</Container>
	</div>
	);
}
