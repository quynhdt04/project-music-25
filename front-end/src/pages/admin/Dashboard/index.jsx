import "./Dashboard.scss";
import { FaUsers, FaUserTie, FaMicrophone } from "react-icons/fa";
import { MdAlbum } from "react-icons/md";
import { GiLoveSong } from "react-icons/gi";
import TopicChart from "./TopicChart";
import TopMusic from "./TopMusic";
import PlaycountMusic from "./PlaycountMusic";

function Dashboard() {
    return (
        <>
            <div className="dashboard__wrap">
                <div className="dashboard__item">
                    <FaUsers />
                    <div className="dashboard__content">
                        <p>Người dùng</p>
                        <p>1000</p>
                    </div>
                </div>
                <div className="dashboard__item">
                    <FaUserTie />
                    <div className="dashboard__content">
                        <p>Quản lý</p>
                        <p>1000</p>
                    </div>
                </div>
                <div className="dashboard__item">
                    <MdAlbum />
                    <div className="dashboard__content">
                        <p>Album</p>
                        <p>1000</p>
                    </div>
                </div>
                <div className="dashboard__item">
                    <GiLoveSong />
                    <div className="dashboard__content">
                        <p>Bài hát</p>
                        <p>1000</p>
                    </div>
                </div>
                <div className="dashboard__item">
                    <FaMicrophone />
                    <div className="dashboard__content">
                        <p>Ca sĩ</p>
                        <p>1000</p>
                    </div>
                </div>
            </div>
            <div className="dashboard__chart">
                <div className="dasboard__topic">
                    <TopicChart />
                </div>
                <div className="dasboard__top5-music">
                    <TopMusic />
                </div>
            </div>
            <div>
                <PlaycountMusic />
            </div>
        </>
    )
}
export default Dashboard;
