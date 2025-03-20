import { useState } from "react";
import "./InfoUser.scss";
import { useSelector } from "react-redux";

function InfoUser() {
    const role = useSelector((state) => state.authenReducer.role);
    const account = useSelector((state) => state.authenReducer.account);
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }else {
            setImagePreview(null);
        }
    }

    return (
        <>
            <div className="info-user">
                <div className="info-user__image">
                    <img src={ imagePreview || account.avatar} alt="Avatar" />
                    <input type="file" className="info-user__avatar" id="avatar" name="avatar" accept="image/*" onChange={handleImageChange} />
                </div>
                <div className="info-user__form">
                    <form>

                        <label>Email</label>
                        <input name="email" type="email" placeholder="Email" readOnly value={account.email} />

                        <label>Họ và tên</label>
                        <input name="fullName" type="text" placeholder="Họ và tên" value={account.fullName} />

                        <label>Số điện thoại</label>
                        <input type="text" placeholder="Số điện thoại" value={account.phone} />

                        <label>Quyền</label>
                        <input type="text" placeholder="Quyền" readOnly value={role.title} />

                        <label>Mật khẩu mới</label>
                        <input type="password" placeholder="Mật khẩu mới" />

                        <div className="info-user__btn">
                            <button type="submit" className="btn update">Cập nhật</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default InfoUser;