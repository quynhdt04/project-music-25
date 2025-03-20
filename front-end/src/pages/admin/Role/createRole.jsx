import BoxHead from "../../../components/BoxHead";
import { create_role } from "../../../services/RoleServices";
import { useNavigate } from "react-router-dom";
import { toast, Bounce } from "react-toastify";

function CreateRole() {

    const navigate = useNavigate(); 
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            title : e.target.elements[0].value,
            desciption: e.target.elements[1].value,
            permissions : []
        }

        try {
            const result = await create_role(data); 
            if (result.message) {
                toast.success(result.message, { transition: Bounce });
                navigate(-1);
            }else {
                toast.error(result.error, { transition: Bounce });
            }
        } catch (error) {
            console.error("Lỗi:", error);
        }
    }

    return (
        <>
            <BoxHead title="Thêm mới nhóm quyền" />
            <form onSubmit={handleSubmit} className="from-role">
                <div className="from-role__group">
                    <label htmlFor="title">Tiêu đề</label>
                    <input type="text" id="title" name="title" required />
                </div>
                <div className="from-role__group">
                    <label htmlFor="desciption">Mô tả</label>
                    <input type="text" id="desciption" name="description" />
                </div>
                <div className="from-role__btn">
                    <button
                        type="button"
                        className="btn-back btn"
                        onClick={() => navigate(-1)}
                    >
                        Trở lại
                    </button>
                    <button type="submit" className="btn btn-create">Tạo mới</button>
                </div>
            </form>
        </>
    )
}

export default CreateRole;