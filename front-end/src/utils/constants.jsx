import Select from "react-select";

export const tableConfigs = {
  songs: {
    columns: [
      { key: "id", header: "ID", isCenter: false },
      {
        key: "title",
        header: "Tên bài hát",
        isCenter: false,
      },
      {
        key: "singer",
        header: "Tên ca sĩ",
        isCenter: false,
        render: (value) => {
          // Assuming `value` is an array of singer names
          if (Array.isArray(value)) {
            return value.join(", "); // Join multiple singers with a comma
          }
          return value; // Fallback for single singer or invalid data
        },
      },
      { key: "like", header: "Lượt thích", isCenter: false },
      {
        key: "status",
        header: "Trạng thái duyệt",
        headerClassName: "status-cell-header",
        className: "status-cell",
        isCenter: true,
        render: (value) => {
          const statusMap = {
            approved: { label: "Đã duyệt", className: "status-green" },
            rejected: { label: "Đã từ chối", className: "status-red" },
            pending: { label: "Đang chờ duyệt", className: "status-grey" },
          };
          const status = statusMap[value] || { label: value, className: "" };
          return (
            <span className={`${status.className} col-using-render`}>
              {status.label}
            </span>
          );
        },
      },
      {
        key: "isDeleted",
        header: "Trạng thái xóa",
        headerClassName: "status-cell-header",
        className: "status-cell",
        isCenter: true,
        render: (value) => {
          const statusMap = {
            false: { label: "Chưa xóa", className: "status-green" },
            true: { label: "Đã xóa", className: "status-red" },
          };
          const status = statusMap[value] || { label: value, className: "" };
          return (
            <span className={`${status.className} col-using-render`}>
              {status.label}
            </span>
          );
        },
      },
      {
        key: "createdAt",
        header: "Ngày tạo",
        isCenter: false,
      },
      {
        key: "updatedAt",
        header: "Ngày cập nhật",
        isCenter: false,
      },
    ],
    basePath: "/admin/songs",
    title: "Danh sách bài hát",
    filters: [
      {
        id: "status",
        label: "Trạng thái duyệt",
        options: [
          { value: "all", label: "Tất cả" },
          { value: "approved", label: "Đã duyệt" },
          { value: "rejected", label: "Đã từ chối" },
          { value: "pending", label: "Đang chờ duyệt" },
        ],
      },
      {
        id: "isDeleted",
        label: "Trạng thái xóa",
        options: [
          { value: "all", label: "Tất cả" },
          { value: "true", label: "Đã xóa" },
          { value: "false", label: "Chưa xóa" },
        ],
      },
      // {
      //   id: "isPremiumOnly",
      //   label: "Trạng thái Premium",
      //   options: [
      //     { value: "", label: "Tất cả" },
      //     { value: "true", label: "Premium" },
      //     { value: "false", label: "Free" },
      //   ],
      // },
    ],
    multipleActions: [
      {
        value: "delete-multiple",
        render: (value) => `Xóa ${value} bản ghi`, // Return plain text
      },
      {
        value: "restore-multiple",
        render: (value) => `Phục hồi ${value} bản ghi`, // Return plain text
      },
    ],
    tableActions: "full",
  },
  "songs-approval": {
    columns: [
      { key: "id", header: "ID", isCenter: false },
      {
        key: "title",
        header: "Tên bài hát",
        isCenter: false,
      },
      {
        key: "singer",
        header: "Tên ca sĩ",
        isCenter: false,
        render: (value) => {
          // Assuming `value` is an array of singer names
          if (Array.isArray(value)) {
            return value.join(", "); // Join multiple singers with a comma
          }
          return value; // Fallback for single singer or invalid data
        },
      },
      {
        key: "isPremiumOnly",
        header: "Premium",
        headerClassName: "status-cell-header",
        className: "status-cell",
        isCenter: true,
        render: (value) => {
          const statusMap = {
            true: { label: "Chỉ Premium", className: "status-green" },
            false: { label: "Miễn phí", className: "status-grey" },
          };
          const status = statusMap[value] || { label: value, className: "" };
          return (
            <span className={`${status.className} col-using-render`}>
              {status.label}
            </span>
          );
        },
      },
      {
        key: "createdBy",
        header: "Người tạo",
        isCenter: false,
      },
      {
        key: "status",
        header: "Trạng thái duyệt",
        headerClassName: "status-cell-header",
        className: "status-cell",
        isCenter: true,
        render: (value) => {
          const statusMap = {
            approved: { label: "Đã duyệt", className: "status-green" },
            rejected: { label: "Đã từ chối", className: "status-red" },
            pending: { label: "Đang chờ duyệt", className: "status-grey" },
          };
          const status = statusMap[value] || { label: value, className: "" };
          return (
            <span className={`${status.className} col-using-render`}>
              {status.label}
            </span>
          );
        },
      },
      {
        key: "updatedAt",
        header: "Ngày cập nhật",
        isCenter: false,
      },
    ],
    basePath: "/admin/songs-approval",
    title: "Danh sách bài hát chờ duyệt",
    filters: [
      {
        id: "isPremiumOnly",
        label: "Trạng thái Premium",
        options: [
          { value: "all", label: "Tất cả" },
          { value: "true", label: "Chỉ Premium" },
          { value: "false", label: "Miễn phí" },
        ],
      },
    ],
    multipleActions: [
      {
        value: "reject-multiple",
        render: (value) => `Từ chối ${value} bản ghi`,
      },
      {
        value: "approve-multiple",
        render: (value) => `Duyệt ${value} bản ghi`,
      },
    ],
    tableActions: "view-only",
    canCreateNewData: false,
  },
  albums: {
    columns: [
      { key: "id", header: "ID", isCenter: false },
      { key: "title", header: "Tên album", isCenter: false },
      { key: "artist", header: "Nghệ sĩ", isCenter: false },
      {
        key: "numberOfSongs",
        header: "Số bài hát",
        isCenter: true,
      },
      {
        key: "createdBy",
        header: "Người tạo",
        isCenter: true,
      },
      {
        key: "status",
        header: "Trạng thái duyệt",
        headerClassName: "status-cell-header",
        className: "status-cell",
        isCenter: true,
        render: (value) => {
          const statusMap = {
            approved: { label: "Đã duyệt", className: "status-green" },
            rejected: { label: "Đã từ chối", className: "status-red" },
            pending: { label: "Đang chờ duyệt", className: "status-grey" },
          };
          const status = statusMap[value] || { label: value, className: "" };
          return (
            <span className={`${status.className} col-using-render`}>
              {status.label}
            </span>
          );
        },
      },
      {
        key: "isDeleted",
        header: "Trạng thái xóa",
        headerClassName: "status-cell-header",
        className: "status-cell",
        isCenter: true,
        render: (value) => {
          const statusMap = {
            false: { label: "Chưa xóa", className: "status-green" },
            true: { label: "Đã xóa", className: "status-red" },
          };
          const status = statusMap[value] || { label: value, className: "" };
          return (
            <span className={`${status.className} col-using-render`}>
              {status.label}
            </span>
          );
        },
      },
      {
        key: "updatedAt",
        header: "Ngày cập nhật",
        isCenter: false,
      },
    ],
    basePath: "/admin/albums",
    filters: [
      {
        id: "status",
        label: "Trạng thái duyệt",
        options: [
          { value: "all", label: "Tất cả" },
          { value: "approved", label: "Đã duyệt" },
          { value: "rejected", label: "Đã từ chối" },
          { value: "pending", label: "Đang chờ duyệt" },
        ],
      },
      {
        id: "isDeleted",
        label: "Trạng thái xóa",
        options: [
          { value: "all", label: "Tất cả" },
          { value: "true", label: "Đã xóa" },
          { value: "false", label: "Chưa xóa" },
        ],
      },
    ],
    title: "Danh sách album",
    multipleActions: [
      {
        value: "delete-multiple",
        render: (value) => `Xóa ${value} bản ghi`, // Return plain text
      },
      {
        value: "restore-multiple",
        render: (value) => `Phục hồi ${value} bản ghi`, // Return plain text
      },
    ],
  },
  "albums-approval": {
    columns: [
      { key: "id", header: "ID", isCenter: false },
      {
        key: "title",
        header: "Tên album",
        isCenter: false,
      },
      {
        key: "artist",
        header: "Tên ca sĩ",
        isCenter: false,
        render: (value) => {
          // Assuming `value` is an array of singer names
          if (Array.isArray(value)) {
            return value.join(", "); // Join multiple singers with a comma
          }
          return value; // Fallback for single singer or invalid data
        },
      },
      {
        key: "numberOfSongs",
        header: "Số bài hát",
        isCenter: true,
      },
      {
        key: "createdBy",
        header: "Người tạo",
        isCenter: true,
      },
      {
        key: "status",
        header: "Trạng thái duyệt",
        headerClassName: "status-cell-header",
        className: "status-cell",
        isCenter: true,
        render: (value) => {
          const statusMap = {
            approved: { label: "Đã duyệt", className: "status-green" },
            rejected: { label: "Đã từ chối", className: "status-red" },
            pending: { label: "Đang chờ duyệt", className: "status-grey" },
          };
          const status = statusMap[value] || { label: value, className: "" };
          return (
            <span className={`${status.className} col-using-render`}>
              {status.label}
            </span>
          );
        },
      },
      {
        key: "updatedAt",
        header: "Ngày cập nhật",
        isCenter: false,
      },
    ],
    basePath: "/admin/albums-approval",
    title: "Danh sách album chờ duyệt",
    filters: [],
    multipleActions: [
      {
        value: "reject-multiple",
        render: (value) => `Từ chối ${value} bản ghi`,
      },
      {
        value: "approve-multiple",
        render: (value) => `Duyệt ${value} bản ghi`,
      },
    ],
    tableActions: "view-only",
    canCreateNewData: false,
  },
};
