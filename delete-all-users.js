require('dotenv').config();
const db = require('./models');

async function deleteAllUsers() {
  try {
    console.log('开始删除所有用户数据...');
    
    // 先删除交易记录（因为有外键约束）
    console.log('删除交易记录...');
    await db.Transaction.destroy({ truncate: true, cascade: true });
    console.log('交易记录删除完成');
    
    // 再删除用户记录
    console.log('删除用户记录...');
    await db.User.destroy({ truncate: true, cascade: true });
    console.log('用户记录删除完成');
    
    console.log('所有用户数据已成功删除');
  } catch (error) {
    console.error('删除用户数据时出错:', error);
  } finally {
    // 关闭数据库连接
    await db.sequelize.close();
  }
}

deleteAllUsers();