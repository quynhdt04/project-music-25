import { useEffect, useState } from "react";
import BoxHead from "../../../components/BoxHead";
import "./role.css";
import { Link } from "react-router-dom";
import { get_all_roles, patch_role } from "../../../services/RoleServices";
import { toast, Bounce } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

function Role() {
  const MySwal = withReactContent(Swal);
  const [roles, setRoles] = useState([]);
  useEffect(() => {
    const fetchAPI = async () => {
      const result = await get_all_roles();
      setRoles(result.roles);
    };
    fetchAPI();
  }, []);

  const handleDel = async (id) => {
    // const result = await patch_role(id, {deleted: true});
    // if(result) {
    //     toast.success('Xóa nhóm quyền thành công!', { transition: Bounce });
    // }

    MySwal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa nhóm quyền này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await patch_role(id, { deleted: true });
        if (response) {
          Swal.fire("Thành công!", "Nhóm quyền đã được xóa.", "success");
        } else {
          Swal.fire("Thất bại!", "Không thể xóa nhóm quyền.", "error");
        }
      }
    });
  };

  return (
    <>
      <BoxHead title="Nhóm quyền" />
      <div className="role__search-box">
        <input type="text" placeholder="Tìm kiếm..." />
        <button>Tìm</button>
      </div>
      <div className="role__card">
        <div className="role__card-header">Danh sách</div>
        <div className="role__card-body">
          <div className="role__text-right">
            <Link
              to="/admin/roles/create"
              className="role__btn role__btn-success"
            >
              + Thêm mới
            </Link>
          </div>
          <table className="role__table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Nhóm quyền</th>
                <th>Mô tả</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {roles.length > 0 ? (
                roles.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.title}</td>
                    <td>{item.desciption}</td>
                    <td>
                      <Link
                        to={`/admin/roles/edit/${item.id}`}
                        className="role__btn role__btn-warning"
                      >
                        Sửa
                      </Link>
                      <button
                        className="role__btn role__btn-danger"
                        onClick={() => handleDel(item.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Không có nhóm quyền nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Role;
