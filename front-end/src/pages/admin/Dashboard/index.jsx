import "./Dashboard.scss";
import { FaUsers, FaUserTie, FaMicrophone } from "react-icons/fa";
import { MdAlbum } from "react-icons/md";
import { GiLoveSong } from "react-icons/gi";
import TopicChart from "./TopicChart";
import TopMusic from "./TopMusic";
import PlaycountMusic from "./PlaycountMusic";
import { useEffect, useState } from "react";
import { get_total_statistics } from "../../../services/StatisticalServices";

function Dashboard() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchAPI = async () => {
            const result = await get_total_statistics()
            setData(result.statistics);
        }
        fetchAPI()
    },[])

    return (
        <>
            <div className="dashboard__wrap">
                <div className="dashboard__item">
                    <FaUsers />
                    <div className="dashboard__content">
                        <p>Người dùng</p>
                        <p>{data.total_users}</p>
                    </div>
                </div>
                <div className="dashboard__item">
                    <FaUserTie />
                    <div className="dashboard__content">
                        <p>Quản lý</p>
                        <p>{data.total_accounts}</p>
                    </div>
                </div>
                <div className="dashboard__item">
                    <MdAlbum />
                    <div className="dashboard__content">
                        <p>Album</p>
                        <p>{data.total_albums}</p>
                    </div>
                </div>
                <div className="dashboard__item">
                    <GiLoveSong />
                    <div className="dashboard__content">
                        <p>Bài hát</p>
                        <p>{data.total_songs}</p>
                    </div>
                </div>
                <div className="dashboard__item">
                    <FaMicrophone />
                    <div className="dashboard__content">
                        <p>Ca sĩ</p>
                        <p>{data.total_singers}</p>
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
