---
title: 端口和适配器架构（译）
description: 软件架构编年史（11）端口和适配器架构
date: 2018-09-14
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

原文：<https://herbertograca.com/2017/09/14/ports-adapters-architecture/>

*这篇文章是[软件架构编年史](https://herbertograca.com/2017/07/03/the-software-architecture-chronicles/)([译]({{< ref "post/architecture-chronicles/chronicles" >}}))的一部分，这部编年史由[一系列关于软件架构的文章](https://herbertograca.com/category/development/series/software-architecture/)组成。在这一系列文章中，我将写下我对软件架构的学习和思考，以及我是如何运用这些知识的。如果你阅读了这个系列中之前的文章，本篇文章的内容将更有意义。*

2005年，Alistair Cockburn构思了[端口和适配器架构](http://alistair.cockburn.us/Hexagonal+architecture) (又称[六边形架构](http://alistair.cockburn.us/Hexagonal+architecture))并记录在他的博客中。下面这句话就是他对该架构的目标的定义：

> 让用户、程序、自动化测试和批处理脚本可以平等地驱动应用，让应用的开发和测试可以独立于其最终运行的设备和数据库。——Alistair Cockburn 2005，[端口和适配器](http://alistair.cockburn.us/Hexagonal+architecture)

有许多文章在谈及端口和适配器架构时会花很多篇幅在分层上。然而， 我并没有在 Alistair Cockburn 的原文中找到关于分层的只言片语。

其思想是将我们的应用看作是一个系统的中心交付物，输入和输出都是通过端口出入应用，这些端口将应用和外部工具、技术以及传达机制隔离开来。应用不应该关心是谁在发送输入或接收输出。这就是为了保护产品免受技术和业务需求演进的影响。由于技术/供应商锁定，这些演进可能导致产品刚开发没多久就被废弃。

我将在本文中剖析以下主题：

- 传统架构方式的问题
- 分层架构的演化
  - 什么是端口？
  - 什么是适配器？
  - 适配器的两种不同类型
- 端口和适配器架构有哪些优势?
  - 实现隔离和技术隔离
  - 传达机制的隔离
  - 测试
- 总结

# 传统架构方式的问题

传统的架构方式在前端和后端都可能给我们带来问题。

在前端，业务逻辑最终可能会渗透到 UI(例如，我们把用例的逻辑放到控制器或视图里，导致这些逻辑不能在其它 UI 界面中重用)， 甚至 UI 会反过来渗透到业务逻辑中(例如，我们会为了模板中需要的业务逻辑在实体中创建对应的方法)。

{{< figure src="hexagonal-arch-5-traditional2.png" class="medium" >}}

而在后端，我们可能会在自己的业务逻辑里使用外部类的类型提示、继承或者实例化它们，这会导致对这些外部的库和技术直接引用，最后任由它们渗透到业务逻辑中。

# 分层架构的演化

托[EBI](https://herbertograca.com/2017/08/24/ebi-architecture/) ([译]({{< ref "post/architecture-chronicles/ebi-architecture" >}}))和[DDD](https://herbertograca.com/2017/09/07/domain-driven-design/)([译]({{< ref "post/architecture-chronicles/domain-driven-design" >}}))的福, 2005 年我们已经知道了“系统中真正重要的是位于中间的层次”。业务逻辑(应该)存在于这些层次之中，它们才是我们和竞品的真正区别。这才是真正的“应用”。

{{< figure src="hexagonal-arch-1-outer-layers-similarity.png" class="medium" >}}

但是，Alistair Cockburn 意识到 **顶部和底部的层次从另一方面来说，就是应用的入口/出口**。尽管实际中它们不一样，却有着十分相似的目标，在设计上也是对称的。而且，如果我们想要隔离出应用中间的层次，这些入口和出口能以另一种相似的方式使用。
{{< figure src="hexagonal-arch-2-left-right6.png" class="medium" >}}

区别于典型的分层架构图，我们将它们画在系统的左右两侧，而不是上下两边。

虽然我们识别出了系统中对称的两侧，但**两侧都可能有若干入口/出口**。例如， API和UI就是位于应用左侧的两个不同的入口/出口。为了表示应用有若干个入口/出口，我们把应用的形状改成了多边形。**应用的形状可以是有多条边的任意多边形**，但最终六边形获得了青睐。这也是“六边形架构”的由来。

{{< figure src="hexagonal-arch-3-hexagon2.png" class="medium" >}}

[端口和适配器架构](http://alistair.cockburn.us/Hexagonal+architecture)使用了实现为端口和适配器的抽象层次，解决了传统架构方式带来的问题。

## 什么是端口？

端口是对其消费者无感知的进入/离开应用的入口和出口。在许多编程语言里，端口就是接口。例如，在搜索引擎里它可能是执行搜索的接口。在应用中，我们把这个接口当成入口/出口使用，而不用去关心它的具体实现，实际上在所有将接口定义为类型提示的地方，这些实现会被注入。

## 什么是适配器？

适配器是将一个接口转换(适配)成另一个接口的类。

例如，一个适配器实现了接口 A 并被注入了接口 B。当这个适配器被实例化时，一个实现了接口B的对象将从构造方法注入进来。实现了接口 A 的 对象会被注入到需要接口A的地方，然后接收方法请求，将其转换并代理给那个实现了接口B的内部对象。

如果我说的不够明白，别慌，后面我会给出一个更具体的例子。

## 适配器的两种不同类型

左侧代表 UI 的适配器被称为**主适配器**或者**主动适配器**，因为是它们发起了对应用的一些操作。而右侧表示和后端工具链接的适配器，被称为**从适配器**或者**被动适配器**，因为它们只会对主适配器的操作作出响应。

端口/适配器的用法也有一点区别：

- 在**左侧**，适配器依赖端口，该端口的具体实现会被注入到适配器，这个实现包含了用例。换句话说，**端口和它的具体实现(用例)都在应用内部**。
- 在**右侧**，适配器**就是**端口的具体实现，它自己将被注入到我们的业务逻辑中，尽管业务逻辑只知道接口。换句话说，**端口在应用内部，而它的具体实现在应用之外**并包装了某个外部工具。

{{< figure src="hexagonal-arch-4-ports-adapters2.png" class="medium" >}}

# 端口和适配器架构有哪些优势？

使用这种应用位于系统中心的端口/适配器设计，让我们可以保持应用和实现细节之间的隔离，这些实现细节包括昙花一现的技术、工具和传达机制。它还让可重用的概念更容易更快速地得到验证并被创建出来。

## 实现隔离和技术隔离

### 上下文

我们的应用使用SOLR作为搜索引擎，并使用一个开源库连接它并执行搜索。

### 传统架构方式

传统架构方式下，我们会直接在我们的代码中使用库(SOLR)里的类，作为类型提示，或者实例化和/或作为我们实现的基类。

### 端口和适配器架构方式

如果采用端口和适配器架构的话，我们会创建一个接口，比如叫做 UserSearchInterface，在代码中用这个接口作为类型提示。我们还会为 SOLR 创建一个实现该接口的适配器，比如叫做 UserSearchSolrAdapter。这个实现是 SOLR 的包装，SOLR 会被注入其中并用来实现接口指定的方法。

### 问题

不久之后，我们想用Elasticsearch换掉SOLR。甚至，对于同样的搜索行为，我们希望有些时候使用SOLR，有些时候使用Elasticsearch，在运行时决定就好。

如果我们采用传统架构，我们需要查找所有使用SOLR的代码并替换成Elasticsearch。然而，这可不是简单的查找替换：两个引擎的用法不同，方法、输入、输出也不尽相同，替换并不是一件轻松的任务。而在运行时在决定使用那个引擎甚至是不可能的。

然而，假设我们使用了端口和适配器架构，我们只需要创建一个新的适配器，比如就叫UserSearchElasticsearchAdapter，在注入时使用它换掉SOLR的适配器，也许改一下DCI中的配置就可以做到。我们完全可以使用工厂来决定注入那个适配器，实现在运行时注入不同的实现。

## 传达机制的隔离

和上面这个例子类似，假设我们的应用需要 Web GUI，CLI 和 Web API。我们想在全部三种 UI 中提供某个功能，比如叫做*UserProfileUpdate*的功能。

使用端口和适配器架构的话，我们会在一个应用服务的方法中实现这个功能并将其作为一个用例。服务会实现一个接口，该接口说明了方法、输入以及输出。

每个版本的 UI 都有各自的控制器(或控制台命令)来通过这个接口触发期望的逻辑，应用服务接口的具体实现会被注入到 UI 中。这种情况下，适配器实际上就是控制器(或 CLI 命令)。

之后我们可以修改 UI，因为我们知道这些修改不会影响业务逻辑。

## 测试

上面两个例子中，使用端口和适配器架构会让测试更加容易。第一个例子中，我们用接口(端口)的 Mock 就可以测试应用，而不需要使用 SOLR 或 Elasticsearch 。

第二个例子中，所有的 UI 都可以独立于应用进行测试。我们的用例也可以独立于 UI 进行测试，传给服务一些输入再断言结果就好。

# 总结

在我看来，端口和适配器架构只有一个**目标：将业务逻辑和系统使用的传达机制以及工具隔离**。为此，它使用了常见的编程语言结构：**接口**。

在**UI**侧(主动适配器)，我们创建**使用应用接口的适配器**，比如控制器。
在**基础设施**侧(被动适配器)，我们创建**实现应用接口的适配器**，比如资源库。

这就是全部！

然而，我惊讶的发现[早在十三年前同样的思想就已经公开发表了](https://herbertograca.com/2017/08/24/ebi-architecture/)([译]({{< ref "post/architecture-chronicles/ebi-architecture" >}}))，尽管它没有刻意地强调要将工具和传达机制从应用核心中隔离出来。

{{< figure src="fig_7_14_boundaries.jpg" class="medium" >}}

系统和角色的任何交互都要通过边界对象。按照 Jacobson 的描述，角色可以是客户或者管理员(操作员)这样的人类用户，也可以是定时器或者打印机这样的非人类“用户”，它们分别对应着端口和适配器架构中的*主动适配器*和*被动适配器*。

# 引用来源

1992 – Ivar Jacobson – [Object-Oriented Software Engineering: A use case driven approach](https://www.amazon.com/Object-Oriented-Software-Engineering-Driven-Approach/dp/0201403471)
200? – Alistair Cockburn – [Hexagonal Architecture](http://wiki.c2.com/?HexagonalArchitecture)
2005 – Alistair Cockburn – [Ports and Adapters](http://alistair.cockburn.us/Hexagonal+architecture)
2012 – Benjamin Eberlei – [OOP Business Applications: Entity, Boundary, Interactor](https://beberlei.de/2012/08/13/oop_business_applications_entity_boundary_interactor.html)
2014 – Fideloper – [Hexagonal Architecture](http://fideloper.com/hexagonal-architecture)
2014 – Philip Brown – [What is Hexagonal Architecture?](https://www.culttt.com/2014/12/31/hexagonal-architecture/)
2014 – Jan Stenberg – [Exploring the Hexagonal Architecture](https://www.infoq.com/news/2014/10/exploring-hexagonal-architecture)
2017 – Grzegorz Ziemoński – [Hexagonal Architecture Is Powerful](https://dzone.com/articles/hexagonal-architecture-is-powerful)
2017 – Shamik Mitra – [Hello, Hexagonal Architecture](https://dzone.com/articles/hello-hexagonal-architecture-1)

[原文](https://herbertograca.com/2017/09/14/ports-adapters-architecture/)作者为**Herberto Graça**，本译文作者为**覃宇**，分享需遵循[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)许可。
