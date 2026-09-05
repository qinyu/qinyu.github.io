---
title: Action-Domain-Responder（译）
description: 软件架构编年史（7）Action-Domain-Responder
date: 2019-02-16
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

原文：<https://herbertograca.com/2018/09/03/action-domain-responder/>

*这篇文章是[软件架构编年史](https://herbertograca.com/2017/07/03/the-software-architecture-chronicles/)([译]({{< ref "post/architecture-chronicles/chronicles" >}}))的一部分，这部编年史由[一系列关于软件架构的文章](https://herbertograca.com/category/development/series/software-architecture/)组成。在这一系列文章中，我将写下我对软件架构的学习和思考，以及我是如何运用这些知识的。如果你阅读了这个系列中之前的文章，本篇文章的内容将更有意义。*

MVC 诞生于 1979 年，它诞生于使用 CLI 用户界面的桌面应用上下文中，它暗示如果用户外部因素导致数据库变化，那么 UI 就应该自动地变化。同样的模式也可以完美地应用在稍后出现的 GUI 桌面应用上。

然而，它却和 Web 应用一直在磨合中，因为大多数 Web 应用不会用 UI 变化来作为服务端发生的变化的后果，它们总是从 UI 发起对服务端的调用来更新界面。

前面我已经介绍过 [MVC 及其变种](https://herbertograca.com/2017/08/17/mvc-and-its-variants/)([译]({{< ref "post/architecture-chronicles/mvc-and-variants" >}}))，而这篇文章将介绍另一个变种：由 Paul M. Jones 提出的 ***Action-Domain-Responder***。

# 2014 – Action-Domain-Responder

ADR 模式由 Paul M. Jones 于 2014 年提出，其思想和 RMR 一致，就是将 MVC 应用于 Web REST API 上下文。[ADR 最早的解释](https://github.com/pmjones/adr#action-domain-responder)相当简单明了，我实在想不出更好的说法了，所以我简单地将其中部分内容复制/粘贴到了这里，并增加了一些评论。

{{< figure src="adr-22.png" class="medium" >}}

## Action

是连接 *Domain* 和 *Responder* 的逻辑。它使用收集自 HTTP 请求的输入调用 *Domain*，然后使用构建 HTTP 响应所需的数据调用 *Responder* 。

你可以在[这里](https://github.com/pmjones/adr-example/blob/master/src/Web/Blog/Add/BlogAddAction.php)找到 Action 的例子。

## Domain

是组成应用核心的领域逻辑的入口，它根据需要修改状态并保存。 它可能是事务脚本、服务层、应用服务或者其它类似的概念。

你可以在[这里](https://github.com/pmjones/adr-example/blob/master/src/Domain/Blog/BlogService.php)找到 Domain 入口的例子。

## Responder

是基于自 *Action* 接收的数据创建 HTTP 响应的展现逻辑。它处理状态码、标头与 Cookie、内容、格式与转换、模板与视图，等等。

你可以在[这里](https://github.com/pmjones/adr-example/blob/master/src/Web/Blog/Add/BlogAddResponder.php)找到 Responder 的例子。

## 它如何工作

1. Web 处理程序收到 HTTP 请求并派发给 Action；
2. Action 调用 Domain，从 HTTP 请求里收集任何需要的输入给 Domain；
3. 然后 Action 使用创建 HTTP 响应所需的数据（通常是 HTTP 请求和 Domain结果，如果有的话）调用 Responder；
4. Responder 使用 Action 提供给它的数据构造 HTTP 响应；
5. Action 将 HTTP 响应返回给发送 HTTP 响应的 Web 处理程序。

Responder 基于对领域响应的解析和理解来构造 HTTP 响应，而领域响应又依赖操作方法的用例。这意味着每个操作方法都需要一个特定的 Responder。如果我们将所有资源方法放到同一个控制器中，我们就需要实例化全部 Responder 并注入到控制器中，而我们在一次 HTTP 请求中只会使用一个 Responder，这显然不是最优的方案。解决方法是每个控制器只有一个方法，这种控制器和它唯一的操作方法就是 ADR 所说的 Action。

既然 Action 只有一个方法，方法名就可以使用通用的 `run`、`execute`、或是 PHP 中的 `__invoke`，让这个类变成可以调用的。然而，由于其思想是将 MVC 模式应用到 HTTP REST API 上下文，Action（控制器）名称会被映射为 HTTP 请求方法，因此我们将得到名为 `Get`、`Post`、`Put`、`Delete`...的 Action，清楚地表明了每个 HTTP 请求类型调用的控制器。作为一种组织形式，一个资源的所有 Action 应该被一起放以该资源命名的文件夹下。

## 与 ADR 混为一谈

Anthony Ferrara 对比了 ADR 和 [RMR](https://herbertograca.com/2018/08/31/resource-method-representation/) ，认为“*[它们是同样的模式，只是细节有所调整](https://blog.ircmaxell.com/2014/11/alternatives-to-mvc.html#ADR-Action-Domain-Responder)*”。

我不同意这个观点。实际上我认为 Anthony Ferrara 对它的理解是错误的（他很聪明，只知识渊博，但人总有犯错的时候）：

1. “*Resource==Domain*”
   RMR 中的 *Resource* 并非 Domain，而是领域对象，是领域实体，但 ADR 中的 *Domain* 与全部领域对象有关，所有的实际和它们的关系作为一个整体；
2. “*Representation==Responder*”
   RMR 中的 *Representation* 是发回给客户端的响应，但 ADR 中的 *Responder* 是一个对象，它的职责是基于给定内容和给定模板构造响应。
3. “*它和 RMR 一样与 HTTP 耦合在一起，很难创建非 HTTP 界面*”
   既然 ADR 将 Domain 看作是一个整体而不是一个实体，Action 也不在领域对象内部，那么 Action 只会要求领域对象执行一些业务逻辑。所以 Domain 没有与 UI 耦合，我们可以创建一个CLI 命令，使用领域对象执行一些任务。

## 我对这种模式的看法

在我看来，本文撰写之时，**ADR 是 MVC 在 HTTP 请求/响应范式上的最佳应用**，因为它清晰地将 **HTTP** 请求和响应对应到了 **Domain** 请求和响应，同时仍然保持了 Domain 和展现层之间完全的解耦。

HTTP 请求方法（期望对资源进行的操作）被明确地连接到接收 HTTP 请求的代码，因为每个 HTTP 方法都直接映射到一个控制方法的名字。这样做还有一个额外的好处，那就是产生了清晰、明确和可预测的代码组织结构，而不是具有大量操作的控制器，这些操作通常是不相关的，命名糟糕，不可预测，而且常常执行非常类似的操作。换句话说，它避免了混乱的意大利面式的控制器和操作。

还有，它也非常好地解耦了交互自身的代码（调用领域）和理解交互结果（领域响应）并转换给客户端的代码。

然而，有一些问题仍然需要注意：

1. 该模式专为 REST API 而设计，因此，在这种形式下**它还没有完善到可以用于 HTML 界面的 Web 应用中**（例如，该如何命名创建资源之前展示表单的操作？）；
2. 一个控制器只有一个方法让这种模式更啰嗦，因为，举个例子，相较于一个拥有四个操作（公有方法）的控制器（类），我们拥有的是四个控制器和四个操作。
3. **为每个操作创建 Responder 也会让这种模式更啰嗦**。如果将领域响应转换成 HTTP 响应的逻辑很简单，我们应该思考一下是否值得使用 Responder。不用 Responder 意味着我们可以在每个控制器中拥有多个方法，每个方法依然与一个 HTTP 方法对应。

**关于第二点和第三点**, Paul M. Jones [自己也承认](https://github.com/pmjones/adr/blob/master/TRADEOFFS.md)并同意有些情况下使用简化的模式是可以接受的，尽管不那么优雅，但足以应对手头上的上下文。

**关于第一点**，我认为该模式可以轻松地进行扩展，就能完全应用于 HTML 界面：我们可以模拟一些 REST API 没有的额外的 HTTP 方法，专门处理 HTML 请求。例如，我们可以在一个 REST API 中使用 `PUT` 或 `POST` 来创建和/或更新资源，而这就是该资源所需的全部方法，可是对于 HTML 界面来说，我们在发送 `PUT` 或 `POST` 之前需要一个表单，但是没有 HTTP 方法专门供客户端请求创建资源或编辑的表单。然而，我们可以使用一个带有 `create` 或 `edit` 标头的 `GET` 请求来模拟它，前端控制器可以解析该请求并转发给对应的名为 `Create` 或 `Edit` 的操作，然后这些操作将回复对应的 HTML 表单。然而，对于创建额外的自定义 HTTP 方法，我们要非常小心和克制…否则可能导致产生过多的自定义 HTTP 方法和一大堆绑定到意大利面条式的操作的自定义 HTTP 方法！！因此，**小心谨慎地采纳最后这个建议**。

# 引用来源

2014 – Paul M. Jones – [Action Domain Responder](https://github.com/pmjones/adr)
2014 – Paul M. Jones – [Action-Domain-Responder](https://vimeo.com/106771285) (Vimeo)
2014 – Paul M. Jones – [The Template Is Not The View: A Brief Introduction to ADR](https://www.youtube.com/watch?v=rlrTyN0aqSk)(Youtube)
2014 – Paul M. Jones – [Action-Domain-Responder: A Refinement of MVC](https://www.slideshare.net/pmjones88/actiondomainresponder-a-refinement-of-mvc) (slides)
2014 – Anthony Ferrara – [Alternatives To MVC](https://blog.ircmaxell.com/2014/11/alternatives-to-mvc.html)
2018 – Paul M. Jones – [Model View Controller and “Model 2”](https://github.com/pmjones/adr/blob/master/MVC-MODEL-2.md)
2018 – Paul M. Jones – [Comparing “Model 2” MVC to ADR](https://github.com/pmjones/adr/blob/master/ADR.md)
2018 – Paul M. Jones – [Tradeoffs in ADR](https://github.com/pmjones/adr/blob/master/TRADEOFFS.md)
2018 – Paul M. Jones – [Objections to ADR](https://github.com/pmjones/adr/blob/master/OBJECTIONS.md)

[原文](https://herbertograca.com/2018/09/03/action-domain-responder/)作者为**Herberto Graça**，本译文作者为**覃宇**，分享需遵循[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)许可。
