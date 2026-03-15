import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  Popconfirm,
  Tag,
  Space,
} from "antd";
import { PlusOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchUsers, createUser, deleteUser } from "../../store/user";
import { fetchOrganizations } from "../../store/organization";
import type { User } from "../../types";

export default function Users() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.user);
  const { organizations } = useAppSelector((state) => state.organization);

  useEffect(() => {
    dispatch(fetchUsers({}));
    dispatch(fetchOrganizations({}));
  }, [dispatch]);

  const handleCreate = (values: {
    email: string;
    password: string;
    role: "admin" | "user";
    organizationId?: string;
  }) => {
    dispatch(
      createUser({
        ...values,
        onSuccess: () => {
          setIsModalOpen(false);
          form.resetFields();
          dispatch(fetchUsers({}));
        },
      }),
    );
  };

  const handleDelete = (id: string) => {
    dispatch(deleteUser({ id }));
  };

  const roleValue = Form.useWatch("role", form);

  const columns = [
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={role === "admin" ? "red" : "blue"}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Organization",
      key: "organization",
      render: (_: unknown, record: User) => record.organization?.name || "—",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: User) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/users/${record.id}`)}
          />
          <Popconfirm
            title="Delete this user?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
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
          Users
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Add User
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="New User"
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
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Please enter a valid email",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                min: 6,
                message: "Password must be at least 6 characters",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select
              placeholder="Select role"
              options={[
                { value: "admin", label: "Admin" },
                { value: "user", label: "User" },
              ]}
            />
          </Form.Item>
          {roleValue === "user" && (
            <Form.Item
              name="organizationId"
              label="Organization"
              rules={[
                {
                  required: true,
                  message: "Users must belong to an organization",
                },
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
          )}
        </Form>
      </Modal>
    </>
  );
}
