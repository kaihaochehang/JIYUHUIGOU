require('dotenv').config();
const { User } = require('./models');

async function countUsers() {
  try {
    console.log('查询数据库中的用户数量...');
    
    const userCount = await User.count();
    console.log(`数据库中共有 ${userCount} 个用户`);
    
    // 同时查询所有用户的详细信息
    const users = await User.findAll({
      attributes: ['id', 'userId', 'inviteCode', 'referrerId', 'yellowFish', 'lockedBait', 'status'],
      order: [['id', 'ASC']]
    });
    
    console.log('\n用户详情:');
    users.forEach(user => {
      console.log(`ID: ${user.id}, 账号: ${user.userId}, 邀请码: ${user.inviteCode}, 推荐人ID: ${user.referrerId || '无'}, 红包: ${user.yellowFish}, 积分: ${user.lockedBait}, 状态: ${user.status}`);
    });
    
  } catch (error) {
    console.error('查询用户数量出错:', error);
  } finally {
    // 关闭数据库连接
    const db = require('./models');
    await db.sequelize.close();
  }
}

countUsers();