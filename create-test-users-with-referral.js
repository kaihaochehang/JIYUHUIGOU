require('dotenv').config();
const { User } = require('./models');
const { hashPassword, generateInviteCode } = require('./utils/helpers');

async function createTestUsers() {
  try {
    // 加密密码
    const hashedPassword = await hashPassword('123456');
    const hashedTradePassword = await hashPassword('123456');

    console.log('开始创建测试用户...');

    // 创建第一个用户（上级）
    const user1 = await User.create({
      userId: '13800138001',
      password: hashedPassword,
      tradePassword: hashedTradePassword,
      yellowFish: 0,
      lockedBait: 500,
      inviteCode: generateInviteCode(),
      status: 'active'
    });

    console.log('第一个测试用户创建成功:', user1.userId, '邀请码:', user1.inviteCode);

    // 创建第二个用户（下级），关联到第一个用户
    const user2 = await User.create({
      userId: '13800138002',
      password: hashedPassword,
      tradePassword: hashedTradePassword,
      yellowFish: 0,
      lockedBait: 500,
      inviteCode: generateInviteCode(),
      referrerId: user1.id,
      status: 'active'
    });

    console.log('第二个测试用户创建成功:', user2.userId, '邀请码:', user2.inviteCode);
    console.log('关联关系：', user1.userId, '→', user2.userId);
    console.log('所有测试用户创建完成');

  } catch (error) {
    console.error('创建测试用户错误:', error);
  }
}

createTestUsers();