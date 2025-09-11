# Leaderboard 功能测试指南

## 功能完成情况 ✅

### 后端功能
- ✅ 数据库表结构（quiz_results, quiz_leaderboard_stats）
- ✅ API endpoints (/api/leaderboard, /api/leaderboard/submit)
- ✅ Server actions (submitQuizScore, getLeaderboard, getUserStats)
- ✅ TypeScript 类型定义

### 前端功能
- ✅ 昵称输入对话框
- ✅ 分数提交结果显示
- ✅ 排行榜显示组件
- ✅ MythListClient.tsx 集成

## 测试步骤

### 1. 启动应用
```bash
cd /Users/mac/Desktop/FIT5120/Safhira
npm run dev
```

### 2. 访问myths页面
导航到有MythListClient组件的页面（通常是myths相关页面）

### 3. 测试完整流程

#### 第一次答题
1. 点击 "Start Quiz" 开始答题
2. 回答5个问题
3. 完成后点击 "Submit Score"
4. 输入昵称（例如："TestUser1"）
5. 查看分数提交结果和排名
6. 点击 "View Leaderboard" 查看排行榜

#### 查看排行榜
1. 点击主页面的 "🏆 Leaderboard" 按钮
2. 查看排行榜列表
3. 切换到 "My Stats" 标签页查看个人统计
4. 尝试不同的排序选项

#### 重复答题测试
1. 用相同昵称再次答题
2. 观察统计数据更新（平均分、答题次数）
3. 用不同昵称答题测试多用户排名

## 预期行为

### 昵称输入对话框
- 显示分数总结和成就标识
- 验证昵称长度（2-100字符）
- 提交时显示加载状态

### 分数提交结果
- 显示用户在排行榜中的排名
- 展示个人统计信息
- 根据排名显示不同的鼓励信息

### 排行榜
- 按最高分排序（默认）
- 支持按平均分、答题次数、最后答题时间排序
- 高亮显示当前用户
- 显示前3名的特殊图标（🥇🥈🥉）

### 数据持久化
- 分数记录保存到数据库
- 统计信息自动计算和更新
- 排名实时更新

## 注意事项

1. **数据库连接**：确保DATABASE_URL环境变量正确配置
2. **迁移状态**：数据库迁移已自动应用
3. **类型安全**：所有组件都使用TypeScript类型定义
4. **错误处理**：包含完整的错误处理和用户反馈

## 可能的问题排查

### 1. 分数提交失败
- 检查数据库连接
- 查看浏览器控制台错误
- 验证API endpoints是否正常

### 2. 排行榜不显示
- 确认至少有一个分数记录
- 检查getLeaderboard action是否正常工作

### 3. 样式问题
- 确认所有UI组件导入正确
- 检查Tailwind CSS配置

## 下一步扩展

可以考虑添加：
- 不同quiz类型的独立排行榜
- 历史成绩图表
- 成就系统
- 社交分享功能
