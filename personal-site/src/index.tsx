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
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "assets/css/nucleo-icons.css";
import "assets/scss/blk-design-system-react.scss?v=1.2.0";
import "assets/demo/demo.css";
import "./index.css";

import App from "./App";
import LoxInterpreter from "./views/examples/LoxInterpreter";
import UcodeLsp from "./views/examples/UcodeLsp";

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

const tree = (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App /> } />
      <Route
        path="/loxInterpreter"
        element={<LoxInterpreter /> }
      />
      <Route
        path="/ucode"
        element={<UcodeLsp /> }
      />
    </Routes>
  </BrowserRouter>
);

// When prerendered HTML is present, hydrate over it. When the container is
// empty (dev server, or an unrendered route), fall back to a fresh render.
if (container.hasChildNodes()) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}