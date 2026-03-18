const jwt = require('jsonwebtoken');
const { User } = require('../models');

// 验证JWT令牌
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查询用户信息
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password', 'tradePassword'] }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: '账户已被禁用'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '令牌已过期'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: '无效的令牌'
    });
  }
};

// 生成JWT令牌
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = {
  authenticate,
  generateToken
};
