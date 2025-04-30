import { Bar } from '@ant-design/plots';
import { useEffect, useState } from 'react';
import { get_top_liked_songs } from '../../../services/StatisticalServices';

const TopMusic = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchAPI = async () => {
      const result = await get_top_liked_songs();
      if (result && result.data) {
        const transformed = result.data.map((song) => ({
          type: `${song.title} (${song.singers.join(', ')})`,
          value: song.like,
        }));
        setData(transformed);
      }
    };
    fetchAPI();
  }, []);

  const config = {
    data,
    xField: 'type',
    yField: 'value',
    colorField: 'type',
    label: {
      // position: 'middle',
      layout: [
        { type: 'interval-adjust-position' },
        { type: 'interval-hide-overlap' },
        { type: 'adjust-color' },
      ],
    },
    tooltip: {
      formatter: (datum) => ({
        name: 'Lượt thích',
        value: datum.value,
      }),
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: true,
      },
    },
    yAxis: {
      title: { text: 'Lượt thích' },
    },
    barWidthRatio: 0.6,
  };

  return <Bar {...config} />;
};

export default TopMusic;
