require('dotenv').config();
const { User } = require('./models');
const { hashPassword } = require('./utils/helpers');

async function createTestUser() {
    try {
        // 加密密码
        const hashedPassword = await hashPassword('123456');
        const hashedTradePassword = await hashPassword('123456');

        // 创建用户
        const newUser = await User.create({
            userId: '18906953569',
            password: hashedPassword,
            tradePassword: hashedTradePassword,
            yellowFish: 0,
            lockedBait: 500,
            inviteCode: 'TEST123456',
            status: 'active'
        });

        console.log('测试用户创建成功:', newUser.userId);
    } catch (error) {
        console.error('创建测试用户错误:', error);
    }
}

createTestUser();