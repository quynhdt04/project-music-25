import LayoutClient from "../layouts/client/LayoutDefault";
import LayoutAdmin from "../layouts/admin/LayoutDefault";
import Home from "../pages/client/Home";
import PrivateRoutes from "../components/PrivateRoutes";
import BXH from "../pages/client/BXH";
import Dashboard from "../pages/admin/Dashboard";
import Role from "../pages/admin/Role";
import Account from "../pages/admin/Account";
import Permissions from "../pages/admin/Role/permissions";
import CreateRole from "../pages/admin/Role/createRole";
import EditRole from "../pages/admin/Role/editRole";
import CreateAccount from "../pages/admin/Account/createAccount";
import Login from "../pages/admin/Login";
import Logout from "../pages/admin/Logout";
import Topic from "../pages/admin/Topic";
import Singer from "../pages/admin/Singer";
import Song from "../pages/admin/Song";
import User from "../pages/admin/User";
import General from "../pages/admin/General";
import PrivateRouteClient from "../components/PrivateRouteClient";
import ListSong from "../pages/client/ListSong";
import MusicLove from "../pages/client/MusicLove";
import SongFormManagementPage from "../pages/admin/Song/SongFormManagementPage/SongFormManagementPage";
import InfoUser from "../pages/admin/InfoUser";
import EditAccount from "../pages/admin/Account/editAccount";
import CreateTopic from "../pages/admin/Topic/createTopic";
import EditTopic from "../pages/admin/Topic/editTopic";
import MainContent from "../pages/admin/MainContent/MainContent";
import AlbumDetail from "../pages/client/AlbumDetail/AlbumDetail";

export const allRoutes = [
  // Routes cho Client
  {
    path: "/",
    element: <LayoutClient />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "bxh",
        element: <BXH />,
      },
      {
        path: "songs",
        element: <ListSong />,
      },
      {
        path: "album/:id",
        element: <AlbumDetail />,
      },
      {
        element: <PrivateRouteClient />,
        children: [
          {
            path: "music-love",
            element: <MusicLove />,
          },
        ],
      },
    ],
  },

  // Routes cho Admin
  {
    path: "/admin/login",
    element: <Login />,
  },
  {
    element: <PrivateRoutes />,
    children: [
      {
        path: "/admin",
        element: <LayoutAdmin />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "roles",
            element: <Role />,
          },
          {
            path: "roles/permissions",
            element: <Permissions />,
          },
          {
            path: "roles/create",
            element: <CreateRole />,
          },
          {
            path: "roles/edit/:id",
            element: <EditRole />,
          },
          {
            path: "accounts",
            element: <Account />,
          },
          {
            path: "accounts/create",
            element: <CreateAccount />,
          },
          {
            path: "accounts/edit/:id",
            element: <EditAccount />,
          },
          {
            path: "topics",
            element: <Topic />,
          },
          {
            path: "singers",
            element: <Singer />,
          },
          {
            path: "singers/create",
            element: <CreateRole />,
          },
          {
            path: "users",
            element: <User />,
          },
          {
            path: "general",
            element: <General />,
          },
          {
            path: "logout",
            element: <Logout />,
          },
          {
            path: "info-user",
            element: <InfoUser />,
          },
          {
            path: "topics/create",
            element: <CreateTopic />,
          },
          {
            path: "topics/edit/:id",
            element: <EditTopic />,
          },
          // {
          //   path: "songs",
          //   element: <Song />,
          // },
          {
            path: ":managementPage/:action?/:id?",
            element: <MainContent />,
          },
          // {
          //   path: "songs/:action?/:id?",
          //   element: <SongFormManagementPage />,
          // },
        ],
      },
    ],
  },
];
