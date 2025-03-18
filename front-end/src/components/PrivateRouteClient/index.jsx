import { Navigate, Outlet } from "react-router-dom";

function PrivateRouteClient() {

    const token = true;
    return (
        <>
            {token ? (<Outlet />) : (<Navigate to="/login" />)}
        </>
    )
}

export default PrivateRouteClient;