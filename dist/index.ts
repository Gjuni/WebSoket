import express, { Router } from 'express'; 
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import ws from 'ws';
import { errorHandler } from './middleware/error.middleware';
import path from 'path';


dotenv.config();
const app = express();
const router = Router();

app.use(express.json());
app.use(morgan('dev'));
app.use(errorHandler);
app.use('/api', router);
app.use(express.static(path.join(__dirname, '/front_html'))); // 정적 파일 미들웨어를 라우터 등록 전에 배치

// router.get('/', (req: any, res: {send : (arg0: string) => void}) => {
//   res.send('socket Routing Test');
// });
/** -> 라우터가 곂쳐서 HTML파일이 안보였던 거임!! */

// Http Server : 3000 포트
const httpPort = process.env.PORT;

app.listen(httpPort, () => {
  console.log(`Server is running on http://localhost:${httpPort}`);
});

// 정적 파일 제공 (html, css, js 파일 등)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'front_html', 'index.html')); // index.html 파일 제공
});


// Socket 통신 서버
const socketIP = process.env.SOCKET_IP; // socket IP
const socketPort = Number(process.env.SOCKET_PORT); // socket port <3001번 포트>

// 다른 포트로 인해 cors 에러 발생 방지
app.use(cors({
  origin : `http://localhost:${socketPort}`,
  methods: ["GET", "POST"]
}));

const socketServer = new ws.Server({ port : socketPort });

// front 파일에서 IP정보와 PORT 정보 숨기기위한 기능
app.get("/socket", (req, res) => {
  res.json({
    socketIP : socketIP,
    socketPort : socketPort
  });
});

// 소켓이 User와 연결되었을 때 실행되는 Event
socketServer.on('connection', (socket) => {
  console.log(`Socket Connected : ${socketIP}:${socketPort}`);

  socket.on('message', (msg) => {
    console.log(`Received Message : ${msg}`);
    socket.send(msg);
  });
});