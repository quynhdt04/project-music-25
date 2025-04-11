import { IoMdMusicalNotes } from "react-icons/io";
import { LuRefreshCcw } from "react-icons/lu";
import { FaHeart, FaPlay } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoAddOutline } from "react-icons/io5";
import DropupMenu from "../../../components/DropupMenu";

function PlayListDetail() {

    return (
        <>
            <div className="playlist">
                <div className="playlist__info">
                    <div className="playlist__cover">
                        <img src="https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/04/hinh-nen-de-thuong.jpg" alt="" />
                    </div>
                    <div className="playlist__details">
                        <h2>Name</h2>
                        <p >Tạo bởi <strong>Đinh Quỳnh</strong></p>
                        <button className="play-btn"> <FaPlay /> Tiếp tục phát</button>
                        <DropupMenu />
                    </div>
                </div>

                <div className="playlist__music">
                    {/* Nếu không có danh sách */}
                    <div className="playlist__list-null">
                        <IoMdMusicalNotes />
                        <h4>Không có bài hát nào trong danh sách này</h4>
                    </div>
                    {/* Có danh sách */}
                    <div className="playlist__list">
                        <div className="playlist__header">
                            <span>BÀI HÁT</span>
                            <span>ALBUM</span>
                            <span>THỜI GIAN</span>
                        </div>
                        <div className="playlist__song">
                            <div className="playlist__song-info">
                                <div className="playlist__thumbnail-wrapper">
                                    <img src="https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/04/hinh-nen-de-thuong.jpg"
                                        alt="Mặt Mộc" className="playlist__thumbnail" />
                                    <div className="playlist__play-icon">
                                        <FaPlay />
                                    </div>
                                </div>
                                <div className="playlist__details">
                                    <h4 className="playlist__title">Mặt Mộc (Acoustic Version)</h4>
                                    <p className="playlist__artists">Phạm Nguyên Ngọc, VAnh, Ân Nhi, BMZ</p>
                                </div>
                            </div>
                            <span className="playlist__album">Mặt Mộc (Single)</span>
                            <span className="playlist__duration">03:24</span>
                            <div className="playlist__actions">
                                <FaHeart />
                                <RiDeleteBin6Line />
                            </div>
                        </div>
                        <div className="playlist__footer">
                            <span>1 bài hát • 3 phút</span>
                        </div>
                    </div>
                    <div className="suggested-songs">
                        <div className="suggested-songs__header">
                            <h3>Bài Hát Gợi Ý</h3>
                            <button>
                                <LuRefreshCcw /> Làm mới
                            </button>
                        </div>

                        <div className="playlist__song">
                            <div className="playlist__song-info">
                                <div className="playlist__thumbnail-wrapper">
                                    <img src="https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/04/hinh-nen-de-thuong.jpg"
                                        alt="Mặt Mộc" className="playlist__thumbnail" />
                                    <div className="playlist__play-icon">
                                        <FaPlay />
                                    </div>
                                </div>
                                <div className="playlist__details">
                                    <h4 className="playlist__title">Mặt Mộc (Acoustic Version)</h4>
                                    <p className="playlist__artists">Phạm Nguyên Ngọc, VAnh, Ân Nhi, BMZ</p>
                                </div>
                            </div>
                            <span className="playlist__album">Mặt Mộc (Single)</span>
                            <span className="playlist__duration">03:24</span>
                            <div className="playlist__actions">
                                <FaHeart />
                                <IoAddOutline />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PlayListDetail;