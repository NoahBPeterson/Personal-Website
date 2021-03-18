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
	const [programExamples, setProgramExamples] = useState('');
	const [exampleText, setExampleText] = useState('');
	
	const runProgram = async () => {
		const result = await fetch(`http://localhost:5000/loxOutput`, {
			method: 'post',
			body: JSON.stringify({ text: programText }),
			headers: {
				'Content-Type': 'application/json',
			}
		});
		const body = await result.json();
		setProgramResult(body.trim());
	}
	
	const getExamples = async () => {
		const result = await fetch('http://localhost:5000/loxExamples', {
			method: 'get',
			headers: {
			'Content-Type': 'application/json',
			}
		});
		
		const body = await result.json();
		const items = [];
		for(const [index, value] of body.entries ()) {
			
			items.push(
				<option value={index} key={index} onClick={() => getExampleText(index)}>{value}</option>
			)
		}
		setProgramExamples(items);
	}

	const getExampleText = async (chosenExample) => {
		const result = await fetch('http://localhost:5000/loxExamples/'+chosenExample, {
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

	return (
	<>
		<Card>
			<CardBody>
				<textarea 
					className="form-control-plaintext" 
					style={{height: '10rem', WebkitFilter: "brightness(1000%)", border: "0.0625rem solid", padding: "0.625rem", fontSize: "1rem", zIndex: 900}}
					id="input" 
					rows={10} cols={60} 
					value={programText}
					maxLength={10000}
					onChange={(event) => setProgramText(event.target.value)} />
			</CardBody>
			<CardBody style={{borderColor: "#8c3db9"}}>
				<textarea 
					className="form-control" 
					style={{borderColor: "#8c3db9", WebkitFilter: "brightness(1000%)", border: "0.0625rem solid", padding: "0.625rem", fontSize: "1rem", zIndex: 900}}
					id="output" rows={3} cols={50} value={programResult}/>
			</CardBody>
		</Card>
		<Row>
			<Col>
				<Button className="btn-round" color="primary" size="lg" onClick={() => runProgram()}>
					Run
				</Button>
			</Col>
			<Col style={{top: "1rem"}}>
				<select onClick={() => getExamples()} className="dropdown-with-icons" aria-labelledby="navbarDropdownMenuLink">
					<option value={-1} key={-1}>Example Programs</option>
					{programExamples}
				</select>
			</Col>
		</Row>	
	</>
);
}
