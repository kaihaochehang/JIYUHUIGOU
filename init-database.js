/**
 * 数据库初始化脚本
 * 用于在 Supabase 中创建初始表结构和数据
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  console.error('错误: 请设置 DATABASE_URL 环境变量');
  process.exit(1);
}

const sequelize = new Sequelize(DB_URL, {
  dialect: 'postgres',
  logging: console.log
});

async function initDatabase() {
  try {
    console.log('正在连接数据库...');
    await sequelize.authenticate();
    console.log('数据库连接成功!');

    console.log('\n正在同步表结构...');
    
    // 导入模型
    const User = require('./models/user')(sequelize, Sequelize);
    const Transaction = require('./models/transaction')(sequelize, Sequelize);
    const Announcement = require('./models/announcement')(sequelize, Sequelize);

    // 建立关联关系
    User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
    Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    User.belongsTo(User, { foreignKey: 'referrerId', as: 'referrer' });
    User.hasMany(User, { foreignKey: 'referrerId', as: 'referrals' });

    // 同步所有模型（创建表）
    await sequelize.sync({ alter: true });
    console.log('表结构同步完成!');

    // 检查是否已有公告
    const announcementCount = await Announcement.count();
    if (announcementCount === 0) {
      console.log('\n正在创建初始公告...');
      await Announcement.create({
        title: '🔥新用户参与注册就送500积分',
        content: '本平台于2026年06月06号正式上线。三个月内，所有新注册用户都有赠送价值100元红包，以积分形式发放给用户。请注意查收',
        platform: '金渔惠购',
        publishTime: new Date('2026-06-06'),
        isActive: true,
        priority: 10
      });
      console.log('初始公告创建完成!');
    }

    console.log('\n✅ 数据库初始化完成!');
    console.log('\n创建的表:');
    console.log('- users (用户表)');
    console.log('- transactions (交易记录表)');
    console.log('- announcements (公告表)');

  } catch (error) {
    console.error('\n❌ 初始化失败:', error.message);
    if (error.message.includes('password authentication failed')) {
      console.error('\n提示: 请检查 DATABASE_URL 中的密码是否正确');
    }
    if (error.message.includes('connect ETIMEDOUT')) {
      console.error('\n提示: 无法连接到数据库，请检查网络连接和防火墙设置');
    }
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

initDatabase();
