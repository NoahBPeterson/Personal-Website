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
import React, { useState } from "react";
import {Button, Card, CardBody, Row, Col } from "reactstrap";
import SyntaxHighlighter from '../../components/SyntaxHighlighter/SyntaxHighlighter';

export default function LoxInterpreterComponent() {
	const [programText, setProgramText] = useState('print "Hello, world!";');
	const [programResult, setProgramResult] = useState('');
	const [programExamples, setProgramExamples] = useState<JSX.Element[]>([]);
	const [exampleText, setExampleText] = useState('');
	
	const runProgram = async () => {
		const result = await fetch(`http://noahpeterson.me:5000/loxOutput`, {
			method: 'post',
			body: JSON.stringify({ text: programText }),
			headers: {
				'Content-Type': 'application/json',
			}
		});
		const body = await result.json();
		setProgramResult(body);
	}
	
	const getExamples = async () => {
		if(programExamples.length > 0) return;
		const result = await fetch('http://noahpeterson.me:5000/loxExamples', {
			method: 'get',
			headers: {
			'Content-Type': 'application/json',
			}
		});
		
		const body = await result.json();
		const items = [];
		for(const [index, value] of body.entries ()) {
			
			items.push(
				<option 
					style={{cursor:'pointer'}}
					value={index} key={index}
					onTouchStart={() => getExampleText(index)}
					onChange={() => function(){}}
					onClick={() => getExampleText(index)}>
						{value}
				</option>
			)
		}
		setProgramExamples(items);
	}

	const getExampleText = async (chosenExample: number) => {
		const result = await fetch('http://noahpeterson.me:5000/loxExamples/'+chosenExample, {
			method: 'post',
			body: JSON.stringify(
			{ 
				string: exampleText,
			}),
			headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			}
		});
		const body = await result.json();
		setProgramText(body);
	}

	getExamples();

	return (
	<>
		<Card>
			<CardBody>
				<SyntaxHighlighter 
					sourceCode={programText} 
					onChange={setProgramText}
				/>
			</CardBody>
		</Card>
		<Card className="mt-3">
			<CardBody>
				<textarea 
					className="form-control font-mono"
					style={{
						borderColor: "#8c3db9", 
						WebkitFilter: "brightness(1000%)", 
						border: "0.0625rem solid", 
						padding: "0.625rem", 
						fontSize: "1.1rem", 
						lineHeight: "1.5",
						height: "15rem",
						zIndex: 900,
						letterSpacing: "-0.01em",
						fontFeatureSettings: "'ss01' on, 'ss02' on, 'ss03' on, 'ss04' on, 'ss05' on",
						WebkitFontSmoothing: "antialiased",
						MozOsxFontSmoothing: "grayscale",
						background: "transparent",
						color: "#e5e5e5"
					}}
					id="output"
					readOnly
					value={programResult}
				/>
			</CardBody>
		</Card>
		<Row>
			<Col>
				<Button className="btn-round" color="primary" size="lg" onClick={() => runProgram()}>
					Run
				</Button>
			</Col>
			<Col md="6" className="d-flex justify-content-end">
				<select  
					name="options"
					onClick={() => getExamples()}
					onChange={e => {getExamples(); getExampleText(parseInt(e.target.value));}}
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
