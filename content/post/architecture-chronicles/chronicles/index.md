---
title: 软件架构编年史（译）
description: 软件架构编年史（1）开篇 
date: 2018-08-27
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

_这是[软件架构系列](https://herbertograca.com/category/development/series/software-architecture/)的第一篇文章。我将我对软件架构的学习过程和思考以及我是如何运用这些知识的写成这一系列文章。_

我把这一系列文章称为“软件架构编年史”，并不是因为我觉得自己的文笔不错，而是想用一种有趣的方式旧调重弹！😀

在第一篇文章里，我将谈谈我撰写这一系列的原因和接下来的计划。

# 学习历史的重要性

> 不学习历史的人注定要重复错误。——温斯顿·丘吉尔

我发现从历史中学习十分重要，历史可以教给我们很多东西。在个人层面，我们(最终有望)从自己的失败中学习。在国家层面，历史帮助形成我们的文化，创造群体思想，“我们”的思想，国家的同一性。它还能帮助我们从祖先的错误中学习，比如错信一些人的疯狂思想，想想第二次世界大战...

对我们开发者来说，历史帮助我们在前辈们的知识上前进。它帮助我们从前辈们的知识：错误、经历和经验中学习。它帮助我们“_站在巨人的肩膀上_”更上一层楼！

在我向更好开发者前进的成长之路上，我浏览过许多文章，观看过许多会议演讲，也阅读过许多书籍。我尽可能地站在巨人的肩膀上！

然而我一直有一个困惑，这些观点发展出其它许多观点，又继续发展出更多的观点...这就好比“传话游戏”，论文、文章或者书籍原本要表达的思想最终会被扭曲。

于是我开始在互联网上搜寻，寻找表达这些概念的原始论文、文章和书籍，我觉得它们是我工作中最重要的概念，我自己也时常思考它们。

在我尝试以某种考古方式理解这些概念如何形成的过程中，我的思考就形成了这一系列文章。

撰写这些文章强迫我大量阅读和思考这些主题，这帮我理解现代软件开发中使用的技术。我希望这些文章能帮到更多后来的开发者。

然而，如果你读到任何不理解或者有异议的内容，请让我知晓。我对这些主题的讨论持完全开放的态度，希望可以从他人那里学习，当我被证明犯错时我会改变我的观点。

# 软件架构编年史系列

[出事儿]({{< ref "post/architecture-chronicles/premises" >}})

1. [软件架构编年史（译）]({{< ref "post/architecture-chronicles/chronicles" >}})  //[原文](https://herbertograca.com/2017/07/03/the-software-architecture-chronicles/)
2. [软件架构预述（译）]({{< ref "post/architecture-chronicles/premises" >}}) //[原文](https://herbertograca.com/2017/07/05/software-architecture-premises/)
3. [编程语言的演化（译）]({{< ref "post/architecture-chronicles/programming-language-evolution" >}}) //[原文](https://herbertograca.com/2017/07/10/programming-language-evolution/)  
4. [架构风格 vs. 架构模式 vs. 设计模式（译）]({{< ref "post/architecture-chronicles/architecture-vs-design" >}}) //[原文](https://herbertograca.com/2017/07/28/architectural-styles-vs-architectural-patterns-vs-design-patterns/)  
5. [单体架构（译）]({{< ref "post/architecture-chronicles/monolithic-architecture" >}}) //[原文](https://herbertograca.com/2017/07/31/monolithic-architecture/)  
6. [分层架构（译）]({{< ref "post/architecture-chronicles/layered-architecture" >}}) //[原文](https://herbertograca.com/2017/08/03/layered-architecture/)  
7. [MVC及其变种（译）]({{< ref "post/architecture-chronicles/mvc-and-variants" >}}) //[原文](https://herbertograca.com/2017/08/17/mvc-and-its-variants/)  
    * [1979 – Model-View-Controller（译）]({{< ref "post/architecture-chronicles/mvc-and-variants" >}})  //[原文](https://herbertograca.com/2017/08/17/mvc-and-its-variants/#model-view-controller)
    * [1987/2000 – PAC / Hierarchical Model-View-Controller（译）]({{< ref "post/architecture-chronicles/mvc-and-variants" >}})  //[原文](https://herbertograca.com/2017/08/17/mvc-and-its-variants/#hierarchical-model-view-controller)
    * [1996 – Model-View-Presenter（译）]({{< ref "post/architecture-chronicles/mvc-and-variants" >}})  //[原文](https://herbertograca.com/2017/08/17/mvc-and-its-variants/#model-view-presenter)
    * [1998 –"Model 1" & "Model 2"（译）]({{< ref "post/architecture-chronicles/model-1-model-2" >}}) //[原文](https://herbertograca.com/2018/08/29/model-1-model-2/)
    * [2005 – Model-View-ViewModel（译）]({{< ref "post/architecture-chronicles/mvc-and-variants" >}})  //[原文](https://herbertograca.com/2017/08/17/mvc-and-its-variants/#model-view-view_model)
    * [???? – Model-View-Presenter-ViewModel（译）]({{< ref "post/architecture-chronicles/mvc-and-variants" >}})  //[原文](https://herbertograca.com/2017/08/17/mvc-and-its-variants/#model-view-presenter-view_model)
    * [2008 – Resource-Method-Representation（译）]({{< ref "post/architecture-chronicles/resource-method-representation" >}}) //[原文](https://herbertograca.com/2018/08/31/resource-method-representation/)
    * [2014 – Action-Domain-Responder（译）]({{< ref "post/architecture-chronicles/action-domain-responder" >}}) //[原文](https://herbertograca.com/2018/09/03/action-domain-responder/)
8. [EBI 架构（译）]({{< ref "post/architecture-chronicles/ebi-architecture" >}}) //[原文](https://herbertograca.com/2017/08/24/ebi-architecture/)
9. [包和命名空间（译）]({{< ref "post/architecture-chronicles/packaging-and-namespaces" >}}) //[原文](https://herbertograca.com/2017/08/31/packaging-code/)  
10. [领域驱动设计（译）]({{< ref "post/architecture-chronicles/domain-driven-design" >}}) //[原文](https://herbertograca.com/2017/09/07/domain-driven-design/)
11. [端口和适配器架构(六边形架构)（译）]({{< ref "post/architecture-chronicles/ports-and-adapters" >}}) //[原文](https://herbertograca.com/2017/09/14/ports-adapters-architecture/)  
12. [洋葱架构（译）]({{< ref "post/architecture-chronicles/onion-architecture" >}}) //[原文](https://herbertograca.com/2017/09/21/onion-architecture/)  
13. [整洁架构（译）]({{< ref "post/architecture-chronicles/clean-architecture" >}}) //[原文](https://herbertograca.com/2017/09/28/clean-architecture-standing-on-the-shoulders-of-giants/)  
14. [事件驱动的架构（译）]({{< ref "post/architecture-chronicles/event-driven-architecture" >}}) //[原文](https://herbertograca.com/2017/10/05/event-driven-architecture/)  
15. [从 CQS 到 CQRS（译）]({{< ref "post/architecture-chronicles/from-cqs-to-cqrs" >}}) //[原文](https://herbertograca.com/2017/10/19/from-cqs-to-cqrs/)  
16. [面向服务的架构(SOA)（译）]({{< ref "post/architecture-chronicles/soa" >}}) //[原文](https://herbertograca.com/2017/11/09/service-oriented-architecture-soa/)  
17. [清晰架构(01)：融合DDD、洋葱架构、整洁架构、CQRS...（译）]({{< ref "post/architecture-chronicles/explicit-architecture" >}}) //[原文](https://herbertograca.com/2017/11/16/explicit-architecture-01-ddd-hexagonal-onion-clean-cqrs-how-i-put-it-all-together/)  
18. [清晰架构(02)：超越同心圆分层（译）]({{< ref "post/architecture-chronicles/explicit-architecture-02" >}}) //[原文](https://herbertograca.com/2018/07/07/more-than-concentric-layers/)  
19. [清晰架构(03)：在代码中展现架构和领域（译）]({{< ref "post/architecture-chronicles/reflecting-architecture-in-code" >}}) //[原文](https://herbertograca.com/2019/06/05/reflecting-architecture-and-domain-in-code/)
20. [清晰架构(04)：用文档描述架构（译）]({{< ref "post/architecture-chronicles/documenting-architecture" >}}) //[原文](https://herbertograca.com/2019/08/12/documenting-software-architecture/)
21. 一个项目的演进：从 MVP 到 P  
22. 4 + 1 架构视图模型
23. 架构的质量属性

# 时间线

下面是我在阅读所有这些主题的文章和书籍之后总结的一条软件开发发展的粗略的时间线。我找到的关于确切时间的参考资料都作为链接加入了时间线，拿不准的时间我都加上了“~”，表示“大约”是这个时间。我们还可以在维基百科的[编程范式主页](https://en.wikipedia.org/wiki/Programming_paradigm)上找到大量相关的内容。

这里列出的大多数话题都将在这个系列中谈及。

- 20 世纪 50 年代
  * **非结构化编程**
  * ~1951 – **汇编**
- 20 世纪 60 年代
  * **结构化编程**
  * **分层**: 用户界面、业务逻辑数据存储都在**一层**。
  * ~1958 – Algol
- 20 世纪 70 年代
  * **过程式/函数式编程**
  * ~1970 – Pascal
  * ~1972 – C
  * [1979](http://heim.ifi.uio.no/~trygver/1979/mvc-2/1979-12-MVC.pdf) – **MVC 模式(Model-View-Controller)**
- 20 世纪 80 年代
  * **面向对象编程** (但其思想在 [20世纪60年代](http://userpage.fu-berlin.de/~ram/pub/pub_jf47ht81Ht/doc_kay_oop_en)晚期已经第一次提出)
  * **分层**: **两层**，第一层是用户界面，第二层是业务逻辑和数据存储
  * ~1980 – C++
  * **CORBA** – 通用物件请求代理架构(尽管[1991年](https://en.wikipedia.org/wiki/Common_Object_Request_Broker_Architecture#Versions_history)才推出第一个稳定版，但最早使用可以追溯到 [20世纪80年代](https://en.wikipedia.org/wiki/TIBCO_Software))
  * ~1986 – Erlang
  * ~1987 – Perl
  * [1987](https://www.lri.fr/~mbl/ENS/FONDIHM/2013/papers/Coutaz-Interact87.pdf) – PAC 即 **HMVC 模式(Hierarchical Model-View-Controller)**
  * [1988](https://drive.google.com/file/d/0BwhCYaYDn8EgNzAzZjA5ZmItNjU3NS00MzQ5LTkwYjMtMDJhNDU5ZTM0MTlh/view) – **LSP(里氏替换原则)** (~SO**L**ID)
- 20 世纪 90 年代
  * **分层**: **三层**，第一层是用户界面，第二层是业务逻辑(以及浏览器作为客户端时的用户界面展现逻辑)，第三层是数据存储
  * ~1991 – **消息总线**
  * ~1991 – Python
  * [1992](https://www.amazon.com/Object-Oriented-Software-Engineering-Driven-Approach/dp/0201403471) – **EBI 架构**(Entity-Boundary-Interactor) 即 EBC 或 EIC
  * ~1993 – Ruby
  * ~1995 – Delphi, Java, Javascript, PHP
  * [1996](http://www.wildcrest.com/Potel/Portfolio/mvp.pdf) – **MVP 模式(Model-View-Presenter)**
  * [1996](http://butunclebob.com/ArticleS.UncleBob.PrinciplesOfOod) – **OCP**, **ISP**, **DIP** (~S**O**L**ID**), REP, CRP, CCP, ADP
  * [1997](http://butunclebob.com/ArticleS.UncleBob.PrinciplesOfOod) – SDP, SAP
  * ~[1997](http://www.cs.ubc.ca/~gregor/papers/kiczales-ECOOP1997-AOP.pdf) – **面向方面编程**
  * ~1997 – Web 服务
  * ~[1997](http://shop.oreilly.com/product/9780596006754.do) – **ESB** – 企业服务总线 (尽管创造该术语的书籍2004年才出版，但这个概念早已被使用)
- 21 世纪 00 年代
  * [2002](http://a.co/7S3sJ2J) – **SRP** (~**S**OLID)
  * [2003](https://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215) – **领域驱动设计**
  * [2005](https://blogs.msdn.microsoft.com/johngossman/2005/10/08/introduction-to-modelviewviewmodel-pattern-for-building-wpf-apps/) – **MVVM 模式(Model-View-ViewModel)**
  * [2005](http://alistair.cockburn.us/Hexagonal+architecture) – **端口和适配器架构**即六边形架构
  * [2006](https://youtu.be/JHGkaShoyNs?t=1m17s)? – **CQRS 与 ES** (命令查询职责分离与事件溯源)
  * [2008](http://jeffreypalermo.com/blog/the-onion-architecture-part-1/) – **洋葱架构**
  * [2009](https://medium.com/s-c-a-l-e/talking-microservices-with-the-man-who-made-netflix-s-cloud-famous-1032689afed3) – **微服务**(Netflix)
- 21 世纪 10 年代
  * [2010](https://www.amazon.co.uk/Lean-Architecture-Agile-Software-Development/dp/0470684208) – **DCI 架构**(Data-Context-Interaction)
  * [2012](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html) – **整洁架构**
  * [2014](http://www.codingthearchitecture.com/2014/08/24/c4_model_poster.html) – C4 模型

[原文](https://herbertograca.com/2017/07/03/the-software-architecture-chronicles/)作者为**Herberto Graça**，本译文作者为**覃宇**，分享需遵循[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)许可。
