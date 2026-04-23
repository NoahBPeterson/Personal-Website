import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { Route, Routes } from "react-router-dom";

import "assets/css/nucleo-icons.css";
import "assets/scss/blk-design-system-react.scss?v=1.2.0";
import "assets/demo/demo.css";
import "./index.css";

import App from "./App";
import LoxInterpreter from "./views/examples/LoxInterpreter";
import UcodeLsp from "./views/examples/UcodeLsp";

export function render(url: string): string {
	return renderToString(
		<StaticRouter location={url}>
			<Routes>
				<Route path="/" element={<App />} />
				<Route path="/loxInterpreter" element={<LoxInterpreter />} />
				<Route path="/ucode" element={<UcodeLsp />} />
			</Routes>
		</StaticRouter>
	);
}
