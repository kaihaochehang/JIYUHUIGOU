require('dotenv').config();
const axios = require('axios');
const { sequelize } = require('./models');

// 测试服务器地址
const BASE_URL = 'http://localhost:3000';

async function testApiConnection() {
  console.log('\n=== 测试API接口连接 ===');
  try {
    // 测试根路径
    const rootResponse = await axios.get(`${BASE_URL}`);
    console.log('根路径访问成功:', rootResponse.status);
    
    // 测试登录接口
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      userId: '13800138001',
      password: '123456'
    });
    console.log('登录接口测试成功:', loginResponse.data.message);
    console.log('获取到的token:', loginResponse.data.data.token.substring(0, 20) + '...');
    
    return true;
  } catch (error) {
    console.error('API接口测试失败:', error.message);
    return false;
  }
}

async function testDatabaseConnection() {
  console.log('\n=== 测试数据库连接 ===');
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 测试数据库查询
    const { User } = require('./models');
    const userCount = await User.count();
    console.log(`数据库中共有 ${userCount} 个用户`);
    
    return true;
  } catch (error) {
    console.error('数据库连接测试失败:', error.message);
    return false;
  } finally {
    await sequelize.close();
  }
}

async function testFrontendAccess() {
  console.log('\n=== 测试前端页面访问 ===');
  try {
    const response = await axios.get(`${BASE_URL}`, {
      headers: {
        'Accept': 'text/html'
      }
    });
    console.log('前端页面访问成功:', response.status);
    console.log('页面内容长度:', response.data.length, '字符');
    
    return true;
  } catch (error) {
    console.error('前端页面访问失败:', error.message);
    return false;
  }
}

async function main() {
  console.log('开始测试本地连接...');
  
  const apiResult = await testApiConnection();
  const dbResult = await testDatabaseConnection();
  const frontendResult = await testFrontendAccess();
  
  console.log('\n=== 测试结果汇总 ===');
  console.log('API接口连接:', apiResult ? '成功' : '失败');
  console.log('数据库连接:', dbResult ? '成功' : '失败');
  console.log('前端页面访问:', frontendResult ? '成功' : '失败');
  
  if (apiResult && dbResult && frontendResult) {
    console.log('\n✅ 所有本地连接测试成功！');
  } else {
    console.log('\n❌ 部分测试失败，请检查相关服务');
  }
}

main();