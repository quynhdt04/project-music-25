import React from "react";
import { useParams } from "react-router-dom";
import ListPage from "../ListPage/ListPage";
import ViewDetailPage from "../ViewDetailPage/ViewDetailPage";
import CreatePage from "../CreatePage/CreatePage";
import UpdatePage from "../UpdatePage/UpdatePage";

const MainContent = () => {
  const { action } = useParams();

  const renderPage = () => {
    switch (action) {
      case "view-detail":
        return <ViewDetailPage />;

      case "create":
        return <CreatePage />;

      case "edit-info":
        return <UpdatePage />;

      default:
        return <ListPage />;
    }
  };

  return <>{renderPage()}</>;
};

export default MainContent;
