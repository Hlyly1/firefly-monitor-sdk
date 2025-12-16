# 贡献指南

感谢你考虑为 Firefly Monitor SDK 做出贡献！

## 开发流程

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'feat: add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## Commit 规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### Commit 类型

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档变更
- `style`: 代码格式（不影响代码运行的变动）
- `refactor`: 重构（既不是新增功能，也不是修改 bug 的代码变动）
- `perf`: 性能优化
- `test`: 增加测试
- `build`: 构建系统或外部依赖变动
- `ci`: CI 配置文件和脚本的变动
- `chore`: 其他不修改 src 或测试文件的变动
- `revert`: 回滚之前的 commit

### 示例

```bash
feat: 添加错误监控模块
fix: 修复内存泄漏问题
docs: 更新 API 文档
```

## 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 和 Prettier 配置
- 保持代码简洁和可读性
- 添加必要的注释和文档

## 测试

- 为新功能添加测试用例
- 确保所有测试通过 (`npm test`)
- 保持测试覆盖率在 70% 以上

## Pull Request 指南

1. 确保 PR 描述清晰地说明了问题和解决方案
2. 关联相关的 Issue
3. 更新相关文档
4. 确保 CI 检查通过

## 问题反馈

发现 bug 或有功能建议？请通过 [GitHub Issues](../../issues) 告诉我们。

提交 Issue 时，请包含：

- 问题描述
- 复现步骤
- 预期行为
- 实际行为
- 环境信息（浏览器版本、SDK 版本等）

## 开发设置

```bash
# 安装依赖
npm install

# 启动开发模式
npm run dev

# 运行测试
npm test

# 代码检查
npm run lint

# 格式化代码
npm run format
```

## 获取帮助

如有任何问题，欢迎通过以下方式联系：

- 提交 Issue
- 发起 Discussion

再次感谢你的贡献！🎉
