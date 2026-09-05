---
title: 整洁架构（译）
description: 软件架构编年史（13）整洁架构
date: 2018-09-17
tags:
  - 架构
  - 编年史
  - 翻译
author: 覃宇
series:
  - 软件架构编年史
draft: false
---

<!--more-->

原文：<https://herbertograca.com/2017/09/28/clean-architecture-standing-on-the-shoulders-of-giants/>

*这篇文章是[软件架构编年史](https://herbertograca.com/2017/07/03/the-software-architecture-chronicles/)([译]({{< ref "post/architecture-chronicles/chronicles" >}}))的一部分，这部编年史由[一系列关于软件架构的文章](https://herbertograca.com/category/development/series/software-architecture/)组成。在这一系列文章中，我将写下我对软件架构的学习和思考，以及我是如何运用这些知识的。如果你阅读了这个系列中之前的文章，本篇文章的内容将更有意义。*

Robert C. Martin(大名鼎鼎的 Uncle Bob)于2012年在[他的一篇博客](https://blog.8thlight.com/uncle-bob/2012/08/13/the-clean-architecture.html)中发表了*整洁架构*的观点，并在一些会议上做了关于该架构的演讲。

整洁架构借助了许多或熟悉或陌生的概念、规则和模式，说明了如何将它们融会贯通产生出一种构建应用的标准套路。

# 站在 EBI 架构、六边形架构和洋葱架构的肩膀上

整洁架构的核心目标与端口和适配器(六边形)架构以及洋葱架构是一致的：

- 工具无关
- 传达机制无关
- 独立的可测试性

下面这张图发表在整洁架构的博客中，揭示了该架构的总体思路：

{{< figure src="cleanarchitecture.jpg" class="medium" >}}

Robert C. Martin 2012, The Clean Architecture

正如 Uncle Bob 自己在博客中所说，上面这张图试图将最新的架构观点整合成*一个可操作的思路*。

我们来对比一下整洁架构和六边形架构以及洋葱架构的示意图，看看它们在哪些方面是一致的：

{{< figure src="hexagonal_original.gif" class="medium" >}}
{{< figure src="4ioq9.png" class="small" >}}

## 外化工具和传达机制

六边形架构聚焦于使用接口和适配器将工具和传达机制从应用中外化出去。这也是洋葱架构的核心基石之一，就像图中呈现的那样，UI、基础设施和测试全部都在示意图的最外层。整洁架构也有完全一致的特征，UI、Web、DB 等等都在最外层。最终，所有的应用核心代码都是独立于框架/库的。

## 依赖方向

六边形架构中并没有明确地告知我们依赖的方向。然而，我们可以轻易地推测出来：应用拥有接口，它们必须由适配器实现或使用。所以适配器依赖接口，依赖位于圆心的应用。外部依赖内部，依赖的方向就指向圆心。在洋葱架构的示意图中，也没有发现关于依赖方向的表示，但是，Jeffrey Palermo 在他的第二篇博客中清楚地表明了*所有依赖都指向圆心*。整洁架构则非常明确地指出依赖的方向是指向圆心的。它们都在架构层级引入了依赖倒置原则。*内圈不能知道外圈的任何信息。*还有，*当数据跨越界限进行传递时，数据总是以最方便内圈使用的格式提供。*

## 分层

六边形架构示意图只展现了两个层次：应用内部和应用外部。而洋葱架构引入了 DDD 中定义的应用层次的混合：控制用例逻辑的应用服务；封装了领域逻辑的领域服务，这些逻辑既不属于实体也不属于值对象；还有实体、值对象等等...和洋葱架构相比，整洁架构保留了应用服务层(用例)和实体层，但好像漏掉了领域服务层。然而，读过 Uncle Bob 的博客后，我们会发现，他认为任何领域对象都是实体，而非只有 DDD 中的“实体”才是实体：“*一个实体可以是一个拥有方法的对象，或者是一组数据结构和函数*”。实际上，他为了简化示意图而将最中间的两层合并了。

## 独立的可测试性

三种架构风格共同遵守的规则，让它们将应用和业务逻辑隔离了出来。这意味着任何情况下我们都可以简单地 mock 外部工具和传达机制，独立地对应用的代码进行测试，而不需要使用数据库或 HTTP 请求。

正如我们所见，整洁架构包含了六边形架构和洋葱架构的规则。截至目前，整洁架构好像没有加入什么新鲜的概念。但是，在整洁架构示意图的右下角，还有一张小图...

# 站在 MVC 和 EBI 的肩膀上

整洁架构示意图的右下角的这张小图说明了控制流是如何工作的。这张小图并没有提供太多信息，但博客中的说明和 Robert C. Martin 的会议演讲拓展了该话题。

{{< figure src="cleanarchitecturedesign.png" class="medium" >}}

我们在上图的左侧看到的是 MVC 中的视图和控制器。双实线另一层的所有形状都是 MVC 中的模型。这些模型也代表着 EBI 架构(我们可以清楚地看到边界、交互器和实体)，六边形架构中的“应用”、洋葱架构中的“应用核心”，以及前面整洁架构示意图中的“实体”层和“用例”层。

假设有一个 HTTP 请求按照控制流到达了控制器。控制器接下来会：

1. 拆解请求；
2. 使用相关数据创建一个请求模型；
3. 执行交互器(作为交互器接口的，即边界的，实例被注入到控制器中)中的方法并将请求模型传递给它；
4. 交互器会：
   4.1. 使用实体网关实现(作为实体网关接口的实例被注入到交互器中)查找相关实体；
   4.2. 编排实体之间的交互；
   4.3 用操作的数据结果创建响应模型；
   4.4 将响应模型交给展示器进行填充；
   4.5 将展示器返回给控制器；
5. 使用展示器生成视图模型；
6. 将视图模型绑定到视图；
7. 将视图返回给客户端。

这里只有“展示器”的用法我有些疑问，我在项目中的实际做法和这里不太一样。我会某种 DTO 类型的数据返回给交互器，而不是注入一个填充了数据的展示器对象。

我通常会采用实际上是一种 MVP 实现，控制器在其中负责从客户端接收数据并响应它。

# 总结

我不认为整洁架构是革命性的，因为它实际上并没有带来突破性的概念或模式。

但是，我认为它是相当重要的成果：

- 它发掘了某种程度上被遗忘了的概念、规则和模式；
- 它澄清了一些实用且重要的概念、规则和模式；
- 它告诉我们如何把所有的概念、规则和模式整合起来，形成一种构建复杂应用并保持可维护性的标准套路

Uncle Bob 关于整洁架构的工作总会让我想起牛顿。引力始终是存在的，每个人都知道松手让苹果远离地面的高处落下，它会落向地面。牛顿做的事情“只不过”是写了一篇论文披露这个事实。这件事很“简单”，但却让人们开始思考它并基于它创造更新的想法。

换句话说，我认为 Robert C. Martin 就是软件开发领域的牛顿！

# 引用来源

2012 – Robert C. Martin – [Clean Architecture (NDC 2012)](https://youtu.be/Nltqi7ODZTM)
2012 – Robert C. Martin – [The Clean Architecture](https://blog.8thlight.com/uncle-bob/2012/08/13/the-clean-architecture.html)
2012 – Benjamin Eberlei – [OOP Business Applications: Entity, Boundary, Interactor](https://beberlei.de/2012/08/13/oop_business_applications_entity_boundary_interactor.html)
2017 – Lieven Doclo – [A couple of thoughts on Clean Architecture](https://www.insaneprogramming.be/article/2017/02/14/thoughts-on-clean-architecture/)
2017 – Grzegorz Ziemoński – [Clean Architecture Is Screaming](https://dzone.com/articles/clean-architecture-is-screaming)

* **我知道牛顿爵士的成就远不止这些，但我只想强调我认为 Robert C. Martin 的观点到底有多重要。**

[原文](https://herbertograca.com/2017/09/28/clean-architecture-standing-on-the-shoulders-of-giants/)作者为**Herberto Graça**，本译文作者为**覃宇**，分享需遵循[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)许可。
