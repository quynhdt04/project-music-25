import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function PrivateRouteClient() {
    const token = useSelector((state) => state.authenReducer.token); // ✅ Lấy từ Redux

    return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export default PrivateRouteClient;