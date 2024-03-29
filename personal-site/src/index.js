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
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "assets/css/nucleo-icons.css";
import "assets/scss/blk-design-system-react.scss?v=1.2.0";
import "assets/demo/demo.css";

import Index from "views/Index.js";
import LoxInterpreter from "views/examples/LoxInterpreter";
import Projects from "views/Projects.js";

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <BrowserRouter>
  	<Routes>
	  	<Route path="/" element={<Index /> } />
		<Route
			path="/loxInterpreter"
			element={<LoxInterpreter /> }
		/>
		<Route
			path="/projects"
			element={<Projects /> }
		/>
	</Routes>
  </BrowserRouter>
);