# Leaderboard 功能文档

## 概述

Leaderboard功能允许用户在完成quiz后提交分数，并查看排行榜。系统会记录每个用户的nickname、分数和答题次数，并提供排名功能。

## 数据库结构

### 1. quiz_results 表
记录每次答题的详细结果：
- `id`: 主键
- `nickname`: 用户昵称（最大100字符）
- `score`: 分数（0-100）
- `total_questions`: 总题数（默认5）
- `correct_answers`: 正确答案数
- `quiz_type`: quiz类型（默认'myths'）
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 2. quiz_leaderboard_stats 表
存储每个用户的聚合统计信息：
- `nickname`: 用户昵称（主键）
- `best_score`: 最高分数
- `average_score`: 平均分数
- `total_attempts`: 总答题次数
- `quiz_type`: quiz类型
- `last_played_at`: 最后答题时间
- `created_at`: 创建时间
- `updated_at`: 更新时间

## 部署步骤

### 1. 运行数据库迁移

```bash
# 确保你在项目根目录
cd /Users/mac/Desktop/FIT5120/Safhira

# 运行迁移（如果还没有运行）
npx drizzle-kit push
```

### 2. 环境变量
确保你的 `.env` 文件包含正确的数据库连接：
```
DATABASE_URL=your_postgresql_connection_string
```

## API 端点

### 1. 提交分数
```
POST /api/leaderboard/submit
```

**请求体：**
```json
{
  "nickname": "用户昵称",
  "score": 80,
  "totalQuestions": 5,
  "correctAnswers": 4,
  "quizType": "myths"
}
```

**响应：**
```json
{
  "success": true,
  "resultId": 123,
  "stats": {
    "nickname": "用户昵称",
    "bestScore": 80,
    "averageScore": "75.50",
    "totalAttempts": 3,
    "rank": 15
  },
  "rank": 15,
  "message": "Score submitted successfully!"
}
```

### 2. 获取排行榜
```
GET /api/leaderboard?quizType=myths&limit=50&offset=0&sortBy=bestScore&sortOrder=desc&nickname=用户昵称
```

**查询参数：**
- `quizType`: quiz类型（默认'myths'）
- `limit`: 返回条数（默认50）
- `offset`: 偏移量（默认0）
- `sortBy`: 排序字段（'bestScore', 'averageScore', 'totalAttempts', 'lastPlayedAt'）
- `sortOrder`: 排序方向（'asc', 'desc'）
- `nickname`: 用户昵称（可选，用于获取该用户的排名）

**响应：**
```json
{
  "entries": [
    {
      "nickname": "玩家1",
      "bestScore": 100,
      "averageScore": 95.5,
      "totalAttempts": 10,
      "lastPlayedAt": "2024-01-01T00:00:00Z",
      "rank": 1
    }
  ],
  "totalEntries": 100,
  "userRank": 15,
  "userStats": {
    "nickname": "用户昵称",
    "bestScore": 80,
    "averageScore": "75.50",
    "totalAttempts": 3
  }
}
```

## Server Actions

### 1. 提交分数
```typescript
import { submitQuizScore } from '@/app/actions/leaderboard-actions';

const result = await submitQuizScore({
  nickname: "用户昵称",
  score: 80,
  totalQuestions: 5,
  correctAnswers: 4,
  quizType: "myths"
});

if (result.success) {
  console.log('分数提交成功！', result.stats);
} else {
  console.error('提交失败：', result.error);
}
```

### 2. 获取排行榜
```typescript
import { getLeaderboard } from '@/app/actions/leaderboard-actions';

const leaderboard = await getLeaderboard({
  quizType: 'myths',
  limit: 50,
  sortBy: 'bestScore',
  sortOrder: 'desc'
}, 'user_nickname');
```

### 3. 获取用户统计
```typescript
import { getUserStats } from '@/app/actions/leaderboard-actions';

const userStats = await getUserStats('用户昵称', 'myths');
if (userStats) {
  console.log('用户排名：', userStats.rank);
  console.log('最高分：', userStats.bestScore);
}
```

### 4. 获取最近结果
```typescript
import { getRecentResults } from '@/app/actions/leaderboard-actions';

const recentResults = await getRecentResults('用户昵称', 'myths', 10);
```

## 类型定义

所有的TypeScript类型定义都在 `/types/leaderboard.ts` 文件中：

- `QuizResult`: 单次答题结果
- `QuizLeaderboardStats`: 用户统计信息
- `LeaderboardEntry`: 排行榜条目
- `SubmitScoreRequest`: 提交分数请求
- `LeaderboardResponse`: 排行榜响应
- `LeaderboardFilters`: 排行榜过滤器

## 下一步：前端集成

现在后端已经完成，你需要：

1. 在 `MythListClient.tsx` 中添加昵称输入功能
2. 在quiz完成后调用 `submitQuizScore` action
3. 创建排行榜组件来显示排名
4. 添加查看个人统计的功能

建议在quiz完成的对话框中添加一个输入框让用户输入昵称，然后提交分数并显示排名结果。默认会自动生成一个酷炫的随机昵称（例如 "Neon Otter 27"），用户可直接使用或自行修改。
