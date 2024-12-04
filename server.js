const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
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

// 로그인
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

    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id, username: user.username },
      'your_jwt_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
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

//회원 가입
app.post('/api/auth/register', async (req, res) => {
    console.log('Register request received:', req.body);
    const { username, password } = req.body;
  
    try {
      // 1. 기존 사용자 확인
      const [existingUsers] = await connection.promise().query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
  
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: '이미 존재하는 사용자입니다.' });
      }
  
      // 2. 비밀번호 해시화
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // 3. 새 사용자 삽입
      const [result] = await connection.promise().query(
        'INSERT INTO users (username, password, created_at) VALUES (?, ?, NOW())',
        [username, hashedPassword]
      );
  
      res.status(201).json({
        message: '회원가입이 완료되었습니다.',
        user: { id: result.insertId, username }
      });
  
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 회원 탈퇴
app.delete('/api/auth/withdraw', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '인증 정보가 없습니다.' });
    }

    const decoded = jwt.verify(token, 'your_jwt_secret_key');
    const userId = decoded.id;

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

// 상품 등록
app.post('/api/products', async (req, res) => {
  console.log('상품 등록 요청 받음:', req.body);  // 로그 추가
  const { title, price, status, handonhand, description } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret_key');
    const seller_id = decoded.id;

    const [result] = await connection.promise().query(
      'INSERT INTO products (title, price, status, handonhand, description, seller_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, price, status, handonhand, description, seller_id]
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});