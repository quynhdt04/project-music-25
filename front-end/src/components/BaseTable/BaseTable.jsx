import React, {
  useCallback,
  useState,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { Link, useParams } from "react-router-dom";
import { Form, Button, Row, Col } from "react-bootstrap";
import {
  Eye,
  PencilSquare,
  Trash,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  CheckLg,
} from "react-bootstrap-icons";
import "./BaseTable.scss";
import ButtonWithModal from "../ButtonWithModal/ButtonWithModal";
import {
  approve_multiple_songs,
  delete_multiple_songs,
  delete_song_data,
  reject_multiple_songs,
  restore_multiple_songs,
} from "../../services/SongServices";
import { toast } from "react-toastify";
import {
  approve_multiple_albums,
  delete_album_data,
  delete_multiple_albums,
  reject_multiple_albums,
  restore_multiple_albums,
} from "../../services/AlbumServices";
import { getCookie } from "../../helpers/cookie";

const BaseTable = ({
  data,
  columns,
  filters,
  multipleActions,
  tableActions = "full",
  basePath,
  fetchListData,
  canCreateNewData = true,
  handleFilterData,
  filterValues,
  setFilterValues,
  handleSearchData,
  searchValue,
  setSearchValue,
}) => {
  const [checkedItems, setCheckedItems] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = useRef(5);
  const [offset, setOffset] = useState(0);
  const totalPage = useRef(0);
  const numberOfSelectedItems = Object.values(checkedItems).filter(
    (isChecked) => isChecked
  ).length;
  const [actionForMultipleItems, setActionForMultipleItems] = useState("no");
  const searchTimeoutRef = useRef(null);
  const { managementPage } = useParams();

  useEffect(() => {
    totalPage.current = Math.ceil(data.length / rowsPerPage.current);

    const initialCheckedItems = data?.reduce((acc, item) => {
      acc[item.id] = false;
      return acc;
    }, {});

    setCheckedItems(initialCheckedItems);
  }, [data]);

  const visibleRows = React.useMemo(
    () => [...data].slice(offset, offset + rowsPerPage.current),
    [data, offset, rowsPerPage]
  );

  // Handle filter changes
  const handleFilterChange = (filterId, value) => {
    const newValues = {
      ...filterValues,
      [filterId]: value,
    };

    // Check if we have active filters
    const hasActiveFilters = Object.values(newValues).some(
      (value) => value && value !== "" && value !== -1
    );

    if (hasActiveFilters) {
      handleFilterData(newValues);
    }

    setFilterValues(newValues);
  };

  // Debounced search handler
  const handleSearch = (e) => {
    const searchValue = e.target.value;

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    setSearchValue(searchValue);
    searchTimeoutRef.current = setTimeout(() => {
      handleSearchData(searchValue);
    }, 500); // 500ms delay
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const onPageChange = (page) => {
    setCurrentPage(page);
    setOffset((page - 1) * rowsPerPage.current);
  };

  const handleDeleteSong = async (id) => {
    try {
      let response = null;
      switch (managementPage) {
        case "songs":
          response = await delete_song_data(id);
          break;

        case "albums":
          response = await delete_album_data(id);
          break;

        default:
          break;
      }
      if (response.status === 200) {
        toast.success("Xóa bài hát thành công");
      } else {
        toast.error("Xóa bài hát thất bại");
      }
      fetchListData();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Xóa bài hát thất bại");
    }
  };

  const handleDeleteOrRestoreMultipleSong = async () => {
    try {
      const account = JSON.parse(getCookie("account"));

      let response = null;
      let items = Object.keys(checkedItems).filter(
        (item) => checkedItems[item] === true
      );
      if (
        actionForMultipleItems === "delete-multiple" ||
        actionForMultipleItems === "reject-multiple"
      ) {
        switch (managementPage) {
          case "songs":
            response = await delete_multiple_songs({
              songIds: items,
            });
            break;

          case "albums":
            response = await delete_multiple_albums({
              albumIds: items,
            });
            break;

          case "songs-approval":
            response = await reject_multiple_songs({
              songIds: items,
              approvedBy: account.id,
            });
            break;

          case "albums-approval":
            response = await reject_multiple_albums({
              albumIds: items,
              approvedBy: account.id,
            });
            break;
        }

        if (response.status === 200) {
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      } else {
        switch (managementPage) {
          case "songs":
            response = await restore_multiple_songs({
              songIds: items,
              restoredBy: account.id,
            });
            break;

          case "albums":
            response = await restore_multiple_albums({
              albumIds: items,
            });
            break;

          case "songs-approval":
            response = await approve_multiple_songs({
              songIds: items,
              approvedBy: account.id,
            });
            break;

          case "albums-approval":
            response = await approve_multiple_albums({
              albumIds: items,
              approvedBy: account.id,
            });
            break;

          default:
            break;
        }

        if (response.status === 200) {
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      }
      fetchListData();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Row>
        <Col>
          <div className="filter-section">
            {filters && filters.length > 0 && (
              <>
                <div className="filter-header">
                  <span>Bộ lọc</span>
                </div>
                <div className="filter-body">
                  {filters?.map((filter) => (
                    <div className="filter-container" key={filter.id}>
                      <Form.Group controlId={filter.id}>
                        <Form.Label>{filter.label}</Form.Label>
                        <Form.Select
                          className="form-select"
                          id={filter.id}
                          value={filterValues[filter.id] || "all"}
                          onChange={(e) =>
                            handleFilterChange(filter.id, e.target.value)
                          }
                        >
                          {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Col>
      </Row>
      <hr style={{ border: "1.5px solid rgba(46, 38, 61, 0.22)" }} />
      <Row>
        <Col>
          <div className="list-page-header">
            <div className="left">
              <div className="search-box-container">
                <input
                  type="text"
                  placeholder="Search"
                  onChange={handleSearch}
                  value={searchValue}
                />
              </div>
            </div>
            <div className="right">
              <Form.Select
                className="form-select"
                style={{ width: "230px", height: "40px" }}
                onChange={(e) => setActionForMultipleItems(e.target.value)} // Pass the selected value
              >
                <option value="no">-- Chọn hành động --</option>
                {multipleActions.map((action) => (
                  <option key={action.value} value={action.value}>
                    {action.render(numberOfSelectedItems)}
                  </option>
                ))}
              </Form.Select>
              <ButtonWithModal
                type="button-with-icon"
                buttonLabel="Xác nhận"
                buttonIcon={
                  <CheckLg size={20} style={{ marginRight: "0.313rem" }} />
                }
                buttonClassName="btn confirm-btn"
                modalTitle="Xác nhận"
                modalContent={
                  actionForMultipleItems === "delete-multiple" ? (
                    <p>
                      Bạn có chắc chắn muốn xóa bản ghi:{" "}
                      {Object.keys(checkedItems)
                        .filter((item) => checkedItems[item] === true)
                        .join(", ")}{" "}
                      ?
                    </p>
                  ) : actionForMultipleItems === "reject-multiple" ? (
                    <p>
                      Bạn có chắc chắn muốn từ chối bản ghi:{" "}
                      {Object.keys(checkedItems)
                        .filter((item) => checkedItems[item] === true)
                        .join(", ")}{" "}
                      ?
                    </p>
                  ) : actionForMultipleItems === "resolve-multiple" ? (
                    <p>
                      Bạn có chắc chắn muốn phục hồi bản ghi:{" "}
                      {Object.keys(checkedItems)
                        .filter((item) => checkedItems[item] === true)
                        .join(", ")}{" "}
                      ?
                    </p>
                  ) : (
                    <p>
                      Bạn có chắc chắn muốn duyệt bản ghi:{" "}
                      {Object.keys(checkedItems)
                        .filter((item) => checkedItems[item] === true)
                        .join(", ")}{" "}
                      ?
                    </p>
                  )
                }
                onSubmit={() => handleDeleteOrRestoreMultipleSong()}
                isDisabled={
                  numberOfSelectedItems !== 0 && actionForMultipleItems !== "no"
                    ? false
                    : true
                }
              />
              {canCreateNewData && (
                <>
                  <div className="vr"></div>
                  <Link
                    to={`${basePath}/create`}
                    style={{ textDecoration: "none" }}
                  >
                    <Button className="btn add-btn">
                      <Plus size={20} style={{ marginRight: "0.313rem" }} />
                      Thêm dữ liệu
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </Col>
      </Row>
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
                      visibleRows.forEach((item) => {
                        newCheckedItems[item.id] = isChecked;
                      });
                      setCheckedItems(newCheckedItems);
                    }}
                    checked={Object.values(checkedItems).every(
                      (isChecked) => isChecked
                    )}
                  />
                </div>
              </th>
              {columns.map((col, index) => (
                <th key={index} className={col.headerClassName || ""}>
                  <div style={{ textAlign: col.isCenter ? "center" : "left" }}>
                    <span>{col.header}</span>
                  </div>
                </th>
              ))}
              <th>
                <div
                  className="table-header-action"
                  style={{ textAlign: "center" }}
                >
                  <span>Hành động</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length > 0 ? (
              visibleRows.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="table-data-checkbox">
                      <input
                        type="checkbox"
                        checked={checkedItems[item.id] || false}
                        onChange={() =>
                          setCheckedItems({
                            ...checkedItems,
                            [item.id]: !checkedItems[item.id],
                          })
                        }
                      />
                    </div>
                  </td>
                  {columns.map((col, index) => (
                    <td key={index}>
                      <div
                        className={col.className || ""}
                        style={{ textAlign: col.isCenter ? "center" : "left" }}
                      >
                        {col.render
                          ? col.render(item[col.key], item)
                          : item[col.key]}
                      </div>
                    </td>
                  ))}
                  <td>
                    <div
                      className={`table-data-action d-flex justify-content-center`}
                    >
                      {tableActions === "view-only" ? (
                        <div className="img-container view-detail-btn">
                          <Link to={`${basePath}/view-detail/${item.id}`}>
                            <Eye size={20} />
                          </Link>
                        </div>
                      ) : (
                        <>
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
                            <ButtonWithModal
                              type="icon"
                              buttonIcon={<Trash size={20} />}
                              modalTitle="Xác nhận"
                              modalContent={
                                <p>
                                  Bạn có chắc chắn muốn xóa bản ghi: {item.id} ?
                                </p>
                              }
                              onSubmit={() => handleDeleteSong(item.id)}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 2}>
                  <div className="text-center">Không có dữ liệu</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="table-pagination-section">
          <div className="table-pagination">
            <div className="page-teller">
              <span>
                Page: {currentPage} of {totalPage.current}
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
                  currentPage === totalPage.current ? "disabled" : "enabled"
                }`}
                onClick={() =>
                  currentPage < totalPage.current &&
                  onPageChange(currentPage + 1)
                }
              >
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BaseTable;
