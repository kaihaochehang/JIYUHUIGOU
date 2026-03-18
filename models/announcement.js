module.exports = (sequelize, DataTypes) => {
  const Announcement = sequelize.define('Announcement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '公告标题'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '公告内容'
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '优先级（数字越大越优先）'
    },
    isactive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否有效'
    },
    createdat: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: '创建时间'
    }
  }, {
    tableName: 'announcements',
    timestamps: false,
    indexes: [
      { fields: ['isactive'] },
      { fields: ['priority'] }
    ]
  });

  return Announcement;
};
