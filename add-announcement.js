require('dotenv').config();
const { sequelize } = require('./models');

async function addAnnouncement() {
  try {
    console.log('开始添加公告...');

    // 使用原始SQL直接插入公告
    const result = await sequelize.query(`
      INSERT INTO announcements (title, content, publish_time, is_active, priority, created_at, updated_at)
      VALUES (:title, :content, :publishTime, :isActive, :priority, NOW(), NOW())
      RETURNING id, title, content, publish_time, is_active, priority
    `, {
      replacements: {
        title: '🔥新用户参与注册就送500积分',
        content: '平台上线三个月内，所有新注册用户都有赠送价值100元红包，以积分形式发放给用户。请注意查收',
        publishTime: new Date(),
        isActive: true,
        priority: 10
      },
      type: sequelize.QueryTypes.INSERT
    });

    console.log('公告添加成功！');
    console.log('公告ID:', result[0][0].id);
    console.log('标题:', result[0][0].title);
    console.log('内容:', result[0][0].content);
    console.log('发布时间:', result[0][0].publish_time);
    console.log('状态:', result[0][0].is_active ? '有效' : '无效');
    console.log('优先级:', result[0][0].priority);

  } catch (error) {
    console.error('添加公告错误:', error);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
}

addAnnouncement();