const { Sequelize } = require('sequelize');

// 从环境变量获取数据库配置
const DB_URL = process.env.DATABASE_URL;

// 添加调试日志
console.log('DATABASE_URL是否存在:', !!DB_URL);
console.log('当前环境:', process.env.NODE_ENV);
console.log('NETLIFY环境:', process.env.NETLIFY);

let sequelize;
let db = {};

if (DB_URL) {
  // 正常初始化 Sequelize
  try {
    // 检测是否在Netlify环境
    const isNetlify = process.env.NETLIFY === 'true';
    
    sequelize = new Sequelize(DB_URL, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: isNetlify ? {
        // Netlify环境：使用更小的连接池和更短的超时
        max: 2,
        min: 0,
        acquire: 5000,
        idle: 1000,
        evict: 5000
      } : {
        // 本地环境：正常配置
        max: 5,
        min: 0,
        acquire: 10000,
        idle: 5000,
        evict: 10000
      },
      dialectOptions: {
        connectTimeout: isNetlify ? 3000 : 5000,
        // Netlify环境需要SSL
        ssl: isNetlify ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    });

    db.Sequelize = Sequelize;
    db.sequelize = sequelize;

    // 导入模型
    db.User = require('./user')(sequelize, Sequelize);
    db.Transaction = require('./transaction')(sequelize, Sequelize);
    db.Announcement = require('./announcement')(sequelize, Sequelize);

    // 定义关联关系
    // 用户与交易记录
    db.User.hasMany(db.Transaction, { foreignKey: 'userId', as: 'transactions' });
    db.Transaction.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

    // 用户与推荐人
    db.User.belongsTo(db.User, { foreignKey: 'referrerId', as: 'referrer' });
    db.User.hasMany(db.User, { foreignKey: 'referrerId', as: 'referrals' });
  } catch (error) {
    console.error('数据库初始化失败:', error);
    // 重新抛出错误，确保应用知道数据库连接失败
    throw new Error('数据库连接失败: ' + error.message);
  }
} else {
  // 没有数据库配置时返回备用对象
  console.warn('没有数据库配置，使用备用对象');
  db.Sequelize = Sequelize;
  db.sequelize = {
    authenticate: () => Promise.reject(new Error('数据库连接失败')),
    sync: () => Promise.resolve()
  };
  db.User = {
    findOne: () => Promise.reject(new Error('数据库不可用')),
    create: () => Promise.reject(new Error('数据库不可用')),
    findAll: () => Promise.reject(new Error('数据库不可用')),
    findByPk: () => Promise.reject(new Error('数据库不可用'))
  };
  db.Transaction = {
    create: () => Promise.reject(new Error('数据库不可用')),
    findAll: () => Promise.reject(new Error('数据库不可用')),
    findAndCountAll: () => Promise.reject(new Error('数据库不可用'))
  };
  db.Announcement = {
    findOne: () => Promise.reject(new Error('数据库不可用')),
    findAll: () => Promise.reject(new Error('数据库不可用')),
    findByPk: () => Promise.reject(new Error('数据库不可用'))
  };
}

// 导出数据库实例
module.exports = db;