import { useEffect, useState } from 'react';
import { Pie } from '@ant-design/plots';

const TopicChart = () => {
    //so luong bai hat cua moi chu de
  const [data, setData] = useState([]);
  useEffect(() => {
    setTimeout(() => {
      setData([
        { type: '分类一', value: 27 },
        { type: '分类二', value: 25 },
        { type: '分类三', value: 18 },
        { type: '分类四', value: 15 },
        { type: '分类五', value: 10 },
        { type: '其他', value: 5 },
      ]);
    }, 1000);
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
  };
  return <Pie {...config} />;
};

export default TopicChart;
