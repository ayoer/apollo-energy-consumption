import { useEffect } from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { BankOutlined, UserOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchOrganizations } from '../../store/organization';
import { fetchUsers } from '../../store/user';
import { fetchMeters } from '../../store/meter';

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { organizations } = useAppSelector((state) => state.organization);
  const { users } = useAppSelector((state) => state.user);
  const { meters } = useAppSelector((state) => state.meter);

  useEffect(() => {
    dispatch(fetchOrganizations({}));
    dispatch(fetchUsers({}));
    dispatch(fetchMeters({}));
  }, [dispatch]);

  return (
    <>
      <Typography.Title level={3}>Dashboard</Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Organizations"
              value={organizations.length}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Users" value={users.length} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Meters" value={meters.length} prefix={<ThunderboltOutlined />} />
          </Card>
        </Col>
      </Row>
    </>
  );
}
