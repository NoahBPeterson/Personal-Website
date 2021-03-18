export default function BackgroundBubbles(props) {
    var bubblesChoice;
    if(props.value === 0)
    {
        bubblesChoice = 
            <>
                <img alt="..." className="path"
                    src={require("assets/img/path5.png").default}
                />
                <img alt="..." className="path path1"
                    src={require("assets/img/path5.png").default}
                />
            </>;
    }else if(props.value === 1)
    {
        bubblesChoice = 
        <>
            <img
                alt="..."
                className="path"
                src={require("assets/img/path3.png").default}
            />
        </>;
    }
    return (
        <>
            {bubblesChoice}
        </>
    );
}