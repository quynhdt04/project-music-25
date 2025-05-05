import { Outlet, Navigate, useLocation } from "react-router-dom";
import { getCookie } from "../../helpers/cookie";
import { useSelector } from "react-redux";

const PrivateRoutes = () => {
    const role = useSelector((state) => state.authenReducer.role);
    const token = getCookie("tokenAdmin");
    const location = useLocation();

    // Nếu không có token -> Chuyển hướng về trang login
    if (!token) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // Kiểm tra quyền truy cập vào các trang nhất định
    if (location.pathname.startsWith("/admin/topics") && !role?.permissions?.includes("topic_view")) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (location.pathname.startsWith("/admin/singers") && !role?.permissions?.includes("singer_view")) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (location.pathname.startsWith("/admin/singers/create") && !role?.permissions?.includes("singer_create")) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (location.pathname.startsWith("/admin/singers/edit") && !role?.permissions?.includes("singer_edit")) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (location.pathname === "/admin/songs" && !role?.permissions?.includes("song_view")) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (location.pathname.startsWith("/admin/users") && !role?.permissions?.includes("user_view")) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (location.pathname.startsWith("/admin/users/create") && !role?.permissions?.includes("user_create")) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (location.pathname.startsWith("/admin/edit") && !role?.permissions?.includes("user_edit")) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (location.pathname.startsWith("/admin/accounts") && !role?.permissions?.includes("account_view")) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (location.pathname.startsWith("/admin/accounts/create") && !role?.permissions?.includes("account_create")) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (location.pathname.startsWith("/admin/accounts/edit") && !role?.permissions?.includes("account_edit")) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (location.pathname.startsWith("/admin/roles") && !role?.permissions?.includes("role")) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (location.pathname.startsWith("/admin/general") && !role?.permissions?.includes("general_view")) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (location.pathname.startsWith("/admin/songs-approval") && !role?.permissions?.includes("songs-approval_view")) {
        return <Navigate to="/admin/dashboard" replace />;
    }
   
    if (location.pathname.startsWith("/admin/albums-approval") && !role?.permissions?.includes("albums-approval_view")) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (location.pathname.startsWith("/admin/conversations") && !role?.permissions?.includes("conversation_view")) {
        return <Navigate to="/admin/dashboard" replace />;
    }


    return <Outlet />;
};

export default PrivateRoutes;
