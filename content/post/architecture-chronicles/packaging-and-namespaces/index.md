---
title: 包和命名空间（译）
description: 软件架构编年史（9）包和命名空间
date: 2018-09-26
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

原文：<https://herbertograca.com/2017/08/31/packaging-code/>

*这篇文章是[软件架构编年史](https://herbertograca.com/2017/07/03/the-software-architecture-chronicles/)([译]({{< ref "post/architecture-chronicles/chronicles" >}}))的一部分，这部编年史由[一系列关于软件架构的文章](https://herbertograca.com/category/development/series/software-architecture/)组成。在这一系列文章中，我将写下我对软件架构的学习和思考，以及我是如何运用这些知识的。如果你阅读了这个系列中之前的文章，本篇文章的内容将更有意义。*

一个系统的架构是它的高层级的视图，是系统的大局观，是粗线条的系统设计。架构的决策就是系统结构上的决策，这些决策影响着全部代码，决定了系统中其它部分的基础。

除了其它用处以外，架构决定了系统的：

- 组件
- 组件之间的关系
- 指导对组件以及及其之间关系进行设计和演进的原则

换句话说，这些设计决策在系统演进的过程中更难改变，它们是支撑特性开发的基础。

# 意大利面架构

我参与的有些项目结构完全是随意的，又不能体现架构也不能反映领域。如果我的问题是“*这个值对象应该放在哪里？*”，答案就是“*随便放在 src 目录里就好了*”。如果我的问题是“*完成这个逻辑的服务在哪里*”，答案是“*用 IDE 搜索吧*”。这意味着完全没有思考该如何组织代码。

这里的隐患很大，因为完全没有使用包来实现模块化，高级别的代码关系和流向完全不遵守任何逻辑结构，将导致高耦合低内聚的模块，实际上可能根本就没有模块划分，本来应该属于某个模块的代码散落在整个代码库中。这样的代码库就是所谓的**意大利面代码**，或者是**意大利面架构**！

# 可维护的代码库

拥有可维护的代码库意味着我们能以最小的代码修改获得最大的概念变化。换句话说，如果我们需要修改一个代码单元，其它代码单元的修改应该尽可能地少。

这带来了明显的优势：

- 因为影响的代码少，修改会更容易；
- 因为影响的代码少，修改会更快；
- 因为修改的代码少，出现问题的几率会降低；

**封装** 、**低耦合**和**高内聚**是保持代码隔离的核心原则，使可维护的代码库成为可能。

## 封装

封装是隐藏一个类的内部表示和实现的过程。

也就是说，实现被隐藏了，这样类的内部结构可以随意的改变，而不会影响使用这个类的其它类的实现。

## 低耦合

耦合涉及代码单元之间的关系。如果一个模块的修改会导致另一个模块的修改，我们就说这两个模块高度耦合。如果一个模块可以独立于其它任何模块，我们就说它是松耦合的。通过提供稳定的接口来有效地对其它模块隐藏实现，可以达成松耦合的目标。

### 低耦合的优点

- 可维护性 - 修改被限制在一个模块中
- 可测试性 - 单元测试涉及的模块尽可能地少
- 可读性 - 需要仔细分析的类尽可能地少

## 高内聚

内聚指的是对模块内的功能相关性有多强的度量。低内聚指的是模块拥有一些不同的不相关的职责。高内聚指的是模块所拥有的功能在许多方面很相似。

### 高内聚的优点

- 可读性 - (紧密) 相关的功能包含在一个模块中
- 可维护性 - 只用在一个模块内调试代码
- 可重用 - 类的功能十分聚焦，不会充斥许多无用的函数

# 对结构的影响

上述这些原则适用于类，然而，它们一样适用于类的组合。类的组合通常被叫做包，但我们可以分得更细一些，如果分组是出于纯粹功能方面的考虑（如ORM）我们会称之为模块，如果是出于领域方面的考虑（如AccountManagement）则称之为组件。这些定义与 Bass、Clements 和 Kazman 在他们的著作 [Software Architecture in Practice](https://www.amazon.com/Software-Architecture-Practice-SEI-Engineering-ebook/dp/B009GMUL84) 里的描述一致。

我们能够并且应该让包做到高内聚和低耦合，因为这样我们才能做到：

- 修改一个包而不会影响其它的包，减少出现的问题；
- 修改一个包而不需要修改其它的包，加快交付的节奏；
- 让团队专注于特定的包，带来更快、更健壮和设计更优的变化；
- 团队开发活动之间的依赖和冲突更少，提升产能。
- 更仔细地斟酌组件之间的关系，让我们更好地将应用作为一个整体建模 ，交付质量更高的系统。

# 概念封装

我觉得如果我们的项目结构能以某种方式既体现出架构也体现出领域的话，我们的代码库的可维护性可以得到极大地提升。实际上现在我敢笃定这也是唯一可行的方式（当我们面对大中型企业应用时）。

代码库如果组织得当，特定代码单元只有一处位置可供它存放。我们可能并不知道到具体的位置，但一定只有一条逻辑路径可以让我们顺藤摸瓜找到它。

> **包的定义**
> 将类划分成包可以让我们在更高的抽象级别来思考设计。其目标是将你的应用中的类按照某种条件进行分片，然后将这些分片分配到包中。这些包之间的关系表达出了应用高级别的组织方式。—— Robert C. Martin 1996, [Granularity](https://drive.google.com/file/d/0BwhCYaYDn8EgOGM2ZGFhNmYtNmE4ZS00OGY5LWFkZTYtMjE0ZGNjODQ0MjEx/view) pp. 3

将概念上相关的代码定义成包，我们需要达成的目标。这些包十分重要，因为它们定义了概念上相关且独立于其它包的代码单元，还有这些包之间的关系。

这样做的目的是：

- 理解代码单元之间的关系
- 维护代码单元之间的逻辑关系
- 实现高内聚低耦合的代码包
- 在不影响/极少影响应用的情况下重构代码包
- 在不影响/极少影响应用的情况下替换代码包的实现

# 分包的原则

我们要遵循 Robert C. Martin 在 1996 年和 1997 年提出的包划分原则以及其他的一些原则来达成目标，主要有 **CCP** (Common Closure Principle，共同封闭原则), the **CRP** (Common Reuse Principle，共同重用原则) 和 **SDP** (Stable Dependencies Principle，稳定依赖原则)。

**Robert C. Martin 提出的包划分原则：**

- **包内聚原则**

  - **REP** – [重用发布等价原则](http://docs.google.com/a/cleancoder.com/viewer?a=v&pid=explorer&chrome=true&srcid=0BwhCYaYDn8EgOGM2ZGFhNmYtNmE4ZS00OGY5LWFkZTYtMjE0ZGNjODQ0MjEx&hl=en)
    *重用的粒度等价于发布的粒度*
  - **CCP** – [共同封闭原则](http://docs.google.com/a/cleancoder.com/viewer?a=v&pid=explorer&chrome=true&srcid=0BwhCYaYDn8EgOGM2ZGFhNmYtNmE4ZS00OGY5LWFkZTYtMjE0ZGNjODQ0MjEx&hl=en)
    *一起被修改的类应该放在一个包里*
  - **CRP** – [共同重用原则](http://docs.google.com/a/cleancoder.com/viewer?a=v&pid=explorer&chrome=true&srcid=0BwhCYaYDn8EgOGM2ZGFhNmYtNmE4ZS00OGY5LWFkZTYtMjE0ZGNjODQ0MjEx&hl=en)
    *一起被重用的类应该放在一个包里*
- **包耦合原则**

  - **ADP** – [无环依赖原则](http://docs.google.com/a/cleancoder.com/viewer?a=v&pid=explorer&chrome=true&srcid=0BwhCYaYDn8EgOGM2ZGFhNmYtNmE4ZS00OGY5LWFkZTYtMjE0ZGNjODQ0MjEx&hl=en)
    *包的依赖图中不能出现循环*
  - **SDP** – [稳定依赖原则](http://docs.google.com/a/cleancoder.com/viewer?a=v&pid=explorer&chrome=true&srcid=0BwhCYaYDn8EgZjI3OTU4ZTAtYmM4Mi00MWMyLTgxN2YtMzk5YTY1NTViNTBh&hl=en)
    *依赖应该朝着稳定的方向前进*
  - **SAP** – [稳定抽象原则](http://docs.google.com/a/cleancoder.com/viewer?a=v&pid=explorer&chrome=true&srcid=0BwhCYaYDn8EgZjI3OTU4ZTAtYmM4Mi00MWMyLTgxN2YtMzk5YTY1NTViNTBh&hl=en)
    *抽象的级别越高，稳定性就越高*

**要想合理地运用 SDP**，我们应该定义出代码的概念单元（组件）和组件的分层，这样我们才能搞清楚那些组件应该了解（依赖）其它组件。

然而，如果这些组件的边界不够清晰，我们就会把本该互不相干的代码代码单元混在一起，让它们耦合在一起变成意大利面式代码，最后将无法维护。

要让这些边界能清楚地呈现出来，我们需要把概念上相关的类放在同一个包中，就像我们把概念上相关的方法放在同一个类中一样。在包这个级别，我们只能用一些名字在领域中有一定含义(例如，UserManagement、Orders、Payments 等)的文件夹来区分它们。在最底层的级别，即包内的叶子节点，我们才会在必要时按照功能作用区分类(例如，Entity、Factory、Repository 等)。

> 下面这个问题可以帮助我们反思如何设计出低耦合的组件：
>
> “*如果我想去掉一个业务概念，是不是删除掉它的组件根目录就能把这个业务概念的所有代码删除而且应用的剩余部分还不会被破坏？*”
>
> 如果答案是肯定的，那么我们就有了一个解耦得不错的组件。

例如，在命令总线架构中，命令和处理器离开对方就无法工作，它们在概念上和功能上都绑定在一起，因此，如果我们需要去掉该逻辑就要将它们一起去掉。如果它们在同一个位置，我们只用删除一个文件夹就好(我们并非真的要删除代码，只是借助这种思维方式来帮我们得到解耦和内聚的代码)。所以，遵循 CCP 和 CRP 原则，命令应该和它的处理器放在同一个文件夹中。

任何代码只能存在于一个逻辑上的位置，即使对项目中的新手和初级开发者来说，这个位置也是十分明了的。这能避免自相矛盾、令人费解、重复的代码和开发者的挫败感。如果因为无法在代码本该在的位置找到它，和/或难以理解哪些代码和手头上正在处理的代码有关，而导致我们需要去搜寻这些代码...那么我们的项目结构就很糟糕，甚至是更坏的情况，架构很糟糕。

# 尖叫架构

尖叫架构是 Robert C. Martin 的想法，它基本上表明了这样一个观点，架构应该清楚地告诉我们系统是做什么的：即它的主要领域。那么源代码文件夹里出现的第一级目录自然就应该和领域概念有关，即最顶层的限界上下文(例如，患者、医生、预约等)。它们应该和系统使用的工具(例如，Doctrine、MySQL、Symfony、Redis 等)无关，和系统的功能块(例如，资源库、制图、控制器等)无关，和传达机制无关(HTTP、控制台等)。

> 你的架构应该呈现给人的应该是系统，而不是系统使用的框架。如果你构建的是一个医疗保健系统，那么新程序员看到源代码仓库后的第一映像应该是：“哦，这是一个医疗保健系统”。—— Robert C. Martin 2011, [Screaming Architecture](https://8thlight.com/blog/uncle-bob/2011/09/30/Screaming-Architecture.html)

这实际上是一种更简单地理解他十五年前发表的包划分原则的方法，这些原则之前我已经阐述过了。这种分包的风格又叫做“按特性分包”。

# 延伸阅读

2008 – Johannes Brodwall – [Package by feature](http://johannesbrodwall.com/2008/07/29/link-package-by-feature/)
2012 -Johannes Brodwall – [How Changing Java Package Names Transformed my System Architecture](https://dzone.com/articles/how-changing-java-package)
2012 – sivaprasadreddy.k – [Is package by feature approach good?](http://stackoverflow.com/questions/11733267/is-package-by-feature-approach-good)
2013 – Lahlali Issam – [Lessons to Learn from the Hibernate Core Implementation](http://java.sys-con.com/node/2604365)
2013 – Manu Pk – [Package your classes by Feature and not by Layers](https://dzone.com/articles/package-your-classes-feature)
2015 – Simon Brown – [Package by component and architecturally-aligned testing](http://www.codingthearchitecture.com/2015/03/08/package_by_component_and_architecturally_aligned_testing.html)
2015 – César Ferreira – [Package by features, not layers](https://medium.com/@cesarmcferreira/package-by-features-not-layers-2d076df1964d)
2017* – javapractices.com – [Package by feature, not layer](http://www.javapractices.com/topic/TopicAction.do?Id=205)

# 引用来源

1996 – Robert C. Martin – [Granularity](https://drive.google.com/file/d/0BwhCYaYDn8EgOGM2ZGFhNmYtNmE4ZS00OGY5LWFkZTYtMjE0ZGNjODQ0MjEx/view)
1997 – Robert C. Martin – [Stability](https://drive.google.com/file/d/0BwhCYaYDn8EgZjI3OTU4ZTAtYmM4Mi00MWMyLTgxN2YtMzk5YTY1NTViNTBh/view)
2009 – 500internalservererror – [What do low coupling and high cohesion mean? What does the principle of encapsulation mean?](https://500internalservererror.wordpress.com/2009/02/23/what-do-low-coupling-and-high-cohesion-mean-what-does-the-principle-of-encapsulation-mean/)
2011 – Robert C. Martin – [Screaming Architecture](https://8thlight.com/blog/uncle-bob/2011/09/30/Screaming-Architecture.html)

[原文](https://herbertograca.com/2017/08/31/packaging-code/)作者为**Herberto Graça**，本译文作者为**覃宇**，分享需遵循[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)许可。
