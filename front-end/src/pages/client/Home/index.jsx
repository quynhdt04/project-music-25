import React, { useState, useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import CategoryBlock from "../../../components/TopicSection/CategoryBlock";
import TestImage from "../../../assets/2024-12-08.png";

function Home() {
  const [topics, setTopics] = useState([]);
  const [fetchStatus, setFetchStatus] = useState({
    isLoading: false,
    isError: false,
  });

  useEffect(() => {
    const fetchTopics = async () => {
      setFetchStatus({
        isLoading: true,
        isError: false,
      });

      try {
        const response = await fetch("http://localhost:3001/topics");
        const data = await response.json();
        setTopics(data);
      } catch (error) {
        setFetchStatus({
          isLoading: false,
          isError: true,
        });
      }
    };

    // fetchTopics();
  }, []);

  return (
    <Container style={{ color: "white" }}>
      <Row>
        <Col className="px-0">
          <CategoryBlock
            title="Chill"
            data={[
              {
                id: 1,
                title: "Thả mình vào dòng chảy của những giai điệu cực chill",
                cover: TestImage,
              },
              {
                id: 2,
                title: "Chất indie nguyên sơ trong từng tiếng đàn",
                cover: TestImage,
              },
              {
                id: 3,
                title: "Thả mình cùng những giai điệu V-POP nhẹ nhàng",
                cover: TestImage,
              },
              {
                id: 4,
                title: "Thanh âm Lofi Việt nghe không dứt ra được",
                cover: TestImage,
              },
              {
                id: 5,
                title: "Thả mình vào những giai điệu Lofi Chill nghe là nghiện",
                cover: TestImage,
              },
            ]}
          />
        </Col>
      </Row>
      <Row>
        <Col className="px-0">
          <CategoryBlock title="Top 10 bài hát nhiều like nhất" data={[]} />
        </Col>
      </Row>
      <Row>
        <Col className="px-0">
          <CategoryBlock
            title="Top 10 bài hát nhiều lượt nghe nhất"
            data={[]}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
