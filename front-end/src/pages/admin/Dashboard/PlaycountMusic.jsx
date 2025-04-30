import { Column } from '@ant-design/plots';
import { get_playcount_by_topic } from '../../../services/StatisticalServices';
import { useEffect, useState } from 'react';

const PlaycountMusic = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchAPI = async () => {
      const result = await get_playcount_by_topic();
      if (result?.data) {
        const formattedData = result.data.map((item) => ({
          topicName: item.topicName,
          play_count: item.play_count,
        }));
        setData(formattedData);
      }
    };
    fetchAPI();
  }, []);

  const config = {
    data,
    xField: 'topicName',
    yField: 'play_count',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      topicName: { alias: 'Thể loại' },
      play_count: { alias: 'Lượt nghe' },
    },
    color: '#6395F9',
  };

  return <Column {...config} />;
};

export default PlaycountMusic;
