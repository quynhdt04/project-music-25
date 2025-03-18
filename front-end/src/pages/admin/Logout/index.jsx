import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteAllCookies } from "../../../helpers/cookie";
import { setAuthAccount, setAuthRole } from "../../../actions/authen";

function Logout() {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    deleteAllCookies();
    useEffect(() => {
            dispatch(setAuthAccount({}));
            dispatch(setAuthRole({}));
            navigate('/admin/login');
    },[])

    return (
        <>
        </>
    )
}

export default Logout;