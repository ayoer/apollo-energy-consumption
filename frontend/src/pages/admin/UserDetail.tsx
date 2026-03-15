import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Descriptions,
  Table,
  Button,
  Tag,
  Card,
  Space,
  Popconfirm,
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../../store/hooks';
import { fetchUserDetail } from '../../store/user';
import { fetchMeters, assignMeter, unassignMeter } from '../../store/meter';
import type { User, Meter } from '../../types';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [user, setUser] = useState<User | null>(null);
  const [orgMeters, setOrgMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUser = () => {
    if (!id) return;
    dispatch(
      fetchUserDetail({
        id,
        onSuccess: (data: User) => {
          setUser(data);
          setLoading(false);
          if (data.organizationId) {
            dispatch(
              fetchMeters({
                onSuccess: (meters: Meter[]) => {
                  setOrgMeters(
                    meters.filter((m: Meter) => m.organizationId === data.organizationId)
                  );
                },
              })
            );
          }
        },
      })
    );
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  const assignedIds = new Set(user?.assignedMeters?.map((m) => m.id) || []);

  const handleAssign = (meterId: string) => {
    dispatch(
      assignMeter({
        meterId,
        userId: id!,
        onSuccess: () => loadUser(),
      })
    );
  };

  const handleUnassign = (meterId: string) => {
    dispatch(
      unassignMeter({
        meterId,
        userId: id!,
        onSuccess: () => loadUser(),
      })
    );
  };

  const assignedColumns = [
    { title: 'Meter Name', dataIndex: 'name', key: 'name' },
    { title: 'Meter ID', dataIndex: 'id', key: 'id', ellipsis: true },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: Meter) => (
        <Popconfirm
          title="Remove this meter access?"
          onConfirm={() => handleUnassign(record.id)}
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small">
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const unassignedMeters = orgMeters.filter((m) => !assignedIds.has(m.id));

  const availableColumns = [
    { title: 'Meter Name', dataIndex: 'name', key: 'name' },
    { title: 'Meter ID', dataIndex: 'id', key: 'id', ellipsis: true },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: Meter) => (
        <Button
          type="link"
          icon={<PlusOutlined />}
          size="small"
          onClick={() => handleAssign(record.id)}
        >
          Assign
        </Button>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/users')}>
          Back to Users
        </Button>
      </Space>

      <Card loading={loading} style={{ marginBottom: 24 }}>
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          User Information
        </Typography.Title>
        {user && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Role">
              <Tag color={user.role === 'admin' ? 'red' : 'blue'}>
                {user.role.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Organization">
              {user.organization?.name || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {new Date(user.createdAt).toLocaleDateString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      {user?.organizationId && (
        <>
          <Card style={{ marginBottom: 24 }}>
            <Typography.Title level={5} style={{ marginTop: 0 }}>
              Assigned Meters ({user.assignedMeters?.length || 0})
            </Typography.Title>
            <Table
              columns={assignedColumns}
              dataSource={user.assignedMeters || []}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </Card>

          {unassignedMeters.length > 0 && (
            <Card>
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                Available Meters to Assign ({unassignedMeters.length})
              </Typography.Title>
              <Table
                columns={availableColumns}
                dataSource={unassignedMeters}
                rowKey="id"
                size="small"
                pagination={false}
              />
            </Card>
          )}
        </>
      )}
    </>
  );
}
