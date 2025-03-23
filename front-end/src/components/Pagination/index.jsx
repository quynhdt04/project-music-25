import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Pagination.scss";

const Pagination = ({ currentPage, totalPages, limit }) => {
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="pagination">
            <Link
                to={`?page=${Math.max(currentPage - 1, 1)}&limit=${limit}`}
                className={`prev ${currentPage === 1 ? "disabled" : ""}`}
            >
                <FaAngleLeft />
            </Link>

            {pageNumbers.map((page) => (
                <Link
                    key={page}
                    to={`?page=${page}&limit=${limit}`}
                    className={currentPage === page ? "active" : ""}
                >
                    {page}
                </Link>
            ))}

            <Link
                to={`?page=${Math.min(currentPage + 1, totalPages)}&limit=${limit}`}
                className={`next ${currentPage === totalPages ? "disabled" : ""}`}
            >
                <FaAngleRight />
            </Link>
        </div>
    );
};

export default Pagination;
