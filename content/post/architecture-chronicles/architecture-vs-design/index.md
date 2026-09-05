---
title: 架构风格 vs. 架构模式 vs. 设计模式（译）
description: 软件架构编年史（4）架构风格 vs. 架构模式 vs. 设计模式
date: 2018-09-19
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

原文：<https://herbertograca.com/2017/07/28/architectural-styles-vs-architectural-patterns-vs-design-patterns/>

*这篇文章是[软件架构编年史](https://herbertograca.com/2017/07/03/the-software-architecture-chronicles/)([译]({{< ref "post/architecture-chronicles/chronicles" >}}))的一部分，这部编年史由[一系列关于软件架构的文章](https://herbertograca.com/category/development/series/software-architecture/)组成。在这一系列文章中，我将写下我对软件架构的学习和思考，以及我是如何运用这些知识的。如果你阅读了这个系列中之前的文章，本篇文章的内容将更有意义。*

在上一篇文章中，我回顾了编程语言的发展史，它告诉我们：编程语言始终都在向着更好的**模块化**和**封装性**演进。

在接下来的文章里，我将记述架构风格和架构模式的*演进史*。所以，今天这篇文章的内容是架构风格和架构模式的定义。

和许多软件开发术语一样，这些词语也很模糊，而且不同的人有着不同的理解。[MSDN 上架构风格和架构模式是一样的](https://msdn.microsoft.com/en-us/library/ee658117.aspx)，但我个人更认同 [George Fairbanks 和 Michael Keeling](http://georgefairbanks.com/blog/architecture-patterns-vs-architectural-styles/)的解释和 [Stack overflow 上的答案](http://stackoverflow.com/questions/3958316/whats-the-difference-between-architectural-patterns-and-architectural-styles) ，以及[维基百科](https://en.wikipedia.org/wiki/List_of_software_architecture_styles_and_patterns)上对两个概念的区分：关键的区别是**范围**。

还有一点需要强调的是架构风格、架构模式和设计模式并不是完全毫不相关的，它们互相补充而且都能指导我们，尽管，和往常一样，它们应该只在必要时使用。

# 架构风格

架构风格非常粗略地告诉我们应该如何组织代码。它的粒度比较大，说明了应用的分层和高层级的模块，这些模块和层次之间如何交互，以及它们的关系。架构风格的例子有：

- 基于组件
- 单体应用
- 分层
- 管道和过滤器
- 事件驱动
- 发布订阅
- 插件
- 客户端服务器
- 面向服务

架构风格可以有多种实现方式，拥有特定的技术环境以及特定的策略、工具和实践。

# 架构模式

解决反复出现的问题的常见方案就是模式。架构模式解决的就是和架构风格相关的问题。例如，“*要实现一个特定层次组合的系统，我们需要哪些类，它们又如何交互*”，或者“*我们的面向服务架构中需要多少高层级的模块，而它们应该如何通信*”，又或者“*我们的客户端服务器架构要分成多少个物理层*”。

架构模式对代码的影响相当大，通常会横向地(比如，如何组织同一个层次中的代码)或者纵向地(比如，请求是如何从外层进入到内层处理之后再返回的)影响整个应用。架构模式的例子有：

- 三层(tier)
- 微内核
- MVC
- MVVM

# 设计模式

设计模式作用的范围和架构模式不同，它们更局限一些，它们影响的是代码中某个特定的部分，对代码的组织影响不多。例如：

- 在运行时只知道需要实例化的类型的情况下，如何实例化一个对象(是不是用工厂类？)；
- 对象如何根据它的状态表现不同的行为(是不是用状态机或者策略模式？)。

# 总结

正如文章开头所言，**这全部关乎于范围**：

- 架构风格是最高抽象级别的应用设计； An Architectural Style is the application design at the highest level of abstraction;
- 架构模式是实现架构风格的一种方式； An Architectural Pattern is a way to implement an Architectural Style;
- 设计模式是解决局部问题的方法。 A Design Pattern is a way to solve a localised problem.

此外，模式既可以用作指定对象的架构模式也可以用作它的设计模式，还是根据我们使用它的范围而定。

# 引用来源

2004 – Microsoft – [Understanding Service-Oriented Architecture](https://msdn.microsoft.com/en-us/library/aa480021.aspx)
2009 – Microsoft – [Microsoft Application Architecture Guide](https://msdn.microsoft.com/en-us/library/ee658117.aspx)
2010 – Stack Overflow – [What’s the difference between Arch. Patterns and Arch. Styles?](http://stackoverflow.com/questions/3958316/whats-the-difference-between-architectural-patterns-and-architectural-styles)
2014 – George Fairbanks – [Architecture Patterns vs. Architectural Styles](http://georgefairbanks.com/blog/architecture-patterns-vs-architectural-styles/)
2017 – Wikipedia – [List of software architecture styles and patterns](https://en.wikipedia.org/wiki/List_of_software_architecture_styles_and_patterns)

[原文](https://herbertograca.com/2017/07/28/architectural-styles-vs-architectural-patterns-vs-design-patterns/)作者为**Herberto Graça**，本译文作者为**覃宇**，分享需遵循[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)许可。
