
function BoxHead(props) {
    const { title } = props;

    return (
        <>
            <div className="box-head" style={{ color: "#9BA4B4", fontSize: "24px", fontWeight: "bold", marginBottom:"10px" }}>
                {title}
            </div>
        </>
    )
}

export default BoxHead;