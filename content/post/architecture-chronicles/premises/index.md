---
title: 软件架构预述（译）
description: 软件架构编年史（2）软件架构预述
date: '2018-09-12'
tags:
  - 架构
  - 编年史
  - 翻译
author: 覃宇
series: 
  - 软件架构编年史
---

<!--more-->

_这篇文章是[软件架构编年史](https://herbertograca.com/2017/07/03/the-software-architecture-chronicles/)([译](https://www.jianshu.com/p/b477b2cc6cfa))的一部分，这部编年史由[一系列关于软件架构的文章](https://herbertograca.com/category/development/series/software-architecture/)组成。在这一系列文章中，我将写下我对软件架构的学习和思考，以及我是如何运用这些知识的。如果你阅读了这个系列中之前的文章，本篇文章的的内容将更有意义。_

在这篇文章中，我将总结一些关于软件架构的最基本的概念，了解它们才能更好地理解后续的文章。

# 没有银弹

无论你如何理解我在[软件架构编年史](https://herbertograca.com/2017/07/03/the-software-architecture-chronicles/)([译](https://www.jianshu.com/p/b477b2cc6cfa))中谈到的内容，首先要理解的是**没有银弹**，没有“*普适性*”的解决方案。尽可能地了解不同的方法，理解每一种方法的优劣，和它们解决的特定技术问题。

然后，当接受新的挑战时，先从理解业务和最终用户的需求开始。在搞清楚这些需求之后，你才能思考应该采用哪些架构风格和模式来更好地解决这些问题。

最后，自己做出选择，是实现一种已知的解决方案，还是创造适合自己的特定问题的独特设计。

> 有些架构风格号称是所有形式的软件的“银弹”。然而，优秀的设计这应该选择最符合解决特定问题需要的风格。——Roy Fielding, 2000[^1]

# 术语

在软件开发的世界中使用的术语很多都模棱两可，因此，我必须澄清一些我使用的术语的含义，然后继续。

## 功能性(Functional)

在应用中纯粹发挥技术作用的代码片段、方法、类、类的组合。它们**和（业务）领域无关**，**仅仅代表应用中的一种技术能力**。例如：

*   层次(Layer)
*   工厂(Factory)
*   资源库(Repository)
*   值对象(Value Object)
*   视图(View)
*   视图模型(ViewModel)

## 概念性(Conceptual)

在应用中标识一个（业务）领域概念的代码片段、方法、类、类的组合。它们**和领域相关**，**代表应用中的一种业务能力**。例如：

*   用户
*   产品
*   库存管理
*   产品变体
*   结帐
*   销售

这种划分并不是说一个代码单元不能同时具备两种能力(功能性和概念性)。例如，“Money”对象可以表示一个领域概念，同时也被设计成一个值对象。如果我把它当成领域概念，我指的就是领域内的金钱概念，但如果我涉及的是这个类中的功能性方面时，我指的就是值对象的技术特性(没有ID、可以是不变的等等)。

## 包(Package)

划分在一起的类组成的集合，理想情况下遵循一组规则进行划分。

## 模块(Module)

我使用[Software Architecture in Practice](https://www.amazon.com/Software-Architecture-Practice-SEI-Engineering-ebook/dp/B009GMUL84)[^7]给出的定义，模块就是一个**功能性包**，它体现了应用中的**一种技术能力**。它是解耦的并且能够被其他的实现替换。我的理解是，模块即存在与较低的粒度级别，比如，“**安全模块**”或者“**ORM**”，也可以存在于像**客户端**和**服务器**这样的应用块。模块提供的是功能性内聚。

## 组件(Component)

我使用[Software Architecture in Practice](https://www.amazon.com/Software-Architecture-Practice-SEI-Engineering-ebook/dp/B009GMUL84)[^7]给出的定义，作者将组件定义为一个代表**业务能力**的**概念性包**。理想情况下，它也是和其他组件和模块解耦的。例如“**用户**”、“**产品**”或“**结帐**”。

然而，最重要的是要记住，理想情况下，它代表了一个**限界上下文(Bounded Context)**。组件提供了概念性内聚。

## 应用(Application)

我将面向用户的代码即 UI 视为应用，它建立在组件之上。例如，我们可以基于一组组件构建网络商店。不管怎样，这个网络商店会提供一个(店面) UI 让用户浏览和购买商品和另一个(管理) UI 让商店管理员管理商品、库存、支付供应商，等等。这是在同样的业务组件之上构建的两个独立的应用。

## 系统(System)

我认为系统是一组以某种方式在一起工作，为各种企业必需品提供功能，形成一个企业范围内的系统，即企业应用。这些应用可能构建在相同或不同的组件上。在之前网络商店的例子中，系统就是作为一个整体的网络商店，包括两个基于同样业务组件构建的两个应用(店面和管理)，还有其他像支付供应商或货运供应商这样的第三方应用。

## 架构(Architecture)

软件架构的简单定义有很多，我觉得都不错，但我认为理解它是什么很简单，而更重要的是，定义架构的产出，它应该给项目带来什么。　

> 软件架构[…]是系统需要考虑的一组结构，它们包括软件元素和它们之间的关系，以及这些元素和关系的属性。—— Clements et al, 2010[^6]

下面是我考虑架构的方面：

* **横跨所有特性开发**的技术决策，例如，框架、代码标准、文档、流程，...；
* 这是存在于项目中的一组**很难在后期改变**的技术决策 [^3]；
* 它是系统的全景图[^5]:pp.2，粗略的描绘，**结构**，组件及其关系[^4] [^6];
* 它使**项目做好变化的准备**[^5]:pp.30，常常是将决策推迟到最后允许的时刻[^5]:pp.32；
* 它让项目做好**重用组件和模块的准备**[^7]；
* 它制定出**结果的一致性标准**并建立**轻量的流程**，比如编码规范、开发阶段、持续交付和持续部署；
* 它**不是某一个人的职责**，而是由来自项目中不同特性团队的开发者组成的*行会*的职责。

如果你不熟悉行会的概念，可以观看下面关于*Spotify 工程师文化*的视频：

* [Spotify Engineering Culture part 1](https://www.youtube.com/watch?v=4GK1NDTWbkY)
* [Spotify Engineering Culture part 2](https://www.youtube.com/watch?v=X3rGdmoTjDc)

## 架构师(Architect)

他是由行会讨论和决定的架构的**发起人和守护者**。他是部门/团队中经验最丰富的开发者之一，恰好承担着分析高层次问题和解决方案的额外职责。在做出架构决策时，他还拥有“质量票”（He also benefits from a “quality vote” when making an architectural decision.）。

可是，有一点值得注意，所有开发者某种程度上都是架构师，因为他们都要了解架构，他们都会议某种形式参与架构，他们都适当地承担着维护架构的职责。　

## 象牙塔架构师(Ivory Tower Architect)

有一种架构师会做出和架构有关的所有决定，这种万能的**象牙塔架构师**是一种架构师的**反模式**。他对其他干系人对架构的贡献既不开放，也不轻易接收，而是阉割了这些贡献。

## 架构以及代码的坏味道（Smells of a bad Architecture (and bad code)） [^8]

## 僵化(Rigidity)

如果软件难以修改是因为修改会导致更多关联修改，软件就是僵化的。它就会变成兔子洞：当我们以为修改快要完成时，突然发现还有更多的代码需要修改，把我们拉进无止尽的轮回之中。

## 脆弱(Fragility)

脆弱的软件在修改时，总会出现意料之外的、毫无关联的、无法预测的错误。

## 牢固(Immobility)

如果设计包含一些可以在其它系统中使用的部分，但将这些部分从原系统中分离出来需要大量工作甚至带来许多风险，我们就说设计是牢固的。

## 粘滞(Viscosity)

在一个粘滞的系统中，要做对困难重重，要做错却轻而易举。这意味着通过正常开发实现变更不如用非常手段来得容易。

如果执行单元测试和/或编译需要耗费很长时间，开发很可能导跳过这些过程，不跑任何自动化测试就实现非常规的修改，这就是**系统范围的粘滞**。　

## 不必要的重复(Needless repetition)

当时间不够或经验不足导致必要的抽象缺失时，就会产生不必要的重复。这些代码也许并不是直接复制粘贴造成的重复，而是由在不同地方重复定义的相同业务规则带来的。

## 晦涩(Opacity)

代码写得混乱，难以理解，我们需要深人方法实现的细节才能搞清楚代码要干什么。

## 不必要的复杂(Needless complexity)

开发者采用了多种不同的抽象和未来潜在变化的应对措施，来积极地避免其他六种坏味道。良好的软件设计是轻量灵活的，理解起来更容易，最重要的是修改更容易，因此不必预判所有未来的潜在变化。

[原文](https://herbertograca.com/2017/07/05/software-architecture-premises/)作者为**Herberto Graça**，本译文作者为**覃宇**，分享需遵循[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)许可。

[^1]: 2000 – Roy Fielding – [Architectural Styles and the Design of Network-based Software Architectures](http://www.ics.uci.edu/~fielding/pubs/dissertation/fielding_dissertation.pdfhttp://www.ics.uci.edu/~fielding/pubs/dissertation/fielding_dissertation.pdf) 
[^2]: 2000 – Robert C. Martin – [Design Principles and Design Patterns](http://www.cvc.uab.es/shared/teach/a21291/temes/object_oriented_design/materials_adicionals/principles_and_patterns.pdf) 
[^3]: 2006 – Booch, in [[5 pg.2]](https://herbertograca.com/2017/07/05/software-architecture-premises/#05) 
[^4]: 2007 – [IEEE1471](https://en.wikipedia.org/wiki/IEEE_1471) in [[5 pg.2]](https://herbertograca.com/2017/07/05/software-architecture-premises/#05) 
[^5]: 2010 – James Coplien, Gertrud Bjornvig – [Lean Architecture](https://www.amazon.co.uk/Lean-Architecture-Agile-Software-Development/dp/0470684208) 
[^6]: 2010 – Paul Clements, Felix Bachmann, Len Bass – [Documenting Software Architectures](https://www.amazon.co.uk/dp/0321552687) 
[^7]: 2012 – Len Bass, Paul Clements, Rick Kazman – [Software Architecture in Practice](https://www.amazon.com/Software-Architecture-Practice-SEI-Engineering-ebook/dp/B009GMUL84)
[^8]: 2014 – M. H. Jongerius – [THE SEVEN DESIGN SMELLS OF ROTTING SOFTWARE](http://mhjongerius.tumblr.com/post/61853273412/the-seven-design-smells-of-rotting-software) 
[^9]: 2017* – Wikipedia – Software Architecture
