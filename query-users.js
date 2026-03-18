/**
 * 查询用户数据脚本
 * 用于在终端中查看用户信息
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
  logging: false
});

async function queryUsers() {
  try {
    console.log('正在连接数据库...');
    await sequelize.authenticate();
    console.log('数据库连接成功!\n');

    // 查询所有用户
    const [users] = await sequelize.query(`
      SELECT 
        id,
        "userId" as "手机号",
        "yellowFish" as "红包",
        "lockedBait" as "积分",
        "inviteCode" as "邀请码",
        "referrerId" as "推荐人ID",
        "pendingAccelerateAmount" as "待领取加速",
        status as "状态",
        "createdAt" as "注册时间"
      FROM users
      ORDER BY "createdAt" DESC
    `);

    if (users.length === 0) {
      console.log('暂无用户数据');
    } else {
      console.log(`共找到 ${users.length} 个用户:\n`);
      console.table(users);
    }

  } catch (error) {
    console.error('\n❌ 查询失败:', error.message);
    if (error.message.includes('password authentication failed')) {
      console.error('提示: 请检查 DATABASE_URL 中的密码是否正确');
    }
    if (error.message.includes('connect ETIMEDOUT')) {
      console.error('提示: 无法连接到数据库，请检查网络连接');
    }
  } finally {
    await sequelize.close();
  }
}

queryUsers();
