import { useState, useRef } from "react";
import { FaEllipsisH, FaListUl, FaLink, FaShare, FaEdit, FaTrash } from "react-icons/fa";
import "./DropupMenu.css";

const DropupMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useState(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="dropup" ref={menuRef}>
            <button className="dropup__toggle" onClick={toggleMenu}>
                <FaEllipsisH />
            </button>

            {isOpen && (
                <div className="dropup__menu">
                    <div className="dropup__item">
                        <FaEdit /> Chỉnh sửa playlist
                    </div>
                    <div className="dropup__item dropup__danger">
                        <FaTrash /> Xóa playlist
                    </div>
                </div>
            )}
        </div>
    );
};

export default DropupMenu;
