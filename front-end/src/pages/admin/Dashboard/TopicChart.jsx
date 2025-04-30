import { useEffect, useState } from 'react';
import { Pie } from '@ant-design/plots';
import { get_songcount_by_topic } from '../../../services/StatisticalServices';

const TopicChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchAPI = async () => {
      try {
        const result = await get_songcount_by_topic();
        if (result?.data) {
          const formattedData = result.data
            .filter(item => item.song_count > 0) // chỉ hiển thị chủ đề có bài hát
            .map(item => ({
              type: item.topicName,
              value: item.song_count
            }));
          setData(formattedData);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };
    fetchAPI();
  }, []);

  const config = {
    data,
    angleField: 'value',
    colorField: 'type',
    label: {
      text: 'value',
      style: {
        fontWeight: 'bold',
      },
    },
    legend: {
      color: {
        title: false,
        position: 'right',
        rowPadding: 5,
      },
    },
    tooltip: {
      customContent: (title, items) => {
        return `<div style="padding: 5px"><strong>${title}</strong>: ${items?.[0]?.value} bài hát</div>`;
      }
    },
  };

  return <Pie {...config} />;
};

export default TopicChart;
