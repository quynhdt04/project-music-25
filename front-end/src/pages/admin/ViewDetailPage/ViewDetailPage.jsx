import React from "react";
import { useParams } from "react-router-dom";
import SongDetailPage from "../Song/SongDetailPage/SongDetailPage";
import AlbumDetailPage from "../Album/AlbumDetailPage/AlbumDetailPage";

const ViewDetailPage = () => {
  const { managementPage } = useParams(); // Get all parameters

  const renderPage = () => {
    switch (managementPage) {
      case "songs-approval":
        return <SongDetailPage managementPage="songs-approval" />;

      case "albums-approval":
        return <AlbumDetailPage managementPage="albums-approval" />;

      case "albums":
        return <AlbumDetailPage />;

      default:
        // Default to ListPage with the managementPage parameter
        return <SongDetailPage />;
    }
  };

  return <>{renderPage()}</>;
};

export default ViewDetailPage;
