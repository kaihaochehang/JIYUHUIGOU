const express = require('express');
const serverless = require('serverless-http');

// 设置Netlify环境变量（必须在导入server之前设置）
process.env.NETLIFY = 'true';

// 导入主应用
const app = require('../server');

// 使用 serverless-http 包装 Express 应用
module.exports.handler = serverless(app);
