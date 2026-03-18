require('dotenv').config();
const { User } = require('./models');
const { hashPassword } = require('./utils/helpers');

async function resetPassword() {
    try {
        // 加密新密码
        const hashedPassword = await hashPassword('123456');

        // 更新用户密码
        const result = await User.update(
            { password: hashedPassword },
            { where: { userId: '18906953569' } }
        );

        if (result[0] > 0) {
            console.log('密码重置成功');
        } else {
            console.log('用户不存在');
        }
    } catch (error) {
        console.error('重置密码错误:', error);
    }
}

resetPassword();