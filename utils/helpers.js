const bcrypt = require('bcryptjs');

// 生成邀请码
const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// 加密密码
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// 验证密码
const verifyPassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// 格式化数字
const formatNumber = (num) => {
  return parseFloat(num).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// 生成交易记录
const createTransactionRecord = async (userId, type, yellowFish, lockedBait, remark, toUserId = null) => {
  const { Transaction } = require('../models');
  
  return await Transaction.create({
    userId,
    type,
    amount: 0, // 默认金额为0
    yellowFish,
    lockedBait,
    remark,
    toUserId,
    status: 'completed'
  });
};

// 计算积分释放金额
const calculateReleaseAmount = (lockedBait) => {
  const rate = parseFloat(process.env.DAILY_RELEASE_RATE) || 0.002;
  return parseFloat((lockedBait * rate).toFixed(2));
};

// 计算转账奖励
const calculateTransferReward = (amount) => {
  const rewardRate = parseFloat(process.env.TRANSFER_REWARD_RATE) || 0.5;
  return parseFloat((amount * rewardRate).toFixed(2));
};

// 计算兑换加速金额
const calculateAccelerateAmount = (amount) => {
  const accelerateRate = parseFloat(process.env.EXCHANGE_ACCELERATE_RATE) || 0.08;
  return parseFloat((amount * accelerateRate).toFixed(2));
};

module.exports = {
  generateInviteCode,
  hashPassword,
  verifyPassword,
  formatNumber,
  createTransactionRecord,
  calculateReleaseAmount,
  calculateTransferReward,
  calculateAccelerateAmount
};
