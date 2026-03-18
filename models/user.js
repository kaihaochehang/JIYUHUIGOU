module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '用户手机号/账号'
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '登录密码（加密）'
    },
    tradePassword: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '交易密码（加密）'
    },
    yellowFish: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0.00,
      comment: '红包余额'
    },
    lockedBait: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0.00,
      comment: '积分余额'
    },
    inviteCode: {
      type: DataTypes.STRING(10),
      comment: '邀请码'
    },
    referrerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '推荐人ID'
    },
    pendingAccelerateAmount: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0.00,
      comment: '待领取加速释放金额'
    },
    lastReleaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '最后领取日期'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active',
      comment: '账户状态'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['inviteCode'] },
      { fields: ['referrerId'] }
    ]
  });

  return User;
};
