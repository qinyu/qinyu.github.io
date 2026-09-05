---
title: Resource-Method-Representation（译）
description: 软件架构编年史（7）Resource-Method-Representation
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

原文：<https://herbertograca.com/2018/08/31/resource-method-representation/>

*这篇文章是[软件架构编年史](https://herbertograca.com/2017/07/03/the-software-architecture-chronicles/)([译]({{< ref "post/architecture-chronicles/chronicles" >}}))的一部分，这部编年史由[一系列关于软件架构的文章](https://herbertograca.com/category/development/series/software-architecture/)组成。在这一系列文章中，我将写下我对软件架构的学习和思考，以及我是如何运用这些知识的。如果你阅读了这个系列中之前的文章，本篇文章的内容将更有意义。*

MVC 诞生于 1979 年，它诞生于使用 CLI 用户界面的桌面应用上下文中，它暗示如果用户外部因素导致数据库变化，那么 UI 就应该自动地变化。同样的模式也可以完美地应用在稍后出现的 GUI 桌面应用上。

然而，它却和 Web 应用一直在磨合中，因为大多数 Web 应用不会用 UI 变化来作为服务端发生的变化的后果，它们总是从 UI 发起对服务端的调用来更新界面。

前面我已经介绍过 [MVC 及其变种](https://herbertograca.com/2017/08/17/mvc-and-its-variants/)([译]({{< ref "post/architecture-chronicles/mvc-and-variants" >}}))，而这篇文章将介绍另一个变种：***Resource-Method-Representation***。

我觉得需要介绍一下这种模式，并不是因为在我的实践中发现它是一种关键模式，而是因为它和 我后面另外要介绍的 ADR 模式常常被混为一谈。

# 2008 – Resource-Method-Representation

**RMR** 由 Paul James 于 2008 年提出，它将 MVC 模式应用到了 REST API 上下文之中。

## Resource

它的思想是将实体建模成 REST 资源（Resource，模式名称中的第一个 R），它只有和 HTTP 方法对应的公有方法：

```
<?php
// taken from http://www.peej.co.uk/articles/rmr-architecture.html
class Resource {
    private resourceData = [];
    method constructor(request, dataSource) {
        // load data from data source
    }
    method get(request) {
        return new Response(200, getRepresentation(request.url, resourceData));
    }
    method put(request) {
        return new Response(405);
    }
    method post(request) {
        return new Response(405);
    }
    method delete(request) {
        return new Response(405);
    }
}
```

Resource.php

## Method

当向 API 发出一个请求时，它被路由给这些业务对象（即资源）中的一个，然后对应这个请求 HTTP 方法的资源中的一个方法（Method）被调用。该业务对象方法接下来将负责返回一个包含状态码和标头的完整*HTTP*响应。

## Representation

以 API 或发起请求的客户端选择的格式表示的资源就是展现（Representation），这些格式有，JSON、XML 等等....展现就是由方法创建并返回给客户端的响应的内容，如果有任何需要返回的内容的话。

## 我对这种模式的看法

MVC 模式是一种展现模式，以一种将模型、领域与用户界面分离的方法。这曾经是 MVC 的主要目标，现在依然是。

而 RMR 模式超越了这个范畴。它告诉我们如何设计我们的业务对象和领域对象。不仅如此，它还告诉我们领域实体应该体现传达机制：HTTP 方法。

这就意味着它不只是展现模式，而是架构模式，因为它要影响应用的所有层次。它还意味着以这种模式构建的应用并非以领域为中心，而是以 HTTP 为中心。我们的实体最终拥有的是反映传达机制而非领域操作的方法。

我认为用这种模式构建小规模的 API 是可行的，但是我不认为它可以用在企业级应用中，因为我相信企业级应用需要领域驱动设计方法，以及与之相符的以领域为中心的软件开发策略。

还有，我完全同意 Anthony Ferrara 所说的：

> 更不用说它将自己与 HTTP 紧密地耦合在一起，以至于很难将其映射到 CLI 或 GUI 界面。
>
> Anthony Ferrara 2014, [Alternatives To MVC](https://blog.ircmaxell.com/2014/11/alternatives-to-mvc.html#RMR-Resource-Method-Representation)

# 引用来源

2008 – Paul James – [Introducing the RMR Web Architecture](http://www.peej.co.uk/articles/rmr-architecture.html)
2014 – Anthony Ferrara – [Alternatives To MVC](https://blog.ircmaxell.com/2014/11/alternatives-to-mvc.html)

[原文](https://herbertograca.com/2018/08/31/resource-method-representation/)作者为**Herberto Graça**，本译文作者为**覃宇**，分享需遵循[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)许可。
