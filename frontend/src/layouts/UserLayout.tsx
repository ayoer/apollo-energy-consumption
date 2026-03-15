import { Outlet, useNavigate } from 'react-router-dom';
import { Layout, Button, theme, Typography } from 'antd';
import { LogoutOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/auth';

const { Header, Content } = Layout;

export default function UserLayout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThunderboltOutlined style={{ color: '#fff', fontSize: 24 }} />
          <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>
            Apollo Energy
          </Typography.Title>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Typography.Text style={{ color: 'rgba(255,255,255,0.85)' }}>
            {user?.email}
          </Typography.Text>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            Logout
          </Button>
        </div>
      </Header>
      <Content
        style={{
          margin: 24,
          padding: 24,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
}
