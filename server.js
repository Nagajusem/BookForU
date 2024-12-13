const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 이미지 저장을 위한 multer 설정
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static('uploads'));
app.use(cors({}));
app.use(express.json());

// MySQL 연결 설정
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'bookforu'
});

// 데이터베이스 연결
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// 채팅방 테이블 생성 쿼리
const CREATE_CHATROOMS_TABLE = `
  CREATE TABLE IF NOT EXISTS chatrooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
  )
`;

// 채팅 메시지 테이블 생성 쿼리
const CREATE_MESSAGES_TABLE = `
  CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chatroom_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (chatroom_id) REFERENCES chatrooms(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
  )
`;

// 메시지 저장 쿼리 준비
const saveMessage = async (chatroom_id, sender_id, content) => {
  try {
    const [result] = await connection.promise().query(
      'INSERT INTO messages (chatroom_id, sender_id, content) VALUES (?, ?, ?)',
      [chatroom_id, sender_id, content]
    );

    const [messageData] = await connection.promise().query(
      `SELECT m.*, u.username as sender_name 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.id = ?`,
      [result.insertId]
    );

    return messageData[0];
  } catch (error) {
    console.error('Message save error:', error);
    throw error;
  }
};

// 테이블 생성 실행
connection.query(CREATE_CHATROOMS_TABLE);
connection.query(CREATE_MESSAGES_TABLE);

// 홈스크린 시간 몇분 전 표기
function formatTimeAgo(date) {
  const now = new Date();
  const diffTime = Math.abs(now - new Date(date));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays}일 전`;
  } else if (diffHours > 0) {
    return `${diffHours}시간 전`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}분 전`;
  } else {
    return '방금 전';
  }
};

// products API 엔드포인트
app.get('/api/products', async (req, res) => {
  try {
    const [products] = await connection.promise().query(
      `SELECT p.*, u.username as seller_name 
       FROM products p 
       JOIN users u ON p.seller_id = u.id 
       ORDER BY p.created_at DESC`
    );
    
    const formattedProducts = products.map(product => ({
      ...product,
      created_at: formatTimeAgo(product.created_at),
      images: product.images ? JSON.parse(product.images) : []
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: '상품 목록을 불러오는데 실패했습니다.' });
  }
});

// 로그인 처리
app.post('/api/auth/login', async (req, res) => {
  console.log('Login request received:', req.body);
  const { username, password } = req.body;

  try {
    // 사용자 조회
    const [rows] = await connection.promise().query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    console.log('Database query result:', rows);

    if (rows.length === 0) {
      return res.status(401).json({ message: '아이디 또는 비밀번호가 잘못되었습니다.' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: '아이디 또는 비밀번호가 잘못되었습니다.' });
    }

    // 로그인 성공 시 사용자 정보만 반환
    res.json({
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 회원가입
app.post('/api/auth/register', async (req, res) => {
  console.log('Register request received:', req.body);
  const { username, password } = req.body;

  try {
    // 기존 사용자 확인
    const [existingUsers] = await connection.promise().query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '이미 존재하는 사용자입니다.' });
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새 사용자 삽입
    const [result] = await connection.promise().query(
      'INSERT INTO users (username, password, created_at) VALUES (?, ?, NOW())',
      [username, hashedPassword]
    );

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      user: { 
        id: result.insertId, 
        username 
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 회원 탈퇴
app.delete('/api/auth/withdraw', async (req, res) => {
  try {
    const { userId } = req.body; // 클라이언트에서 userId를 직접 전달받음

    await connection.promise().query(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );

    res.json({ message: '회원탈퇴가 완료되었습니다.' });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ message: '회원탈퇴 처리 중 오류가 발생했습니다.' });
  }
});

// 사용자 정보 조회 엔드포인트
app.get('/api/auth/me/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const [user] = await connection.promise().query(
      'SELECT id, username FROM users WHERE id = ?',
      [userId]
    );

    if (!user[0]) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({ user: user[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 이미지 업로드
app.post('/api/upload', upload.array('images', 10), (req, res) => {
  try {
    const files = req.files;
    const fileUrls = files.map(file => `/uploads/${file.filename}`);
    res.json({ urls: fileUrls });
  } catch (error) {
    res.status(500).json({ message: '이미지 업로드 실패' });
  }
});

// 상품 목록 조회
app.get('/api/products', async (req, res) => {
  try {
    const [products] = await connection.promise().query(
      `SELECT p.*, u.username as seller_name 
       FROM products p 
       JOIN users u ON p.seller_id = u.id 
       ORDER BY p.created_at DESC`
    );
    
    const formattedProducts = products.map(product => ({
      ...product,
      created_at: formatTimeAgo(product.created_at)
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: '상품 목록을 불러오는데 실패했습니다.' });
  }
});

app.post('/api/products', async (req, res) => {
  const { title, price, status, handonhand, description, images, userId } = req.body;

  try {
    const [result] = await connection.promise().query(
      'INSERT INTO products (title, price, status, handonhand, description, seller_id, images) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, price, status, handonhand, description, userId, JSON.stringify(images)]
    );

    res.status(201).json({ 
      message: '상품이 등록되었습니다.',
      productId: result.insertId 
    });
  } catch (error) {
    console.error('상품 등록 중 에러:', error);
    res.status(500).json({ message: '상품 등록에 실패했습니다.' });
  }
});


// 검색기능
app.get('/api/products/search', async (req, res) => {
  const { query } = req.query;
  
  try {
    if (!query) {
      return res.json([]);
    }

    const searchQuery = `%${query}%`;
    const [products] = await connection.promise().query(
      `SELECT p.*, u.username as seller_name 
       FROM products p 
       JOIN users u ON p.seller_id = u.id 
       WHERE p.title LIKE ? 
          OR p.description LIKE ? 
          OR p.status LIKE ?
       ORDER BY 
         CASE 
           WHEN p.title LIKE ? THEN 1
           WHEN p.description LIKE ? THEN 2
           ELSE 3
         END,
         p.created_at DESC
       LIMIT 20`,
      [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery]
    );

    const formattedProducts = products.map(product => ({
      ...product,
      created_at: formatTimeAgo(product.created_at),
      images: product.images ? JSON.parse(product.images) : []
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: '검색 중 오류가 발생했습니다.' });
  }
});


// WebSocket 연결 처리
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      console.log('Received message data:', data); // 데이터 로깅

      const { chatroom_id, sender_id, content } = data;
      
      if (!chatroom_id || !sender_id || !content) {
        console.error('Missing required message data');
        socket.emit('error', { message: 'Missing required message data' });
        return;
      }

      // 메시지 저장 전에 채팅방과 사용자 존재 여부 확인
      const [roomExists] = await connection.promise().query(
        'SELECT id FROM chatrooms WHERE id = ?',
        [chatroom_id]
      );

      if (!roomExists.length) {
        console.error('Chat room not found:', chatroom_id);
        socket.emit('error', { message: 'Chat room not found' });
        return;
      }

      // 메시지 저장
      const [result] = await connection.promise().query(
        'INSERT INTO messages (chatroom_id, sender_id, content, created_at) VALUES (?, ?, ?, NOW())',
        [chatroom_id, sender_id, content]
      );

      // 저장된 메시지 조회
      const [messageData] = await connection.promise().query(
        `SELECT m.*, u.username as sender_name 
         FROM messages m 
         JOIN users u ON m.sender_id = u.id 
         WHERE m.id = ?`,
        [result.insertId]
      );

      const newMessage = messageData[0];
      console.log('Saved message:', newMessage); // 저장된 메시지 로깅

      // 채팅방의 모든 참여자에게 메시지 브로드캐스트
      io.to(chatroom_id.toString()).emit('receive_message', newMessage);
      console.log('Message broadcasted to room:', chatroom_id);

    } catch (error) {
      console.error('Message handling error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


// 채팅방 생성 API
app.post('/api/chatrooms', async (req, res) => {
  try {
    const { product_id, buyer_id, seller_id } = req.body;

    // 이미 존재하는 채팅방 확인
    const [existing] = await connection.promise().query(
      'SELECT id FROM chatrooms WHERE product_id = ? AND buyer_id = ? AND seller_id = ?',
      [product_id, buyer_id, seller_id]
    );

    if (existing.length > 0) {
      return res.json({ id: existing[0].id });
    }

    // 새 채팅방 생성
    const [result] = await connection.promise().query(
      'INSERT INTO chatrooms (product_id, buyer_id, seller_id) VALUES (?, ?, ?)',
      [product_id, buyer_id, seller_id]
    );

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('Chatroom creation error:', error);
    res.status(500).json({ message: '채팅방 생성에 실패했습니다.' });
  }
});

// 사용자의 채팅방 목록 조회 API
app.get('/api/chatrooms/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const [chatrooms] = await connection.promise().query(
      `SELECT c.*, 
        p.title as product_title,
        p.price as product_price,
        u1.username as buyer_name,
        u2.username as seller_name
       FROM chatrooms c
       JOIN products p ON c.product_id = p.id
       JOIN users u1 ON c.buyer_id = u1.id
       JOIN users u2 ON c.seller_id = u2.id
       WHERE c.buyer_id = ? OR c.seller_id = ?
       ORDER BY c.created_at DESC`,
      [userId, userId]
    );

    res.json(chatrooms);
  } catch (error) {
    console.error('Chatroom list error:', error);
    res.status(500).json({ message: '채팅방 목록 조회에 실패했습니다.' });
  }
});

// 채팅방의 메시지 목록 조회 API
app.get('/api/chatrooms/:roomId/messages', async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const [messages] = await connection.promise().query(
      `SELECT m.*, u.username as sender_name 
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.chatroom_id = ?
       ORDER BY m.created_at ASC`,
      [roomId]
    );

    res.json(messages);
  } catch (error) {
    console.error('Message list error:', error);
    res.status(500).json({ message: '메시지 목록 조회에 실패했습니다.' });
  }
});

// 유저 정보 조회 API
app.get('/api/users/:userId', async (req, res) => {
  try {
    const [user] = await connection.promise().query(
      'SELECT id, username FROM users WHERE id = ?',
      [req.params.userId]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    res.json(user[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: '사용자 정보 조회 실패' });
  }
});

// 채팅방 메시지 조회 API 수정
app.get('/api/chatrooms/:roomId/messages', async (req, res) => {
  try {
    const roomId = req.params.roomId;
    // 채팅방 존재 여부 먼저 확인
    const [room] = await connection.promise().query(
      'SELECT * FROM chatrooms WHERE id = ?',
      [roomId]
    );
    
    if (room.length === 0) {
      return res.status(404).json({ message: '존재하지 않는 채팅방입니다.' });
    }

    const [messages] = await connection.promise().query(
      `SELECT m.*, u.username as sender_name 
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.chatroom_id = ?
       ORDER BY m.created_at ASC`,
      [roomId]
    );

    res.json(messages);
  } catch (error) {
    console.error('Message list error:', error);
    res.status(500).json({ message: '메시지 목록 조회에 실패했습니다.' });
  }
});

// 채팅방 생성 API 업데이트
app.post('/api/chatrooms', async (req, res) => {
  try {
    const { product_id, buyer_id, seller_id } = req.body;

    // 이미 존재하는 채팅방 확인
    const [existing] = await connection.promise().query(
      'SELECT id FROM chatrooms WHERE product_id = ? AND buyer_id = ? AND seller_id = ?',
      [product_id, buyer_id, seller_id]
    );

    if (existing.length > 0) {
      return res.json({ id: existing[0].id });
    }

    // 새 채팅방 생성
    const [result] = await connection.promise().query(
      'INSERT INTO chatrooms (product_id, buyer_id, seller_id) VALUES (?, ?, ?)',
      [product_id, buyer_id, seller_id]
    );

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('Chatroom creation error:', error);
    res.status(500).json({ message: '채팅방 생성에 실패했습니다.' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
