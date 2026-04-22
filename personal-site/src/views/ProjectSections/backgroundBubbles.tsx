import React from "react";
import path3 from "assets/img/path3.png";
import path5 from "assets/img/path5.png";

interface BackgroundBubblesProps {
    value: number;
}

export default function BackgroundBubbles({ value }: BackgroundBubblesProps) {
    var bubblesChoice;
    if(value === 0)
    {
        bubblesChoice =
            <>
                <img alt="..." className="path"
                    src={path5}
                />
                <img alt="..." className="path path1"
                    src={path5}
                />
                <img alt="..." className="path"
                    src={path5}
                    style={{top: '30%', right: 'auto', left: '-400px', width: '70%'}}
                />
                <img alt="..." className="path"
                    src={path5}
                    style={{top: '55%', width: '75%'}}
                />
                <img alt="..." className="path"
                    src={path5}
                    style={{top: '80%', right: 'auto', left: '-300px', width: '60%'}}
                />
            </>;
    }else if(value === 1)
    {
        bubblesChoice = 
        <>
            <img
                alt="..."
                className="path"
                src={path3}
            />
        </>;
    }
    return (
        <>
            {bubblesChoice}
        </>
    );
}