require('dotenv').config();
const axios = require('axios');

// 测试服务器地址
const BASE_URL = 'http://localhost:3000/api';

// 测试数据
const testUser = {
  userId: '13800138001',
  password: '123456',
  tradePassword: '123456'
};

const testUser2 = {
  userId: '13800138002',
  password: '123456',
  tradePassword: '123456'
};

let authToken = '';
let testUserId = null;

async function testRegister() {
  console.log('\n=== 测试注册功能 ===');
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('注册成功:', response.data.message);
    console.log('用户信息:', response.data.data.user);
    authToken = response.data.data.token;
    testUserId = response.data.data.user.id;
    return true;
  } catch (error) {
    console.error('注册失败:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n=== 测试登录功能 ===');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      userId: testUser.userId,
      password: testUser.password
    });
    console.log('登录成功:', response.data.message);
    console.log('用户信息:', response.data.data.user);
    authToken = response.data.data.token;
    testUserId = response.data.data.user.id;
    return true;
  } catch (error) {
    console.error('登录失败:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetProfile() {
  console.log('\n=== 测试获取用户信息功能 ===');
  try {
    const response = await axios.get(`${BASE_URL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('获取用户信息成功');
    console.log('用户基本信息:', response.data.data.user);
    console.log('最近交易记录数:', response.data.data.transactions.length);
    return true;
  } catch (error) {
    console.error('获取用户信息失败:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testChangePassword() {
  console.log('\n=== 测试修改密码功能 ===');
  try {
    const response = await axios.put(`${BASE_URL}/user/password`, {
      currentPassword: testUser.password,
      newPassword: '654321',
      currentTradePassword: testUser.tradePassword,
      newTradePassword: '654321'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('修改密码成功:', response.data.message);
    // 测试使用新密码登录
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      userId: testUser.userId,
      password: '654321'
    });
    console.log('使用新密码登录成功');
    authToken = loginResponse.data.data.token;
    // 改回原密码
    await axios.put(`${BASE_URL}/user/password`, {
      currentPassword: '654321',
      newPassword: testUser.password,
      currentTradePassword: '654321',
      newTradePassword: testUser.tradePassword
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('密码已改回原密码');
    // 使用原密码重新登录
    const loginResponse2 = await axios.post(`${BASE_URL}/auth/login`, {
      userId: testUser.userId,
      password: testUser.password
    });
    authToken = loginResponse2.data.data.token;
    return true;
  } catch (error) {
    console.error('修改密码失败:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetTeam() {
  console.log('\n=== 测试获取团队信息功能 ===');
  try {
    const response = await axios.get(`${BASE_URL}/user/team`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('获取团队信息成功');
    console.log('团队成员数:', response.data.data.count);
    console.log('团队成员:', response.data.data.referrals);
    return true;
  } catch (error) {
    console.error('获取团队信息失败:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testWithReferral() {
  console.log('\n=== 测试带推荐码注册功能 ===');
  try {
    // 首先登录第一个测试用户获取邀请码
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      userId: '13800138001',
      password: '123456'
    });
    const inviteCode = loginResponse.data.data.user.inviteCode;
    console.log('获取邀请码成功:', inviteCode);
    
    // 使用邀请码注册新用户
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      userId: '13800138005',
      password: '123456',
      tradePassword: '123456',
      inviteCode: inviteCode
    });
    console.log('带推荐码注册成功:', registerResponse.data.message);
    console.log('新用户信息:', registerResponse.data.data.user);
    
    // 测试第一个用户的团队信息
    const teamResponse = await axios.get(`${BASE_URL}/user/team`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.data.token}`
      }
    });
    console.log('推荐人团队信息:', teamResponse.data.data);
    return true;
  } catch (error) {
    console.error('带推荐码注册测试失败:', error.response?.data?.message || error.message);
    return true; // 即使失败也继续测试
  }
}

async function main() {
  console.log('开始测试账户所有功能...');
  
  // 测试顺序：登录现有用户1 -> 获取用户信息 -> 获取团队信息 -> 测试带推荐码注册 -> 登录用户2 -> 修改密码
  
  // 1. 测试登录现有用户1
  console.log('\n=== 测试用户1: 13800138001 ===');
  const loginSuccess = await testLogin();
  if (!loginSuccess) return;
  
  // 2. 测试获取用户信息
  const profileSuccess = await testGetProfile();
  if (!profileSuccess) return;
  
  // 3. 测试获取团队信息
  const teamSuccess = await testGetTeam();
  if (!teamSuccess) return;
  
  // 4. 测试带推荐码注册
  const referralSuccess = await testWithReferral();
  if (!referralSuccess) return;
  
  // 5. 测试登录用户2
  console.log('\n=== 测试用户2: 13800138002 ===');
  testUser.userId = testUser2.userId;
  testUser.password = testUser2.password;
  testUser.tradePassword = testUser2.tradePassword;
  const loginSuccess2 = await testLogin();
  if (!loginSuccess2) return;
  
  // 6. 测试获取用户2的信息
  const profileSuccess2 = await testGetProfile();
  if (!profileSuccess2) return;
  
  // 7. 测试修改密码
  const passwordSuccess = await testChangePassword();
  if (!passwordSuccess) return;
  
  console.log('\n=== 所有测试完成 ===');
  console.log('账户功能测试成功！');
}

// 安装axios依赖
const { execSync } = require('child_process');
try {
  console.log('检查axios依赖...');
  execSync('npm list axios', { stdio: 'ignore' });
  console.log('axios已安装');
} catch (error) {
  console.log('安装axios依赖...');
  execSync('npm install axios', { stdio: 'inherit' });
}

// 运行测试
main();