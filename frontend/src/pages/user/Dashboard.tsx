import { useEffect, useState } from 'react';
import { Table, Typography, Select, Card, Row, Col, Statistic } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMeters } from '../../store/meter';
import { fetchReport } from '../../store/report';
import type { ReportData } from '../../types';

export default function UserDashboard() {
  const [selectedMeterIds, setSelectedMeterIds] = useState<string[]>([]);
  const dispatch = useAppDispatch();
  const { meters } = useAppSelector((state) => state.meter);
  const { reportData, loading } = useAppSelector((state) => state.report);

  useEffect(() => {
    dispatch(fetchMeters({}));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchReport(selectedMeterIds.length ? { meterIds: selectedMeterIds } : {})
    );
  }, [selectedMeterIds, dispatch]);

  const totalConsumption = reportData.reduce((sum, r) => sum + r.totalConsumption, 0);

  const columns = [
    { title: 'Meter', dataIndex: 'meterName', key: 'meterName' },
    {
      title: 'Total Consumption (kWh)',
      dataIndex: 'totalConsumption',
      key: 'totalConsumption',
      render: (val: number) => val.toFixed(2),
    },
    {
      title: 'Readings',
      key: 'readings',
      render: (_: unknown, record: ReportData) => record.readings.length,
    },
  ];

  const expandedRowRender = (record: ReportData) => {
    const readingColumns = [
      {
        title: 'Timestamp',
        dataIndex: 'timestamp',
        key: 'timestamp',
        render: (ts: string) => new Date(ts).toLocaleString(),
      },
      {
        title: 'Index (kWh)',
        dataIndex: 'indexKwh',
        key: 'indexKwh',
        render: (val: number) => val.toFixed(2),
      },
      {
        title: 'Consumption (kWh)',
        dataIndex: 'consumptionKwh',
        key: 'consumptionKwh',
        render: (val: number | null) => (val !== null ? val.toFixed(2) : '—'),
      },
    ];
    return (
      <Table
        columns={readingColumns}
        dataSource={record.readings}
        rowKey="id"
        pagination={false}
        size="small"
      />
    );
  };

  return (
    <>
      <Typography.Title level={3}>Energy Consumption — Last 24 Hours</Typography.Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={16}>
          <Select
            mode="multiple"
            placeholder="Select meters to view"
            value={selectedMeterIds}
            onChange={setSelectedMeterIds}
            options={meters.map((m) => ({ value: m.id, label: m.name }))}
            style={{ width: '100%' }}
            allowClear
          />
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Consumption"
              value={totalConsumption.toFixed(2)}
              suffix="kWh"
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={reportData}
        rowKey="meterId"
        loading={loading}
        expandable={{ expandedRowRender }}
      />
    </>
  );
}
