import React from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  PencilSquare,
  Trash,
  ChevronLeft,
  ChevronRight,
} from "react-bootstrap-icons";
import "./BaseTable.scss";

const BaseTable = ({
  data,
  columns,
  checkedItems,
  onCheckboxChange,
  offset,
  rowsPerPage,
  currentPage,
  totalPages,
  onPageChange,
  basePath,
}) => {
  return (
    <div className="table-section">
      <table>
        <thead>
          <tr>
            <th>
              <div className="table-header-check-all">
                <input
                  type="checkbox"
                  className="check-all-button"
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    const newCheckedItems = {};
                    data.forEach((item) => {
                      newCheckedItems[item.id] = isChecked;
                    });
                    onCheckboxChange(newCheckedItems);
                  }}
                  checked={Object.values(checkedItems).every(
                    (isChecked) => isChecked
                  )}
                />
              </div>
            </th>
            {columns.map((col, index) => (
              <th key={index} className={col.headerClassName || ""}>
                <div>
                  <span>{col.header}</span>
                </div>
              </th>
            ))}
            <th>
              <div className="table-header-action">
                <span>Hành động</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.slice(offset, offset + rowsPerPage).map((item) => (
            <tr key={item.id}>
              <td>
                <div className="table-data-checkbox">
                  <input
                    type="checkbox"
                    checked={checkedItems[item.id] || false}
                    onChange={() =>
                      onCheckboxChange({
                        ...checkedItems,
                        [item.id]: !checkedItems[item.id],
                      })
                    }
                  />
                </div>
              </td>
              {columns.map((col, index) => (
                <td key={index}>
                  <div className={col.className || ""}>
                    {col.render
                      ? col.render(item[col.key], item)
                      : item[col.key]}
                  </div>
                </td>
              ))}
              <td>
                <div className="table-data-action">
                  <div className="img-container view-detail-btn">
                    <Link to={`${basePath}/view-detail/${item.id}`}>
                      <Eye size={20} />
                    </Link>
                  </div>
                  <div className="img-container edit-info-btn">
                    <Link to={`${basePath}/edit-info/${item.id}`}>
                      <PencilSquare size={20} />
                    </Link>
                  </div>
                  <div className="img-container delete-data-btn">
                    <Link to={`${basePath}/delete-data?item=${item.id}`}>
                      <Trash size={20} />
                    </Link>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="table-pagination-section">
        <div className="table-pagination">
          <div className="page-teller">
            <span>
              Page: {currentPage} of {totalPages}
            </span>
          </div>
          <div className="pagination d-flex">
            <div
              className={`img-container prev-arrow ${
                currentPage === 1 ? "disabled" : "enabled"
              }`}
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            >
              <ChevronLeft size={20} />
            </div>
            <div
              className={`img-container next-arrow ${
                currentPage === totalPages ? "disabled" : "enabled"
              }`}
              onClick={() =>
                currentPage < totalPages && onPageChange(currentPage + 1)
              }
            >
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseTable;
