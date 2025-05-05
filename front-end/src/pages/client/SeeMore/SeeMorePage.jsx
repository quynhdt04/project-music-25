import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import CategoryItem from "../../../components/CategoryItem/CategoryItem";
import { get_all_topics } from "../../../services/TopicServices";
import { get_all_albums } from "../../../services/AlbumServices";

const SeeMorePage = () => {
    const [pageTitle, setPageTitle] = useState("");
    const [fetchStatus, setFetchStatus] = useState({
        isLoading: false,
        isError: false,
    });
    const { type } = useParams();
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setFetchStatus({
                    isLoading: true,
                    isError: false,
                });

                switch (type) {
                    case "album":
                        setPageTitle("Tất cả Album");
                        const responseAlbums = await get_all_albums();
                        const formattedDataAlbums = responseAlbums.data.map((album) => ({
                            id: album._id,
                            title: album.title,
                            slug: album.slug,
                            cover: album.cover_image,
                            artist: album.singer.fullName,
                        }))
                        setData(formattedDataAlbums);
                        break;

                    default: {
                        setPageTitle("Tất cả chủ đề");
                        const response = await get_all_topics();
                        const formattedData = response.topics.map((topic) => ({
                            id: topic.id,
                            title: topic.title,
                            slug: topic.slug,
                            cover: topic.avatar,
                            description: topic.description,
                        }))
        
                        setData(formattedData);
                        break;
                    }
                }


                setFetchStatus({
                    isLoading: false,
                    isError: false,
                });
            } catch (error) {
                setFetchStatus({
                    isLoading: false,
                    isError: true,
                });
                console.log(error);
            }
        }

        fetchData();

    }, [type]);


    if (fetchStatus.isLoading) {
        return (
            <div className="loading-overlay">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Xin vui lòng chờ đợi trong giây lát...</p>
            </div>
        );
    }

    return (
        <Container className="see-more-page-container" style={{ color: "white" }}>
            <Row>
                <Col className="mb-3">
                    <h3>{pageTitle}</h3>
                </Col>
            </Row>
            <Row>
                <Col className="d-flex flex-wrap">
                    {data.map((item, index) => (
                        <CategoryItem key={item.id} data={item} type={type} />
                    ))}
                </Col>
            </Row>
        </Container>
    )
}

export default SeeMorePage;
