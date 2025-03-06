import express, { Router } from 'express'; 
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import ws from 'ws';
import { errorHandler } from './middleware/error.middleware';


dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const router = Router();

router.get('/', (req: any, res: {send : (arg0: string) => void}) => {
  res.send('socket Routing Test');
});


app.use(express.json());
app.use(morgan('dev'));
app.use('/', router);
app.use(errorHandler);

// 일반적 HTTP 서버 개방
const httpPort = process.env.PORT;
// 서버 실행 <3000번 포트>
app.listen(httpPort, () => {
  console.log(`Server is running on http://localhost:${httpPort}`);
});

app.get('/', (req, res) => {
  res.send("HTTP Server TEST");
});


// Socket 통신 서버
const socketIP = process.env.SOCKET_IP; // socket IP
const socketPort = Number(process.env.SOCKET_PORT); // socket port <3001번 포트>

app.use(cors({
  origin : `http://localhost:${socketPort}`,
})); // 다른 포트로 인해 cors 에러 발생 방지

const socketServer = new ws.Server({ port : socketPort }); // Socket통신 open

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
