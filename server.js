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

// 初始化Supabase（仅在环境变量存在时）
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  } catch (error) {
    console.error('Supabase 初始化失败:', error);
  }
}

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
app.use(limiter);

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

// 数据库连接
let db;
try {
  db = require('./models');
  // 只在非 Netlify 环境中验证连接
  if (!isNetlify) {
    // 同步数据库（仅验证连接，不修改表结构）
    db.sequelize.authenticate().then(() => {
      console.log('数据库连接成功');
    }).catch(err => {
      console.error('数据库连接失败:', err);
    });
  }
} catch (error) {
  console.error('数据库初始化失败:', error);
  // 创建一个备用的 db 对象，确保应用能正常启动
  db = {
    Sequelize: require('sequelize'),
    sequelize: {
      authenticate: () => Promise.reject(new Error('数据库连接失败')),
      sync: () => Promise.resolve()
    },
    User: {
      findOne: () => Promise.reject(new Error('数据库不可用')),
      create: () => Promise.reject(new Error('数据库不可用')),
      findAll: () => Promise.reject(new Error('数据库不可用'))
    },
    Transaction: {
      create: () => Promise.reject(new Error('数据库不可用')),
      findAll: () => Promise.reject(new Error('数据库不可用'))
    },
    Announcement: {
      findOne: () => Promise.reject(new Error('数据库不可用')),
      findAll: () => Promise.reject(new Error('数据库不可用'))
    }
  };
}

// 路由 - 在Netlify环境中使用不带/api前缀的路径
const apiPrefix = isNetlify ? '' : '/api';
// 将 db 对象传递给路由
app.use(`${apiPrefix}/auth`, require('./routes/auth')(db));
app.use(`${apiPrefix}/user`, require('./routes/user')(db));
app.use(`${apiPrefix}/transaction`, require('./routes/transaction')(db));
app.use(`${apiPrefix}/announcement`, require('./routes/announcement')(db));

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

// 启动定时任务（仅在非 Netlify 环境中）
if (!isNetlify) {
  require('./cron/jobs');
}

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
