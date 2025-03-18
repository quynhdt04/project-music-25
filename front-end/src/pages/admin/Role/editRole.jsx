import { useNavigate, useParams } from "react-router-dom";
import BoxHead from "../../../components/BoxHead";
import "./role.css";
import { get_role, patch_role } from "../../../services/RoleServices";
import { useEffect, useState } from "react";
import { toast, Bounce } from "react-toastify";

function EditRole() {
    const param = useParams();
    const [role, setRole] = useState([]);
    const [data, setData] = useState({
        title: "",
        desciption: ""
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAPI = async () => {
            const result = await get_role(param.id);
            setRole(result.role);
        }
        fetchAPI();
    }, []);

    useEffect(() => {
        if (role) {
            setData({
                title: role.title || "", 
                desciption: role.desciption || ""
            });
        }
    }, [role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await patch_role(param.id, data);
        if(result.message){
            navigate(-1);
            toast.success(result.message, { transition: Bounce });
        }else {
            toast.error(result.error, { transition: Bounce });
        }
    }

    return (
        <>
            <BoxHead title="Chỉnh sửa nhóm quyền" />
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Tiêu đề</label>
                    <input
                        type="text"
                        className="form-control"
                        id="title" name="title"
                        required 
                        defaultValue={role.title}
                        onChange={(e) => setData(prev => ({ ...prev, title: e.target.value }))} />
                </div>
                <div className="form-group">
                    <label htmlFor="desciption">Mô tả</label>
                    <input
                        type="text"
                        className="form-control"
                        id="desciption"
                        name="description"
                        defaultValue={role.desciption}
                        onChange={(e) => setData(prev => ({ ...prev, desciption: e.target.value }))}/>
                </div>
                <div className="form-group">
                    <button type="submit" className="btn btn-primary">Cập nhật</button>
                </div>
            </form>
        </>
    )
}

export default EditRole;