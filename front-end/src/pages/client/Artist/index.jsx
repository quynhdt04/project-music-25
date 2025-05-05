import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import { get_all_singers } from "../../../services/SingerServices";
import "./artist.css";
function Artist() {
    const [singers, setSingers] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [selectedArtistId, setSelectedArtistId] = useState(null);

    useEffect(() => {
        const fetchAPI = async () => {
            try {
                const resultSingers = await get_all_singers();
                setSingers(resultSingers.singers);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách ca sĩ:", error);
                setSingers([]);  // Tránh lỗi khi request thất bại
            }
        };
        fetchAPI();
    }, [refresh]);

    return (
        <>
            <h2 className="text-white">Danh sách ca sĩ</h2>
            <div className="list-artist">
                {Array.isArray(singers) && singers.length > 0 ? (
                    singers.map((item) => (
                        <div
                            className={`item_artist ${selectedArtistId === item.id ? 'active' : ''}`}
                            key={item.id}
                            onClick={() => setSelectedArtistId(item.id)}
                        >
                            <div className="avatar-wrapper">                               
                                <Link to={`/artists/detail/${item.id}`}><img className="img_artist" src={item.avatar || 'default-image-path.jpg'} alt="anh" /></Link>
                            </div>
                            <p className="name_artist">{item.fullName}</p>
                            <p style={{ color: "white", fontSize: "12px" }}>Artist</p>
                        </div>
                    ))
                ) : (
                    <div className="no-artist" style={{ textAlign: "center", padding: "20px" }}>
                        Không có ca sĩ nào
                    </div>
                )}
            </div>
        </>
    )
}
export default Artist;