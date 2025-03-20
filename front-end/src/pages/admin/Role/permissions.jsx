import { useEffect, useState } from "react";
import BoxHead from "../../../components/BoxHead";
import "./Permissions.css";
import { get_all_roles, patch_role } from "../../../services/RoleServices";
import { toast, Bounce } from "react-toastify";

function Permissions() {

    const [roles, setRoles] = useState([]);

    useEffect(() => {
        const fetchAPI = async () => {
            const result = await get_all_roles();
            setRoles(result.roles);
        }
        fetchAPI();
    }, [])

    const handleUpdate = async () => {
        const rows = document.querySelectorAll("[data-name]");
        let permissions = [];

        rows.forEach(row => {
            const name = row.getAttribute("data-name");
            const inputs = row.querySelectorAll("input");

            if (name == "id") {
                inputs.forEach(input => {
                    const id = input.value;
                    permissions.push({
                        id: id,
                        permissions: []
                    });
                })
            } else {
                inputs.forEach((input, index) => {
                    const checked = input.checked;
                    if (checked) {
                        permissions[index].permissions.push(name);
                    }
                });
            }
        });

        if (permissions.length > 0) {
            let successCount = 0;
            for (let item of permissions) {
                try {
                    const result = await patch_role(item.id, { permissions: item.permissions });
                    console.log("Update result:", result);
                    successCount++;
                } catch (error) {
                    console.error(`Error updating role ${item.id}:`, error);
                    toast.error('Cập nhật quyền thất bại!', { transition: Bounce });
                }
            }
            
            if(successCount > 0){
                toast.success('Cập nhật quyền thành công!', { transition: Bounce });
            }
        }
    }

    useEffect(() => {
        if (roles.length > 0) {
            roles.forEach((record, index) => {
                record.permissions.forEach(permission => {
                    const row = document.querySelector(`[data-name="${permission}"]`);
                    const inputs = row.querySelectorAll("input");
                    const input = inputs[index];
                    input.checked = true;
                });
            });
        }
    }, [roles]);


    return (
        <>
            <BoxHead title="Phân quyền" />
            <div className="wrap">
                <div className="text-right">
                    <button type="submit" className="btn btn-primary" onClick={handleUpdate}>Cập nhật</button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Tính năng</th>
                            {roles.length > 0 && (
                                roles.map((item, index) => (
                                    <th key={index}>{item.title}</th>
                                ))
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        <tr data-name="id" className="d-none">
                            <td></td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="text" defaultValue={item.id} /></td>
                            ))}
                        </tr>
                        <tr>
                            <td colSpan="3"><b>Chủ đề</b></td>
                        </tr>
                        <tr data-name="topic_view">
                            <td>Xem</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr data-name="topic_create">
                            <td>Thêm mới</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr data-name="topic_edit">
                            <td>Chỉnh sửa</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr data-name="topic_del">
                            <td>Xóa</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr>
                            <td colSpan="3"><b>Ca sĩ</b></td>
                        </tr>
                        <tr data-name="singer_view">
                            <td>Xem</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr data-name="singer_create">
                            <td>Thêm mới</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr data-name="singer_edit">
                            <td>Chỉnh sửa</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr data-name="singer_del">
                            <td>Xóa</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr>
                            <td colSpan="3"><b>Tài khoản</b></td>
                        </tr>
                        <tr data-name="account_view">
                            <td>Xem</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr data-name="account_create">
                            <td>Thêm mới</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr data-name="account_edit">
                            <td>Chỉnh sửa</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr data-name="account_del">
                            <td>Xóa</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr>
                            <td colSpan="3"><b>Bài hát</b></td>
                        </tr>
                        <tr data-name="song_view">
                            <td>Xem</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr data-name="song_create">
                            <td>Thêm mới</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr data-name="song_edit">
                            <td>Chỉnh sửa</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr data-name="song_del">
                            <td>Xóa</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr>
                            <td colSpan="3"><b>Người dùng</b></td>
                        </tr>
                        <tr data-name="user_view">
                            <td>Xem</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr data-name="user_create">
                            <td>Thêm mới</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr data-name="user_edit">
                            <td>Chỉnh sửa</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr data-name="user_del">
                            <td>Xóa</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr>
                            <td colSpan="3"><b>Cài đặt chung</b></td>
                        </tr>
                        <tr data-name="general_view">
                            <td>Xem</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr data-name="general_create">
                            <td>Thêm mới</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr data-name="general_edit">
                            <td>Chỉnh sửa</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr data-name="general_del">
                            <td>Xóa</td>
                            {roles.map((item, index) => (
                                <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                        <tr data-name="role">
                            <td style={{ fontWeight: "bold" }}>Phân quyền & Nhóm quyền</td>
                            {roles.map((item, index) => (
                                    <td key={index}><input type="checkbox" /></td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default Permissions;