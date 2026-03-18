/**
 * 修改用户密码脚本
 * 用于更新用户的登录密码和交易密码
 */

const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
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

async function updatePassword() {
  try {
    console.log('正在连接数据库...');
    await sequelize.authenticate();
    console.log('数据库连接成功!\n');

    const userId = '18906953569';
    const newPassword = '368015';

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const hashedTradePassword = await bcrypt.hash(newPassword, salt);

    // 更新密码
    const [result] = await sequelize.query(`
      UPDATE users 
      SET password = ?, "tradePassword" = ?, "updatedAt" = NOW()
      WHERE "userId" = ?
    `, {
      replacements: [hashedPassword, hashedTradePassword, userId]
    });

    if (result.rowCount > 0) {
      console.log('✅ 密码修改成功!');
      console.log(`账号: ${userId}`);
      console.log(`新登录密码: ${newPassword}`);
      console.log(`新交易密码: ${newPassword}`);
    } else {
      console.log('❌ 未找到该用户');
    }

  } catch (error) {
    console.error('\n❌ 修改失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

updatePassword();
