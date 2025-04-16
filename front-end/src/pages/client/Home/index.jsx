import React, { useState, useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import CategoryBlock from "../../../components/TopicSection/CategoryBlock";
import TestImage from "../../../assets/2024-12-08.png";
import { get_number_of_topics } from "../../../services/TopicServices";
import {
  get_number_of_top_liked_songs,
  get_number_of_top_listened_songs,
} from "../../../services/SongServices";
import useMusicPlayer from "../../../hooks/useMusicPlayer";

function Home() {
  const [topics, setTopics] = useState([]);
  const [topLikedSongs, setTopLikedSongs] = useState([]);
  const [topListenedSongs, setTopListenedSongs] = useState([]);
  const [fetchStatus, setFetchStatus] = useState({
    isLoading: false,
    isError: false,
  });
  const { playSong, setCurrentSong } = useMusicPlayer();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchStatus({
          isLoading: true,
          isError: false,
        });
        const [topics, topLikedSongs, topListenedSongs] = await Promise.all([
          get_number_of_topics(5),
          get_number_of_top_liked_songs(10),
          get_number_of_top_listened_songs(10),
        ]);
        const formattedTopics = topics.data.map((topic) => ({
          id: topic.id,
          title: topic.title,
          cover: topic.avatar,
          slug: topic.slug,
          description: topic.description,
        }));
        const formattedTopLikedSongs = topLikedSongs.data.map((song) => ({
          id: song._id,
          title: song.title,
          cover: song.avatar,
          slug: song.slug,
          description: song.description,
          audio: song.audio,
          video: song.video,
          lyrics: song.lyrics,
          isPremiumOnly: song.isPremiumOnly,
          playCount: song.play_count,
          like: song.like,
          artist: song.singers.map((item) => item.singerName).join(", "),
        }));
        const formattedTopListenedSongs = topListenedSongs.data.map((song) => ({
          id: song._id,
          title: song.title,
          cover: song.avatar,
          slug: song.slug,
          description: song.description,
          audio: song.audio,
          video: song.video,
          lyrics: song.lyrics,
          isPremiumOnly: song.isPremiumOnly,
          playCount: song.play_count,
          like: song.like,
          artist: song.singers.map((item) => item.singerName).join(", "),
        }));

        setTopics(formattedTopics);
        setTopLikedSongs(formattedTopLikedSongs);
        setTopListenedSongs(formattedTopListenedSongs);
        setFetchStatus({
          isLoading: false,
          isError: false,
        });
      } catch (e) {
        console.log("Error fetching data", e);
        setFetchStatus({
          isLoading: false,
          isError: true,
        });
      }
    };
    fetchData();
  }, []);

  return (
    <div className="app-container-wrapper">
      <Container style={{ color: "white" }}>
        <Row>
          <Col className="px-0">
            <CategoryBlock title="Chủ đề" type="topic" data={topics} />
          </Col>
        </Row>
        <Row>
          <Col className="px-0">
            <CategoryBlock
              title="Top 10 bài hát nhiều like nhất"
              type="song"
              data={topLikedSongs}
            />
          </Col>
        </Row>
        <Row>
          <Col className="px-0">
            <CategoryBlock
              title="Top 10 bài hát nhiều lượt nghe nhất"
              type="song"
              data={topListenedSongs}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Home;
