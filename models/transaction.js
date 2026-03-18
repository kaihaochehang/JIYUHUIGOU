module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM(
        'register',      // 注册奖励
        'release',       // 积分释放
        'accelerate',    // 加速释放
        'transfer_out',  // 转账支出
        'transfer_in',   // 转账收入
        'exchange',      // 兑换
        'system'         // 系统操作
      ),
      allowNull: false,
      comment: '交易类型'
    },
    amount: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0.00,
      comment: '交易金额'
    },
    yellowFish: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0.00,
      comment: '红包变动（正数为增加，负数为减少）'
    },
    lockedBait: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0.00,
      comment: '积分变动（正数为增加，负数为减少）'
    },
    toUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '对方用户ID（转账时使用）'
    },
    remark: {
      type: DataTypes.STRING(255),
      comment: '备注'
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'completed',
      comment: '交易状态'
    }
  }, {
    tableName: 'transactions',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['type'] },
      { fields: ['createdAt'] }
    ]
  });

  return Transaction;
};
