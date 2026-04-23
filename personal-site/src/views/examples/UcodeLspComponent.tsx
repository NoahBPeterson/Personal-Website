import React from "react";
import { Card, CardBody, Row, Col } from "reactstrap";

// Monaco is ~1MB gzipped; load it lazily so the initial bundle stays small.
const UcodeEditor = React.lazy(() => import("./UcodeEditor"));

function apiBase(): string {
	const hostname = window.location.hostname || "localhost";
	const protocol = window.location.protocol;
	if (window.location.port !== "" && window.location.port !== "80" && window.location.port !== "443") {
		return `${protocol}//${hostname}:5001`;
	}
	return `${protocol}//${hostname}`;
}

export default function UcodeLspComponent() {
	const [programText, setProgramText] = React.useState('// Try hovering over functions to see types!\nlet double = x => x * 2;\nlet nums = [1, 2, 3, 4, 5];\n\nlet doubled = map(nums, double);\nlet evens = filter(nums, x => x % 2 == 0);\n\nprintf("Doubled: %s\\n", join(", ", map(doubled, x => "" + x)));\nprintf("Evens: %s\\n", join(", ", map(evens, x => "" + x)));');
	const [programExamples, setProgramExamples] = React.useState<JSX.Element[]>([]);
	const fetchedRef = React.useRef(false);

	const getExamples = async () => {
		if (fetchedRef.current) return;
		fetchedRef.current = true;
		const result = await fetch(`${apiBase()}/ucodeExamples`, {
			method: 'get',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		const body = await result.json();
		const items: JSX.Element[] = [];
		for (const [index, value] of body.entries()) {
			items.push(
				<option
					style={{ cursor: 'pointer' }}
					value={index}
					key={index}
					onTouchStart={() => getExampleText(index)}
					onClick={() => getExampleText(index)}
				>
					{value}
				</option>
			);
		}
		setProgramExamples(items);
	};

	const getExampleText = async (chosenExample: number) => {
		const result = await fetch(`${apiBase()}/ucodeExamples/${chosenExample}`, {
			method: 'post',
		});
		const body = await result.text();
		setProgramText(body);
	};

	React.useEffect(() => { getExamples(); }, []);

	return (
		<>
			<Card>
				<CardBody>
					<React.Suspense
						fallback={
							<div
								style={{
									height: "400px",
									width: "100%",
									border: "1px solid #333",
									borderRadius: 8,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: "#666",
								}}
							>
								Loading editor…
							</div>
						}
					>
						<UcodeEditor value={programText} onChange={setProgramText} />
					</React.Suspense>
				</CardBody>
			</Card>
			<Row>
				<Col />
				<Col md="6" className="d-flex justify-content-end">
					<select
						name="options"
						onClick={() => getExamples()}
						onChange={e => { const v = parseInt(e.target.value); if (v >= 0) getExampleText(v); }}
						className="form-control font-mono"
						style={{
							background: "#1a1a1a",
							color: "#e5e5e5",
							borderColor: "#8c3db9",
							border: "0.0625rem solid",
							padding: "0.75rem 1rem",
							fontSize: "1.1rem",
							cursor: "pointer",
							WebkitFontSmoothing: "antialiased",
							MozOsxFontSmoothing: "grayscale",
							fontFeatureSettings: "'ss01' on, 'ss02' on, 'ss03' on, 'ss04' on, 'ss05' on",
							height: "3.5rem",
							display: "flex",
							alignItems: "center",
							width: "auto",
							minWidth: "200px"
						}}
						aria-labelledby="navbarDropdownMenuLink"
					>
						<option value={-1} key={-1} style={{
							background: "#1a1a1a",
							color: "#e5e5e5",
							padding: "0.75rem 1rem",
							height: "3rem",
							display: "flex",
							alignItems: "center"
						}}>Example Programs</option>
						{programExamples.map(option => React.cloneElement(option, {
							style: {
								background: "#1a1a1a",
								color: "#e5e5e5",
								cursor: "pointer",
								padding: "0.75rem 1rem",
								height: "3rem",
								display: "flex",
								alignItems: "center"
							}
						}))}
					</select>
				</Col>
			</Row>
		</>
	);
}



