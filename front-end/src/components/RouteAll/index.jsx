import { allRoutes } from "../../routes";
import { useRoutes } from "react-router-dom";

function RouteAll() {
    const elements = useRoutes(allRoutes);
    
    return (
        <>
        {elements}
        </>
    )
}

export default RouteAll;