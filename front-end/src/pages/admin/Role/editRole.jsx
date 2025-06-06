import { useNavigate, useParams } from "react-router-dom";
import BoxHead from "../../../components/BoxHead";
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
        if (result.message) {
            navigate(-1);
            toast.success(result.message, { transition: Bounce });
        } else {
            toast.error(result.error, { transition: Bounce });
        }
    }

    return (
        <>
            <BoxHead title="Chỉnh sửa nhóm quyền" />
            <form onSubmit={handleSubmit} className="from-role">
                <div className="from-role__group">
                    <label htmlFor="title">Tiêu đề</label>
                    <input
                        type="text"
                        id="title" name="title"
                        required
                        defaultValue={role.title}
                        onChange={(e) => setData(prev => ({ ...prev, title: e.target.value }))} />
                </div>
                <div className="from-role__group">
                    <label htmlFor="desciption">Mô tả</label>
                    <input
                        type="text"
                        id="desciption"
                        name="description"
                        defaultValue={role.desciption}
                        onChange={(e) => setData(prev => ({ ...prev, desciption: e.target.value }))} />
                </div>
                <div className="from-role__btn">
                    <button
                        type="button"
                        className="btn-back btn"
                        onClick={() => navigate(-1)}
                    >
                        Trở lại
                    </button>
                    <button type="submit" className="btn btn-create">Cập nhật</button>
                </div>
            </form>
        </>
    )
}

export default EditRole;