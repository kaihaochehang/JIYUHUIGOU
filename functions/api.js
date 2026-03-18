const express = require('express');
const serverless = require('serverless-http');

// 导入主应用
const app = require('../server');

// 使用 serverless-http 包装 Express 应用
module.exports.handler = serverless(app);
