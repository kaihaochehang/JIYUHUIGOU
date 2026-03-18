const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// 检测是否在 Vercel 环境中运行
const isVercel = process.env.VERCEL === '1';

// 检测是否在 Netlify 环境中运行
const isNetlify = process.env.NETLIFY === 'true';

// 初始化Supabase
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 数据库连接 - 仅在非 Vercel 和非 Netlify 环境中连接
let db;
if (!isVercel && !isNetlify) {
  try {
    db = require('./models');
    // 同步数据库（仅验证连接，不修改表结构）
    db.sequelize.authenticate().then(() => {
      console.log('数据库连接成功');
    }).catch(err => {
      console.error('数据库连接失败:', err);
    });
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
} else {
  console.log(`运行在 ${isVercel ? 'Vercel' : 'Netlify'} 环境中，跳过数据库连接`);
  // 创建一个空的 db 对象，避免后续代码出错
  db = {
    sequelize: {
      authenticate: () => Promise.resolve()
    }
  };
}

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/transaction', require('./routes/transaction'));
app.use('/api/announcement', require('./routes/announcement'));

// 前端路由 - 所有非API请求都返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动定时任务
require('./cron/jobs');

// 获取本地 IP 地址
function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIP = getLocalIP();

// 只在非 Vercel 和非 Netlify 环境中启动服务器监听
if (!isVercel && !isNetlify) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`本地访问: http://localhost:${PORT}`);
    console.log(`局域网访问: http://${localIP}:${PORT}`);
    console.log(`外部访问: http://0.0.0.0:${PORT}`);
  });
} else {
  console.log(`运行在 ${isVercel ? 'Vercel' : 'Netlify'} 环境中`);
}

module.exports = app;
