---
title: 单体架构（译）
description: 软件架构编年史（5）单体架构
date: 2018-09-20
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

原文：<https://herbertograca.com/2017/07/31/monolithic-architecture/>

*这篇文章是[软件架构编年史](https://herbertograca.com/2017/07/03/the-software-architecture-chronicles/)([译]({{< ref "post/architecture-chronicles/chronicles" >}}))的一部分，这部编年史由[一系列关于软件架构的文章](https://herbertograca.com/category/development/series/software-architecture/)组成。在这一系列文章中，我将写下我对软件架构的学习和思考，以及我是如何运用这些知识的。如果你阅读了这个系列中之前的文章，本篇文章的内容将更有意义。*

混沌初开，单体始现...

默认的架构风格就是构建一个单体。我的意思是，最开始应用程序就只有一个文件，然后应用程序开始由多个文件组成，从 20 世纪 90 年代开始才出现由其它应用程序组成的应用(尽管20世纪80年代就开始了最初的尝试)。

单体自己也在发生变化。当应用程序开始使用多个文件创建时，其实并没有太多的思考，也没有太多思考的必要，因为应用程序都相当简单。当应用程序开始膨胀变得越来越复杂时，才会需要推敲应用程序背后有哪些文件需要创建，它们又该如何关联。

# 模块化软件开发

模块化编程是 20 世纪 60 年代末到 70 年代间提出的方案。它是从类到更粗粒度代码单元的明确定义的进化。编程语言使用不同等级的明确性来实现模块化。

例如，JAVA 在类这个层级的可见性有*默认*级别和 *public* 级别，*默认*级别意味着类只在它所属的 package (模块)内可见，而 *public* 级别意味着这个类在 package (模块)内和 package (模块)外都可见。

# 组件化软件开发

组件是另一种模块化风格。如我之前一篇[文章](https://herbertograca.com/2017/07/05/software-architecture-premises/)([译]({{< ref "post/architecture-chronicles/premises" >}}))所述，组件是按照领域概念划分的模块。理想情况下，它们是可以组成应用的独立的“应用程序”。老生常谈的例子是在 Unix 系统中广泛使用的管道和过滤器架构，例如我们可以使用这样的命令`ps -ef | grep php`。另外的例子就是 Netflix 将微服务作为应用的组件。

代码的组织风格和模块化软件开发一样，早在 20 世纪 60 年代末就已经存在了。

# 现代的单体

现在，单体架构风格就是简单地意味着所有应用代码被部署并*运行在单一节点的单一进程中*。我们认为它会用到模块和组件，尽管事实往往并非如此。

这里有两个关键词“部署”和“节点”要好好地理解。第一个词“部署”的意思是运行时代码的组织方式，无论代码在物理上是存储在一个还是多个代码库之中。而第二个词“节点”的意思是即便是在横向扩展的情况下我们将应用部署到了多个服务器，它依然是一个单体。

在单一节点的服务器上，单体的所有模块都被集中到同一个内存映像里，作为单一节点上的单个进程运行。通过标准进程调用在同一个栈和堆内进行模块间的通信。单个的内存映像让应用变成了单体。如果模块在不同的进程中运行，通信就变成了 IPC (进程间调用)。由于模块进入了不同的进程边界，你将要面临分布式计算的挑战。这就进入了*微服务*的范畴。(感谢[*dban*](https://www.reddit.com/user/_dban_)的[反馈](https://www.reddit.com/r/java/comments/6qmugy/monolithic_architecture/dkz11mt/))。

尽管这种风格声名狼藉，但它依然可以在大型应用中工作得很好。只是下面这些条件下表现得不足够好：

- 不同的领域组件需要**独立可伸缩**；
- 不同的组件需要**不同的编程语言**来编写；
- **独立可部署**，因为我们的发布频率比一个代码库的持续交付流水线要快，由于需要等待其它发布的部署导致自身发布的部署变慢，或者导致部署队列增长太快无法及时响应。

这时，我们需要将单体按照面向服务的架构风格(接下来的文章中将详细介绍)拆分成不同的应用程序。

# 反模式：大泥球/意大利面架构

{{< figure src="spaghetti.png" class="small" >}}

“大泥球”又称意大利面架构，是这种风格的反模式。这种反模式中，包结构和关系十分模糊，结构化的内聚和封装完全没有或极少，依赖毫无规则，子系统很难分辨，也很难修改和重构。系统**晦涩**、**粘滞**、**脆弱**、**僵化**：就是一个**大泥球**！

# 引用来源

1997 – Brian Foote, Joseph Yoder – [Big Ball of Mud](http://www.laputan.org/pub/foote/mud.pdf)
2012 – Len Bass, Paul Clements, Rick Kazman –[Software Architecture in Practice](https://www.amazon.com/Software-Architecture-Practice-SEI-Engineering-ebook/dp/B009GMUL84)
2017 – Herberto Graça – [Microservices architecture: What the gurus say about it](https://herbertograca.com/2017/01/26/microservices-architecture/)
2017 – Herberto Graca –[Software Architecture Premises](https://herbertograca.com/2017/07/05/software-architecture-premises/)
2017* – Wikipedia –[Modular programming](https://en.wikipedia.org/wiki/Modular_programming)
2017* – Wikipedia –[Component-based software engineering](https://en.wikipedia.org/wiki/Component-based_software_engineering)

[原文](https://herbertograca.com/2017/07/31/monolithic-architecture/)作者为**Herberto Graça**，本译文作者为**覃宇**，分享需遵循[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)许可。
