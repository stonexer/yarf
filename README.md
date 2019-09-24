# Yet Another React Fiber

简化版的 React 和 Fiber。基本相当于照着 React 仓库抄了一遍。没有拆分 React 和 ReactDOM。且省略了以下功能：

- 时间相关的调度
- Ref
- Context
- Fragment
- Portal
- 友好的开发时检查和提示
- Hot reloading
- ...

并且，render 阶段的逻辑，只保留了 **同步** 的。理解了同步的，才有可能搞懂异步。

# What & Why

尽可能还原 React 目前（2019.9）的核心功能，并保持同步。

学习

## Referrence

- https://github.com/facebook/react
- https://github.com/preactjs/preact
- https://github.com/pomber/didact
- https://github.com/132yse/fre
- https://github.com/Foveluy/Luy
- https://github.com/tranbathanhtung/react-fiber-implement
