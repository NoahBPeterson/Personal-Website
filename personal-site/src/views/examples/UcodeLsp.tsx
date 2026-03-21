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
// reactstrap components
import { Card, CardHeader, CardBody, CardTitle, Container, Row, Col } from "reactstrap";

// core components
import IndexNavbar from "../../components/Navbars/IndexNavbar";
import Footer from "../../components/Footer/Footer";
import UcodeLspComponent from "./UcodeLspComponent";

export default function UcodeLsp(): JSX.Element {
    const [squares1to6, setSquares1to6] = useState("");
    const [squares7and8, setSquares7and8] = useState("");
    const [programText, setProgramText] = useState('import { create } from "socket";\nprint("Hello ucode");');
    const [programExamples, setProgramExamples] = useState<JSX.Element[]>([]);
    const [exampleText, setExampleText] = useState('');

    React.useEffect(() => {
        document.body.classList.toggle("register-page");
        document.documentElement.addEventListener("mousemove", followCursor);
        getExamples();
        return function cleanup() {
            document.body.classList.toggle("register-page");
            document.documentElement.removeEventListener("mousemove", followCursor);
        };
    },[]);

    const followCursor = (event: MouseEvent) => {
        let posX = event.clientX - window.innerWidth / 2;
        let posY = event.clientY - window.innerWidth / 6;
        setSquares1to6(
            "perspective(500px) rotateY(" +
            posX * 0.05 +
            "deg) rotateX(" +
            posY * -0.05 +
            "deg)"
        );
        setSquares7and8(
            "perspective(500px) rotateY(" +
            posX * 0.02 +
            "deg) rotateX(" +
            posY * -0.02 +
            "deg)"
        );
    };

    const getExamples = async () => {
        if(programExamples.length > 0) return;
        const result = await fetch('http://noahpeterson.me:5000/ucodeExamples', {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const body = await result.json();
        const items = [] as JSX.Element[];
        for(const [index, value] of body.entries()) {
            items.push(
                <option 
                    style={{cursor:'pointer'}}
                    value={index} key={index}
                    onTouchStart={() => getExampleText(index)}
                    onClick={() => getExampleText(index)}>
                    {value}
                </option>
            )
        }
        setProgramExamples(items);
    }

    const getExampleText = async (chosenExample: number) => {
        const result = await fetch('http://noahpeterson.me:5000/ucodeExamples/'+chosenExample, {
            method: 'post',
            body: JSON.stringify({ string: exampleText }),
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
        <IndexNavbar activeSection="interpreter" />
            <div className="wrapper">
            <div className="page-header">
                <div className="page-header-image" />
                <div className="content">
                    <Container>
                        <div className="title">
                            <h1 className="mb-3">ucode LSP</h1>
                        </div>
                        <Row>
                            <Col className="ml-auto mr-auto" md="12" xl="4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle tag="h4">Language Details</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <p>
                                            The VS Code extension and LSP are open-source here:
                                            <a href="https://github.com/NoahBPeterson/ucode-lsp">
                                                &nbsp;
                                                <i className="fab fa-github"><i style={{fontSize: "0.5rem"}}>&nbsp;</i>NoahBPeterson/ucode-lsp</i>
                                            </a>
                                        </p>
                                        <div className="mt-3">
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
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col className="ml-auto mr-auto" md="12" xl="8">
                                <UcodeLspComponent />
                            </Col>
                        </Row>
                        {/* Background Squares */}
                        <div className="register-bg" />
                        <div className="square square-1" id="square1" style={{ transform: squares1to6 }} />
                        <div className="square square-2" id="square2" style={{ transform: squares1to6 }} />
                        <div className="square square-3" id="square3" style={{ transform: squares1to6 }} />
                        <div className="square square-4" id="square4" style={{ transform: squares1to6 }} />
                        <div className="square square-5" id="square5" style={{ transform: squares1to6 }} />
                        <div className="square square-6" id="square6" style={{ transform: squares1to6 }} />
                        <div className="square square-7" id="square7" style={{ transform: squares7and8 }} />
                        <div className="square square-8" id="square8" style={{ transform: squares7and8 }} />
                    </Container>
                </div>
            </div>
            
                <Footer />
            
            </div>
        </>
    );
}


