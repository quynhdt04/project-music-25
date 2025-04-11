import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";

function PrivateRouteClient() {
  const token = useSelector((state) => state.authenReducer.token);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) {
      dispatch({ type: "SHOW_LOGIN_POPUP" });
    }
  }, [token, dispatch]);

  if (!token) return null;
  return <Outlet />;
}

export default PrivateRouteClient;
