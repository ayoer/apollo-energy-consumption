import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  Popconfirm,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchMeters, createMeter, deleteMeter } from "../../store/meter";
import { fetchOrganizations } from "../../store/organization";
import type { Meter } from "../../types";

export default function Meters() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { meters, loading } = useAppSelector((state) => state.meter);
  const { organizations } = useAppSelector((state) => state.organization);

  useEffect(() => {
    dispatch(fetchMeters({}));
    dispatch(fetchOrganizations({}));
  }, [dispatch]);

  const handleCreate = (values: { name: string; organizationId: string }) => {
    dispatch(
      createMeter({
        ...values,
        onSuccess: () => {
          setIsModalOpen(false);
          form.resetFields();
          dispatch(fetchMeters({}));
        },
      }),
    );
  };

  const handleDelete = (id: string) => {
    dispatch(deleteMeter({ id }));
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Organization",
      key: "organization",
      render: (_: unknown, record: Meter) => record.organization?.name || "—",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Meter) => (
        <Popconfirm
          title="Delete this meter?"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>
          Meters
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Meter
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={meters}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="New Meter"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Create"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Meter Name"
            rules={[{ required: true, message: "Please enter meter name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="organizationId"
            label="Organization"
            rules={[
              { required: true, message: "Please select an organization" },
            ]}
          >
            <Select
              placeholder="Select organization"
              options={organizations.map((org) => ({
                value: org.id,
                label: org.name,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
