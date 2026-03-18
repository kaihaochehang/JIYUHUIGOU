const { Sequelize } = require('sequelize');

// 检测是否在 Vercel 环境中
const isVercel = process.env.VERCEL === '1';

// 从环境变量获取数据库配置
const DB_URL = process.env.DATABASE_URL;

let sequelize;
let db = {};

if (!isVercel && DB_URL) {
  // 在非 Vercel 环境中正常初始化 Sequelize
  try {
    sequelize = new Sequelize(DB_URL, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
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
    // 初始化失败时创建一个空对象
    db = {
      Sequelize,
      sequelize: {
        authenticate: () => Promise.reject(new Error('数据库连接失败')),
        sync: () => Promise.resolve()
      },
      User: {
        findOne: () => Promise.resolve(null),
        create: () => Promise.reject(new Error('数据库不可用')),
        findAll: () => Promise.resolve([])
      },
      Transaction: {
        create: () => Promise.reject(new Error('数据库不可用')),
        findAll: () => Promise.resolve([])
      },
      Announcement: {
        findOne: () => Promise.resolve(null),
        findAll: () => Promise.resolve([])
      }
    };
  }
} else {
  // 在 Vercel 环境中返回模拟的 Sequelize 实例
  console.log('运行在 Vercel 环境中，使用模拟数据库');
  db = {
    Sequelize,
    sequelize: {
      authenticate: () => Promise.resolve(),
      sync: () => Promise.resolve()
    },
    User: {
      findOne: () => Promise.resolve(null),
      create: () => Promise.reject(new Error('数据库不可用')),
      findAll: () => Promise.resolve([])
    },
    Transaction: {
      create: () => Promise.reject(new Error('数据库不可用')),
      findAll: () => Promise.resolve([])
    },
    Announcement: {
      findOne: () => Promise.resolve({
        id: 1,
        title: '欢迎使用金渔惠购',
        content: '这是一个模拟公告，实际数据需要在非 Vercel 环境中获取',
        priority: 10,
        isactive: true,
        createdat: new Date()
      }),
      findAll: () => Promise.resolve([{
        id: 1,
        title: '欢迎使用金渔惠购',
        content: '这是一个模拟公告，实际数据需要在非 Vercel 环境中获取',
        priority: 10,
        isactive: true,
        createdat: new Date()
      }])
    }
  };
}

module.exports = db;
