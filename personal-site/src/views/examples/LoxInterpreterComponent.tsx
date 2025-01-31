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
				<textarea 
					className="form-control-plaintext font-mono"
					style={{
						fontFamily: "Berkeley Mono",
						height: '10rem', 
						WebkitFilter: "brightness(1000%)", 
						border: "0.0625rem solid", 
						padding: "0.625rem", 
						fontSize: "1.1rem", 
						lineHeight: "1.5",
						zIndex: 900,
						letterSpacing: "-0.01em",
						fontFeatureSettings: "'ss01' on, 'ss02' on, 'ss03' on, 'ss04' on, 'ss05' on",
						WebkitFontSmoothing: "antialiased",
						MozOsxFontSmoothing: "grayscale"
					}}
					id="input" 
					rows={10} cols={60}
					value={programText}
					maxLength={10000}
					onChange={(event) => setProgramText(event.target.value)} />
			</CardBody>
			<CardBody style={{borderColor: "#8c3db9"}}>
				<textarea 
					className="form-control font-mono"
					style={{
						borderColor: "#8c3db9", 
						WebkitFilter: "brightness(1000%)", 
						border: "0.0625rem solid", 
						padding: "0.625rem", 
						fontSize: "1.1rem", 
						lineHeight: "1.5",
						zIndex: 900,
						letterSpacing: "-0.01em",
						fontFeatureSettings: "'ss01' on, 'ss02' on, 'ss03' on, 'ss04' on, 'ss05' on",
						WebkitFontSmoothing: "antialiased",
						MozOsxFontSmoothing: "grayscale"
					}}
					id="output"
					rows={3} cols={50}
					onChange={() => {}}
					value={programResult}/>
			</CardBody>
		</Card>
		<Row>
			<Col>
				<Button className="btn-round" color="primary" size="lg" onClick={() => runProgram()}>
					Run
				</Button>
			</Col>
			<Col style={{top: "1rem"}}>
				<select  
					name="options"
					onClick={() => getExamples()}
					onChange={e => {getExamples(); getExampleText(parseInt(e.target.value));}}
					className="dropdown-with-icons"
					aria-labelledby="navbarDropdownMenuLink"
				>
					<option value={-1} key={-1}>Example Programs</option>
					{programExamples}
				</select>
			</Col>
		</Row>	
	</>
);
}
