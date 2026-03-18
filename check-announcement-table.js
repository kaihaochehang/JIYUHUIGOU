require('dotenv').config();
const { sequelize } = require('./models');

async function checkAnnouncementTable() {
  try {
    console.log('查看公告表结构...');

    // 查看表结构
    const result = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'announcements'
      ORDER BY ordinal_position
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    console.log('公告表结构:');
    result.forEach(column => {
      console.log(`${column.column_name}: ${column.data_type} (nullable: ${column.is_nullable}, default: ${column.column_default})`);
    });

    // 尝试简单插入公告
    console.log('\n尝试插入公告...');
    const insertResult = await sequelize.query(`
      INSERT INTO announcements (title, content, priority, isactive)
      VALUES (:title, :content, :priority, :isactive)
      RETURNING id, title, content, priority, isactive, createdat
    `, {
      replacements: {
        title: '🔥新用户参与注册就送500积分',
        content: '平台上线三个月内，所有新注册用户都有赠送价值100元红包，以积分形式发放给用户。请注意查收',
        priority: 10,
        isactive: true
      },
      type: sequelize.QueryTypes.INSERT
    });

    console.log('公告添加成功！');
    console.log('公告ID:', insertResult[0][0].id);
    console.log('标题:', insertResult[0][0].title);
    console.log('内容:', insertResult[0][0].content);
    console.log('优先级:', insertResult[0][0].priority);
    console.log('状态:', insertResult[0][0].isactive ? '有效' : '无效');
    console.log('创建时间:', insertResult[0][0].createdat);

  } catch (error) {
    console.error('操作错误:', error);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
}

checkAnnouncementTable();