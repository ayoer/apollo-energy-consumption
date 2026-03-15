import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, Typography, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchOrganizations,
  createOrganization,
  deleteOrganization,
} from '../../store/organization';
import type { Organization } from '../../types';

export default function Organizations() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { organizations, loading } = useAppSelector((state) => state.organization);

  useEffect(() => {
    dispatch(fetchOrganizations({}));
  }, [dispatch]);

  const handleCreate = (values: { name: string }) => {
    dispatch(
      createOrganization({
        name: values.name,
        onSuccess: () => {
          setIsModalOpen(false);
          form.resetFields();
        },
      })
    );
  };

  const handleDelete = (id: string) => {
    dispatch(deleteOrganization({ id }));
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Organization) => (
        <Popconfirm title="Delete this organization?" onConfirm={() => handleDelete(record.id)}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>
          Organizations
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Add Organization
        </Button>
      </div>

      <Table columns={columns} dataSource={organizations} rowKey="id" loading={loading} />

      <Modal
        title="New Organization"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Create"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Organization Name"
            rules={[{ required: true, message: 'Please enter organization name' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
