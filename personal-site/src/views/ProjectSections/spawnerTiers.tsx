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
import SpawnerTiersIcon from "assets/img/SpawnerTiersIcon.png";


export default function SpawnerTiers() {
	const [textTabs, setTextTabs] = React.useState(4);
	return (
	<div className="section section-tabs">
		<Container>
			<div className="title">
				<h1 className="mb-3" >
					<img src={SpawnerTiersIcon} />
					<i style={{fontSize: "1rem"}}>&nbsp;</i>
					Tiered Spawners
				</h1>
			</div>
			<Row>
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
										Details
									</NavLink>
								</NavItem>
							</Nav>
						</CardHeader>
						<CardBody>
							<TabContent className="tab-space" activeTab={"link" + textTabs}>
								<TabPane tabId="link4">
									<p>
										SpawnerTiers is a plugin for use in Minecraft: Bedrock Edition servers.
										It makes spawners upgradeable, and gives administrators the ability to give players 
										a monster spawner.
									</p>
								</TabPane>
								<TabPane tabId="link5">
									<p>
										The source repository is available here:
										<a href="https://github.com/NoahBPeterson/SpawnerTiers">
											&nbsp;
											<i className="fab fa-github">
												<i style={{fontSize: "0.5rem"}}>
													&nbsp;
												</i>
												NoahBPeterson/SpawnerTiers
											</i>		
										</a>
									</p>
									<p>
										The plugin is available here:&nbsp;
										<a href="https://cloudburstmc.org/resources/spawnertiers.308/">
											SpawnerTiers - CloudBurstMC
										</a>
									</p>
								</TabPane>
							</TabContent>
						</CardBody>
					</Card>
				</Col>
				<Col className="ml-auto mr-auto" md="10" xl="6">
					<iframe width="560" height="315" 
						src="https://www.youtube.com/embed/lR_137aqd8U"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen>
					</iframe>
				</Col>
			</Row>
		</Container>
	</div>
	);
}
