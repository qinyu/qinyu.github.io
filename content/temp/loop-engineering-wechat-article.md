---
title: "SDD 实战手记 [09/10] | Loop Engineering：为什么你的 Agent 跑不起循环？"
description: "微信公众号文章存档"
date: 2026-06-23
author: 覃宇
tags:
  - AI
  - Agent
  - Loop-Engineering
  - 存档
draft: true
original_url: "https://mp.weixin.qq.com/s/k9Oz8jYe8mTpzzNtNSCxzQ"
source: "dolphin07"
---

> 原文链接: https://mp.weixin.qq.com/s/k9Oz8jYe8mTpzzNtNSCxzQ
> 来源: dolphin07
> 存档日期: 2026-06-25

---

# SDD 实战手记 [09/10] | Loop Engineering：为什么你的 Agent 跑不起循环？

2026 年 6 月，Peter Steinberger（OpenClaw 作者）写了一句话：「You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents.」几乎同时，Anthropic Claude Code 负责人 Boris Cherny 在公开场合说：「I don't prompt Claude anymore. I have loops running.」

Loop Engineering 一夜之间成了 AI Coding 圈最热的概念。

但一夜爆红也带来混乱。很多讨论把 Prompt、Context、Harness、Loop 混在一起说——它们不是一回事。

```
┌──────────────────────────┐  
│ Loop：反馈 / Eval / 兜底 │  
│  ┌────────────────────┐  │  
│  │ Harness：权限 / 沙箱 │  │  
│  │  ┌──────────────┐  │  │  
│  │  │ Context：知识 │  │  │  
│  │  │  ┌────────┐  │  │  │  
│  │  │  │ Prompt │  │  │  │  
│  │  │  └────────┘  │  │  │  
│  │  └──────────────┘  │  │  
│  └────────────────────┘  │  
└──────────────────────────┘
```

**Prompt** 是你这次怎么说；**Context** 是 Agent 开始前知道什么；**Harness** 是它能在什么边界里运行；**Loop** 是它失败后如何看见反馈、修复、再验证，以及什么时候停下来。

但我在团队里推的时候发现一个问题：**很多人以为 Loop Engineering = 让 Agent 多跑几轮。** 设一个 `/loop`，Agent 跑完改代码 → 跑测试 → 失败 → 再改 → 再跑……结果 5 轮之后代码比第 1 轮还烂。

Loop 不是魔法。**Loop 的质量取决于反馈信号的质量。** 没有好的评测器，Loop 只是在放大错误。

上一篇讲了 Superpowers 管线之外的三个基础能力（Context / Runtime Feedback / Eval）——它们是 Loop 的供给侧。这一篇讲 Loop 本身：怎么建、分几段、你的团队大概率卡在哪里。

---

## 一、一个模型：评测器决定天花板

先说结论：**决定你能拿多少分的，不是 Agent 写得有多好，是评测器能告诉 Agent 哪里错了。**

![mermaid diagram](https://mmbiz.qpic.cn/mmbiz_png/YHbh2NH4HBMO4Y3s3ra09HK2SV58uKTdFjF6MhDn8GxtcCTgVsRMsl9W8WgAL0ZwQe7zXQLEibk6nS9ekR57jexOfwAKAo8jb4uwaQ19U3RY/640?from=appmsg)

| 段位 | 链路 | 评测器 | 上限 | Loop？ |
| --- | --- | --- | --- | --- |
| 第一段 | Intent → Spec → Code | 静态约束（类型 / Lint / Spec 自检） | **80 分** | 无 Loop，单次生成 |
| 第二段 | Code ↔ Test Loop | 沙箱可重放（单测 / 集成 / E2E mock） | **90 分** | **有 Loop，但在沙箱里** |
| 第三段 | 真实环境 Loop + Human | 契约 / SLO / 业务指标 / A/B | **交付** | **Loop + 人工兜底** |

**本系列前 8 篇聚焦的都是第一段的优化**——怎么写好 Spec、怎么选工具、怎么补 Context / Runtime Feedback / Eval。但即使第一段做到极致，也只有 80 分。因为第一段没有 Loop：Agent 生成一次，你收货一次。没有"哪里错了"的反馈信号，就没有迭代收敛的可能。

**Loop Engineering 的核心不是"让 Agent 多跑几轮"，是"设计越来越强的评测器，让每一轮跑得越来越有意义"。**

---

## 二、第一段：为什么 80 分封顶

Spec 是单向投影——告诉 Agent"该写什么"，不告诉 Agent"写出来后哪里不对"。没有运行时反馈，边界 case、并发、性能全靠想象力枚举。

这不是 Spec 的缺陷，是 Spec 的本质：**Spec 定义了目标函数，但没有提供梯度。** Agent 只能做一次最优猜测，然后停下来等人看。

上一篇讲的 Context、Runtime Feedback、Eval 三个基础能力，都在拉高首轮准确率——从 40% 拉到 70%+。但上限仍然是 80 分，因为这一段的评测器只有静态约束——类型检查、Lint、Spec 格式校验。**静态约束能发现格式错误，发现不了逻辑错误。**

要突破 80 分，必须引入动态评测器——让代码跑起来，用运行结果告诉 Agent 哪里错了。这就是第二段。

---

## 三、第二段：沙箱反馈循环——从 80 到 90

从 80 到 90 的关键一步：**让代码跑起来，用测试结果告诉 Agent 哪里错了。** 第一段是 Agent 自评（考生批改试卷），第二段引入外部评测器（出题者和答题者分离）。

![mermaid diagram](https://mmbiz.qpic.cn/mmbiz_png/YHbh2NH4HBMlK5GYksOseficpsK3gN05j7lYA3wqLZRROsWgdbFKqY4uou3icke6MbxKzia6ENyibax91xCyshyp4fqcQVq16JGoiaM6kCiborNxY/640?from=appmsg)

这就是 Loop Engineering 的最基本形态：**Act → Observe → Repair → Repeat。** 经典的 Evaluator-Optimizer 模式。

关键数据：单次通过率 50% × 5 次 retry ≈ 97% 沙箱成功率。**不是靠 AI 一次写对，是靠 Loop 收敛。**

### 三个设计要点

**1. Repair Agent ≠ 编码 Agent。** 编码 Agent 倾向于"重新生成整段代码"，Repair Agent 应该"找到出错的那一行，最小改动"。混用必出过度重写——只需改一行条件判断，它却把整个函数重写了。

**2. 失败信号必须结构化。** 不是一堆 stack trace，是"哪个 AC 失败了、期望什么、实际什么"。上一篇的 `ac-coverage` 做的就是这件事。结构化信号让 Repair Agent 能精准定位，非结构化信号让它猜——猜就会过度修复。

**3. 终止条件必须明确。** 全绿 → 通过。N 次未过 → escalation 给人。没有终止条件的 Loop 是灾难——我们观察到 Agent 在某些场景下陷入"修一个破一个"的振荡，自修复变自毁。

### 沙箱的天花板

但沙箱有天花板——mock 的 Redis 不会超时，mock 的上游服务永远返回正确格式，mock 的流量不会突然暴增。

crane-game 的线上教训：单测全绿、AC 全覆盖，但真实环境下 Redis 分布式锁在高并发时偶尔超时，导致同一用户重复扣费。单测里 mock 的 Redis 永远不会超时——**沙箱 ≠ 真实环境。**

**沙箱 Loop 的上限是 90 分。** 最后 10 分，需要真实环境的评测器。

---

## 四、第三段：真实环境 Loop + 人工兜底——从 90 到交付

从 90 到交付：让代码在真实环境跑，用真实信号做评测器。

这一段的 Loop 和第二段结构相同，但评测器完全不同：

|  | 第二段评测器 | 第三段评测器 |
| --- | --- | --- |
| **信号来源** | 沙箱（单测 / 集成 / E2E mock） | 真实环境（契约测试 / SLO / 业务指标） |
| **反馈延迟** | 秒级 | 分钟到小时级 |
| **信号确定性** | pass/fail 无歧义 | 部分信号需要人类判断 |
| **Agent 能独立处理的比例** | ~100% | **~80%** |

第三段的核心特征：**不是所有信号都能自动处理。**

* • **~80% 可机读信号**：契约测试失败、SLO 异常有明确根因 → Agent 自动 Repair
* • **~20% 需判断信号**：业务指标偏离是 bug 还是真实变化？灰度要不要回滚？合规审核通不通过？

**这 20% 不是技术局限，是本质边界。** "出了事谁负责"只有人能回答。Human-on-the-loop 不是过渡方案，是终态。

---

## 五、你的团队大概率卡在这里

做过一个团队资源分布诊断：

| 资源去向 | 团队实际投入 | 应该投入 |
| --- | --- | --- |
| 第一段（Spec / 编码工具 / SDD 流程） | 70-90% | **30%** |
| 第二段（测试套件 / 沙箱 / Repair Loop） | < 5% | **40%** |
| 第三段（真实环境评测 / 人工机制） | < 5% | **30%** |

**大部分团队把资源砸在第一段**——选工具、写 Spec、优化 Prompt——但第一段没有 Loop，天花板是 80 分。真正的 ROI 在第二段：工具最现成（沙箱 + 测试框架），效果最确定（pass/fail 无歧义），投入产出比最高。

回看前面 crane-game 的例子——Spec 已经足够细致，但 Redis 超时问题暴露的不是 Spec 不好，是验证手段没跟上。**把 20% 的 Spec 打磨时间投入到集成测试和真实环境验证，这个问题能提前一周发现。**

---

## 六、30 天跑通第二段

不需要一步到位。三步建起最小可行的 Code → Test Loop：

**Step 1：让 AI 生成的代码能自动跑测试。** 听起来简单，但很多团队的流程是：AI 生成 → 人看一眼 → 手动跑一下 → merge。把"手动跑"变成"自动跑"，就是第二段的起点。

**Step 2：让测试失败信号结构化。** 不是 stack trace 墙，是"哪个 AC 失败、期望什么、实际什么"。结构化失败信号让 Repair Agent 精准定位，非结构化让它猜。

**Step 3：让 AI 能自己修。** 测试失败 → Repair Agent 读失败输出 → 生成最小 patch → 重跑。上限 3 次，超限 escalation 给人。

![mermaid diagram](https://mmbiz.qpic.cn/sz_mmbiz_png/YHbh2NH4HBO7ibja52gARjYTA6vosnGs5d9EF9G58jK7gibm6U0Ys5YWuwL8Wy2sIwYkSSoYGPIzLHQC9HJFerTpaJrE8e2a2E0h8rw7iaYRkA/640?from=appmsg)

**90 天**扩展到 Trace + Eval Loop——收集每次 Repair 的 trace，建评测集，每周复盘 Top N 失败模式，沉淀到知识库。这就是上一篇讲的 Eval → Context 飞轮。

**180 天**引入第三段基建——集成测试环境、契约测试、SLO 监控、灰度验证。

---

## 七、四层 Loop Stack

前面的三段模型是纵轴——你的团队在向上爬哪个台阶。但 Loop 还有横轴：到了某一段之后，系统内部有多层 Loop 同时嵌套运行。成熟的 Loop Engineering 是四层：

![mermaid diagram](https://mmbiz.qpic.cn/mmbiz_png/YHbh2NH4HBMH0OlZicYAYeXSQWVJRgT7UbzaticVNS64QB4fld62LRtBdvlTXbmibTlwu8AcJNVtJ6OsNbjXibdw8iccB04SS2E9Pa2N0icexibkcI/640?from=appmsg)

| 层 | 做什么 | 你现在大概在哪 |
| --- | --- | --- |
| **L1 Agent Loop** | Agent 调工具完成任务 | 用 Superpowers / Claude Code 就已经有了 |
| **L2 Verification Loop** | 产出经评测器打分，不达标自动重试 | **大多数团队卡在这里**——缺评测器 |
| **L3 Event-Driven Loop** | 不靠人触发，Webhook / Cron / PR 事件自动启动 Agent | 少数团队开始尝试（CI 触发、PR 自动 review） |
| **L4 Hill Climbing Loop** | 生产 Trace 自动分析 → 优化 Harness 配置 | 几乎没有团队做到 |

**从 L1 到 L4 的跃迁瓶颈，都不是 Agent 能力，是评测器能力。** L2 需要沙箱评测器，L3 需要事件触发 + 自动化评测，L4 需要能分析 Trace 的 meta 评测器。

Agent 越来越聪明是确定性趋势。你能做的差异化投入，是建更好的评测器和反馈信号——这些不会被模型进步自动解决，因为它们是你业务的特异性知识。

---

## 八、三个反模式

**1. ❌ 不带评测器跑 Loop。** "让 Agent 改到自己满意为止"——Agent 对自己永远满意。没有外部评测器的 Loop 不会收敛，只会在错误方向上越走越远。

**2. ❌ 不收 Trace 就调 Prompt。** "AI 这次写错了，换个 Prompt 试试"——手感工程。不记录失败模式、不建评测集、不做系统分析，规模化必崩。Loop Engineering 的 L4 就是把这件事自动化。

**3. ❌ 试图让 AI 100% 自动化第三段。** 业务判断、合规审核、灰度决策——本质是"出了事谁负责"。这不是技术问题，是责任问题。**2026 年 AI 的能力边界是处理结构化信号，做不了承担责任的决策。**

---

## 【实操】三段位自评

你的团队在哪一段？

* • **第一段标志**：AI 生成代码后，主要靠人工 Review 判断对不对。没有自动测试，或者有但不在 AI 流程中自动触发
* • **第二段标志**：有自动化测试 + 沙箱，AI 改完即跑即验。测试失败能自动触发修复循环
* • **第三段标志**：有真实环境评测器（契约测试 / SLO 监控），有 AI 和人工的明确分工机制

**大多数团队在第一段。** 下一步几乎总是：先把第二段跑通——选一个项目，让 AI 生成的代码能自动跑测试、失败能自动修复。这一步的 ROI，远高于继续优化 Spec 或换更贵的模型。

连上一篇的诊断：如果你连 Runtime Feedback 都没有（Agent 一条命令跑不起本地环境），那第二段的 Loop 根本建不起来——**先还旧债，再建 Loop。**

*你的团队在哪一段？第二段的 Loop 建起来了吗？留言聊聊。*

---

*下一篇：**10-endgame** — 编码被廉价化之后，人的价值退到了哪里？*
