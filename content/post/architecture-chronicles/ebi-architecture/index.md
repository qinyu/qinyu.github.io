---
title: EBI 架构（译）
description: 软件架构编年史（8）EBI 架构
date: 2018-09-22
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

*这篇文章是[软件架构编年史](https://herbertograca.com/2017/07/03/the-software-architecture-chronicles/)([译]({{< ref "post/architecture-chronicles/chronicles" >}}))的一部分，这部编年史由[一系列关于软件架构的文章](https://herbertograca.com/category/development/series/software-architecture/)组成。在这一系列文章中，我将写下我对软件架构的学习和思考，以及我是如何运用这些知识的。如果你阅读了这个系列中之前的文章，本篇文章的的内容将更有意义。*

EBI 架构(Entity-Boundary-Interactor，实体-边界-交互器)架构因为 Robert C. Martin 关于整洁架构(我会在后续的文章中介绍)的讲座而被人熟知。

然而，Ivar Jacobson 早在 1992 年就在他的著作 [Object-Oriented Software Engineering: A use case driven approach](https://www.amazon.com/Object-Oriented-Software-Engineering-Driven-Approach/dp/0201403471)中提出了这个模式。那时，Jacobson 实际上把它叫做实体-接口-控制(Entity-Interface-Control)，但是后来改成了 EBI，避免“接口”和编程语言中的结构“接口”混淆，以及“控制”和 MVC 中的控制器混淆。

{{< figure src="fig_7_12_entity_interface_control.jpg" class="medium" >}}

# 实体

实体对象承载着系统使用的数据与所有和这些数据天然耦合在一起的行为。每一个实体对象都代表着一个和问题域相关的概念，以及它承载的身份和可恢复的(持久化)数据。Jacobson 告诉我们，实体对象应该包含和对象自己变同时发生变化的逻辑，例如，如果它的数据结构发生变化，这些数据上的操作也需要改变，因此它们也应该放在实体内。

有意思的是，早在 1992 年，Jacobson 就作出了如下警告：

> 新手也许有时会让实体对象只携带数据，把所有动态的行为放到控制对象中[...]。然而，这是应该避免的。[...] 许多行为反而应该放在实体对象中。——Ivar Jacobson 1992, pp. 134

这就是我们现在所知的“**贫血实体**”。

# 边界(接口)

边界对象是对系统接口的建模。

> […] 和系统接口有关的一切都应该放在接口对象中——Ivar Jacobson 1992, pp. 134

所有依赖系统环境(工具和传达机制)的功能都属于边界对象。

任何角色和系统的交互都要经过边界对象。如 Jacobson 所述，角色可以是像客户或管理员(操作员)这样的人类用户，也可以是像告警、打印机或者第三方 API 这样的非人类“用户”。

{{< figure src="fig_7_14_boundaries.jpg" class="medium" >}}

回味一下边界的概念，再看看图 7.14，把其中的四个边界想像成六个，我不禁联想到 2005 年才提出的端口和适配器架构(我将在后续的文章中介绍)，整整晚了 13 年。

# 交互器(控制)

交互器对象承载了和其它任何对象类型天然无关的行为。

这些行为通常由对实体一些操作组成，最后将某个结果返回给边界对象。

> 边界对象和实体对象挑剩下的行为会被放在控制对象中。—— Ivar Jacobson 1992, pp. 185

这意味着所有不适合放在边界或实体的行为都会被放在一个或多个控制对象中。

因此，Jacobson 认为控制对象不仅仅是编排用例的对象，也包括那些拥有和用例有关的行为的对象，它们既不是边界也不是实体。

根据我的经验，我认为他称为交互器的对象就是我称为应用服务(编排用例)和领域服务(包含领域行为但不是实体)的对象。

位于中间的交互器对象地位十分重要，原因在于，如果去掉它们，特定用例的逻辑就会被放到实体中。然而，实体会被多个用例使用，因此它们会有通用的用法。特定用例的逻辑如果被放到了实体中，就能被多个边界使用，这些边界最终会把这个实体当成通用逻辑。而我们就会不得不修改这个实体让它适应另一个边界，这会增加实体的复杂性而且可能会破坏用到该实体的其它用例。

# 为什么是三种对象类型？

当时，Jacobson 宣称其它的 OO 方法会把所有的职责都放在实体本身，但是他(和他的支持者)则倾向与将这些职责分散到三种对象类型中，因为这样能让系统更适应变化。

> […] 所有的系统都会发生变化。因此，只有所有的变化都发生在局部，稳定性才会存在，也就是说，变化最好只能影响系统中的一个对象。—— Ivar Jacobson 1992, pg. 135

通过职责的封装将系统的变化控制在局部，就是 EBI 架构的目标。我们仔细思考一下，Jacobson 只是没有直接说出十年之后由 Robert C. Martin 在他的 “**[Agile Software Development, Principles, Patterns, and Practices](https://www.amazon.com/dp/0135974445/ref=wl_it_dp_o_pC_nS_ttl?_encoding=UTF8&colid=CG11VVP0H8Y8&coliid=I1P9T8D1QRUFMM)**”一书中提出的**[单一职责原则](https://docs.google.com/open?id=0ByOwmqah_nuGNHEtcU5OekdDMkk)**罢了。

# 总结

和 MVC 模式中的 Model 代表着整个后端（包括所有实体、服务和它们之间的关系在内的一切）一样，EBI 模式将边界看作是和外部世界的完整连接，而不仅仅是一个视图、一个控制器或是一个接口(这里指的是编程语言结构的接口)。 边界代表了对应着 MVC 中的 View 和 Controller 的整个展现层。EBI 中的实体代表了承载着数据及其行为的真正实体，而交互器对象代表了展现层和实体之间的连接，也就是我所谓的应用服务和领域服务。

EBI 模式关注后端而 MVC 更关注前端。它们不能互相取代，它们是对方的补充。如果把它们放在一个模式中，我们可以把它叫做视图-控制器-交互器-实体 (View-Controller-Interactor-Entity)。

# 引用来源

1992 – Ivar Jacobson – [Object-Oriented Software Engineering: A use case driven approach](https://www.amazon.com/Object-Oriented-Software-Engineering-Driven-Approach/dp/0201403471)
2002 – Robert C. Martin – [Agile Software Development, Principles, Patterns, and Practices](https://www.amazon.com/dp/0135974445/ref=wl_it_dp_o_pC_nS_ttl?_encoding=UTF8&colid=CG11VVP0H8Y8&coliid=I1P9T8D1QRUFMM)
2002 – Robert C. Martin – [Single Responsibility Principle](https://docs.google.com/open?id=0ByOwmqah_nuGNHEtcU5OekdDMkk)
Eclipse Process Framework – [Entity-Control-Boundary Pattern](http://epf.eclipse.org/wikis/openuppt/openup_basic/guidances/concepts/entity_control_boundary_pattern,_uF-QYEAhEdq_UJTvM1DM2Q.html)
Jon Pearce – [Implementing Use Cases](http://www.cs.sjsu.edu/~pearce/modules/patterns/enterprise/ecb/ecb.htm)
2012 – Robert C. Martin – [Clean Architecture (NDC 2012)](https://youtu.be/Nltqi7ODZTM)
2014 – Adam Bien – [How to tackle JEE](https://www.youtube.com/watch?v=JWcoiXNoKxk&feature=youtu.be&t=15m14s)
2014 – Ali Parvini – [Model View Controller vs Boundary Control Entity](http://stackoverflow.com/questions/26910974/model-view-controller-vs-boundary-control-entity)

[原文](https://herbertograca.com/2017/08/24/ebi-architecture/)作者为**Herberto Graça**，本译文作者为**覃宇**，分享需遵循[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)许可。
