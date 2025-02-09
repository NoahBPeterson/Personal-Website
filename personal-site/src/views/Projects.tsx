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

// core components
import IndexNavbar from "../components/Navbars/IndexNavbar";
import Footer from "../components/Footer/Footer";

// sections for this page/view
import { Container } from "reactstrap";

import BackgroundBubbles from "./ProjectSections/backgroundBubbles";


import CsLox from "./ProjectSections/csLox";
import BlockTrack from "./ProjectSections/blockTrack";
import SpawnerTiers from "./ProjectSections/spawnerTiers";


export default function Project() {
  React.useEffect(() => {
    document.body.classList.toggle("index-page");
    // Specify how to clean up after this effect:
    return function cleanup() {
      document.body.classList.toggle("index-page");
    };
  },[]);
  return (
    <>
      <IndexNavbar />
        <div className="wrapper">
			<div className="page-header header-filter">
				<div className="squares square1" />
				<div className="squares square2" />
				<div className="squares square3" />
				<div className="squares square4" />
				<div className="squares square5" />
				<div className="squares square6" />
				<div className="squares square7" />
				<Container>
					<div className="content-center brand">
						<h1 className="h1-seo">
							Projects
						</h1>
					</div>
				</Container>
			</div>
			<div className="main section section-javascript" id="javascriptComponents">
				<BackgroundBubbles value={0}/>
				<CsLox />
				<BlockTrack />	
				<div className="section section-navbars">
					<BackgroundBubbles value={1}/>
					<SpawnerTiers />
				</div>
			</div>
			<Footer />
      	</div>
    </>
  );
}
