/**
 * หน้าอธิบายการทำงานของ API และ Socket.IO แบบละเอียด
 * พร้อมตัวอย่าง code และคำอธิบายการทำงาน
 */

import { Container, Typography, Box, Button, Stack, Paper, Alert, Divider } from '@mui/material';
import { Link } from 'react-router-dom';

const ApiSocketPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        07. API & Socket.IO
      </Typography>

      {/* API Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          📡 API (REST)
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          การตั้งค่า Axios Instance
        </Typography>

        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
          <Typography component="pre" sx={{ m: 0, fontSize: '0.875rem', overflow: 'auto' }}>
{`// สร้าง instance พร้อม base URL
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});`}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Custom Hook: useDetections
        </Typography>

        <Typography variant="body1" paragraph>
          ใช้ React Query เพื่อจัดการ API call พร้อม caching และ auto-refetch
        </Typography>

        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
          <Typography component="pre" sx={{ m: 0, fontSize: '0.875rem', overflow: 'auto' }}>
{`export const useDetections = (camId, token, enabled) => {
  return useQuery({
    queryKey: ['detections', camId],
    queryFn: () => getRecentDetections(camId, token),
    enabled: enabled && !!camId && !!token,
    refetchInterval: 30000, // refetch ทุก 30 วินาที
  });
};`}
          </Typography>
        </Box>

        <Alert severity="success" sx={{ mt: 2 }}>
           <strong>ข้อดีของ React Query:</strong> Automatic caching, Auto refetch, Loading & Error states
        </Alert>
      </Paper>

      {/* Socket.IO Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          🔌 Socket.IO (Real-time)
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Custom Hook: useSocket
        </Typography>

        <Typography variant="body1" paragraph>
          เชื่อมต่อ Socket.IO และรับข้อมูล real-time
        </Typography>

        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
          <Typography component="pre" sx={{ m: 0, fontSize: '0.875rem', overflow: 'auto' }}>
{`export const useSocket = (camId, enabled) => {
  const [realtimeData, setRealtimeData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_SOCKET_URL);

    socketInstance.on('connect', () => {
      socketInstance.emit('subscribe_camera', { cam_id: camId });
    });

    socketInstance.on('object_detection', (data) => {
      setRealtimeData(data);
    });

    return () => socketInstance.disconnect();
  }, [camId, enabled]);

  return { realtimeData, isConnected };
};`}
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          💡 <strong>หลักการทำงาน:</strong> Client เชื่อมต่อ → Subscribe camera → รับข้อมูล real-time
        </Alert>
      </Paper>

      {/* Combined Usage */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          🎯 การใช้งานรวมกันใน Dashboard
        </Typography>

        <Typography variant="body1" paragraph>
          Dashboard ใช้ทั้ง API และ Socket.IO เพื่อ:
        </Typography>

        <Typography component="div">
          <ul>
            <li><strong>API</strong> - ดึงข้อมูลการตรวจจับย้อนหลัง (history)</li>
            <li><strong>Socket.IO</strong> - รับข้อมูลการตรวจจับแบบ real-time</li>
            <li><strong>Combined</strong> - รวมข้อมูลทั้งสองแสดงในหน้าเดียว</li>
          </ul>
        </Typography>

        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2, mt: 2 }}>
          <Typography component="pre" sx={{ m: 0, fontSize: '0.875rem', overflow: 'auto' }}>
{`// ดึง history จาก API
const { data } = useDetections(camId, token, isStarted);

// รับ real-time data จาก Socket.IO
const { realtimeData } = useSocket(camId, isStarted);

// รวมข้อมูลทั้งสอง
useEffect(() => {
  if (realtimeData) {
    setAllDetections((prev) => [realtimeData, ...prev]);
  }
}, [realtimeData]);`}
          </Typography>
        </Box>

        <Alert severity="success" sx={{ mt: 2 }}>
           <strong>ผลลัพธ์:</strong> ได้ข้อมูลครบทั้งย้อนหลังและ real-time ในหน้าเดียว!
        </Alert>
      </Paper>

      <Stack direction="row" spacing={2}>
        <Link to="/06-map" style={{ textDecoration: 'none' }}>
          <Button variant="outlined">
            หน้าก่อนหน้า: Map Component
          </Button>
        </Link>
        <Link to="/08-dashboard" style={{ textDecoration: 'none' }}>
          <Button variant="contained">
            ไปหน้าถัดไป: Dashboard
          </Button>
        </Link>
      </Stack>
    </Container>
  );
};

export default ApiSocketPage;
