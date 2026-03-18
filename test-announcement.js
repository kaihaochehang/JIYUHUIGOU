require('dotenv').config();
const axios = require('axios');

// 测试服务器地址
const BASE_URL = 'http://localhost:3000/api';

async function testAnnouncement() {
  console.log('开始测试公告功能...');
  
  try {
    // 测试获取公告列表
    console.log('\n=== 测试获取公告列表 ===');
    const listResponse = await axios.get(`${BASE_URL}/announcement`);
    console.log('获取公告列表成功:', listResponse.data.message || '成功');
    console.log('公告数量:', listResponse.data.data.length);
    console.log('公告列表:', listResponse.data.data);
    
    // 测试获取最新公告
    console.log('\n=== 测试获取最新公告 ===');
    const latestResponse = await axios.get(`${BASE_URL}/announcement/latest`);
    console.log('获取最新公告成功:', latestResponse.data.message || '成功');
    console.log('最新公告:', latestResponse.data.data);
    
    // 如果有公告，测试获取公告详情
    if (listResponse.data.data.length > 0) {
      const announcementId = listResponse.data.data[0].id;
      console.log('\n=== 测试获取公告详情 ===');
      // 先登录获取token
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        userId: '13800138001',
        password: '123456'
      });
      const token = loginResponse.data.data.token;
      
      const detailResponse = await axios.get(`${BASE_URL}/announcement/${announcementId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('获取公告详情成功:', detailResponse.data.message || '成功');
      console.log('公告详情:', detailResponse.data.data);
    }
    
    console.log('\n✅ 公告功能测试成功！');
    
  } catch (error) {
    console.error('测试公告功能失败:', error.response?.data?.message || error.message);
    console.error('错误详情:', error);
  }
}

testAnnouncement();