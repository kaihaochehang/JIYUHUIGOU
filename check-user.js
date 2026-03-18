const { User } = require('./models');

async function checkUser() {
    try {
        // 查找用户
        const user = await User.findOne({ where: { userId: '18906953569' } });
        if (user) {
            console.log('用户存在:', user.userId);
            console.log('密码哈希:', user.password);
            console.log('交易密码哈希:', user.tradePassword);
            console.log('状态:', user.status);
        } else {
            console.log('用户不存在');
        }
    } catch (error) {
        console.error('查询错误:', error);
    }
}

checkUser();