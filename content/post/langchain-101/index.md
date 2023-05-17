---
title: LangChain小试
description: 用 LangChain 做文章总结 
date: 2023-05-17
tags:
  - LangChain
  - AI 
  - 效率 
author: 覃宇 
draft: false
---

_太长不读版总结（by AI）：_
> _本文介绍了使用 AI 技术，如 ChatGPT、MapReduce 和 LangChain，来快速生成文章总结的方法。LangChain 是一种可以高效集成大语言模型和各种服务，拓展 AI 能力的工具，可以快速封装成 APP 或 API，并且可以私有部署，以保证数据安全。程序员需要理解业务问题，分析问题，拆分工序，才能保住饭碗。_  

<!--more--> 

# 引子

有朋友发现上一篇 Wardley Maps 译文（[迈出第一步]({{< ref "../wardley-maps/ch6" >}})）缺少了 Notion AI 做的总结。

{{< figure src="no_notion_ai.jpeg" class="small" >}}

我使用的免费版 Notion 一共提供了20次使用 Notion AI 的机会（实在是不够）。用完之后，我还是觉得 Notion AI 提供的 Summarize 功能离我的期望还有一些差距。Notion AI 总结的文字最后我还是要进行调整。Notion AI 背后使用的是 OpenAI 的生成式 AI，通过提示词交互。提示词写得好不好，对 AI 生成结果的影响非常明显。如果总结功能的提示词能够调整，生成的结果应该更接近我的期望。但 Notion AI 的 Summarize 功能一个黑盒子，我不知道这个功能的提示词，更没有办法去调整了。我想要的是一个可以调整的总结功能，而不是一个黑盒子。

> 这里先介绍一下我在翻译 Wardley Maps 时使用的 AI ~~工具~~副驾吧。首先我会用到 Chrome 插件 Immersive Translate 对原文进行整体翻译，通读译文了解整篇文章的大致内容（还是中文看得更快）。在编辑译文时，每一个段落我都先会用 Bob 翻译（主要是懒得查词、打字）。这里我会同时使用 OpenAI 和有道翻译插件，对比两者翻译结果，选择当中更好的作为译文基础。接下来就要自己进行修改了，比如消除翻译腔，把文字表述改得更加口语化。最后才是用 Notion AI 做总结。

既然我想自己调整总结的提示词，那就别用 Notion AI 和其他类似的总结工具了，自己做一个吧（哪个程序员不喜欢造轮子呢）。

# 如何用 AI 总结一篇长文

做内容总结使用 ChatGPT 最直截了当。只要用一段类似下面这样的**提示词**向 ChatGPT **提问**，过一会儿 AI 就会**回答**。

```
请把下面这段内容用120字简短总结一下：

***
我经常讲到在巴塞罗那艺术酒店碰到的那位聪明的高管。提前透露一个小秘密：我不是唯一假装自己能做高管的人，他也一无所知。但是，这一点是我画了六年地图之后才有人告诉我。我觉得一定有秘诀，而绘制地图不过是效仿别人的笨办法。但事实上大多数行业的做法都是在没有理解形势的情况下直接下场。这就像将军没有地图就投入战斗一样。把命运交给运气和个人英雄主义吧。

...(__这里省去了一万字__)我们将再次展开战略周期循环，看看地图是如何逐步形式化起来的。
***
```

但是 ChatGPT 一次**问答**中能够包含的文字数量有限（准确的说法是 Token 数量有限）。大段的文字会让 ChatGPT 直接罢工。Wardley Maps 每一章动辄上万字的篇幅肯定超过了问答的 Token 数量上限（谢谢作者的~~碎碎念~~详细阐述）。如果不能把内容完整地告知 ChatGPT，生成的总结一定会有遗漏，怎么办呢？

这个问题难不难程序员来说并不难，分而治之呗。既然一次问答的 Token 数量有限，我就把 Wardley Maps 的每一章**分**成几个小段，分别用 ChatGPT 生成总结。最后再把这些小段的总结**合**起来（或者再次进行总结）就可以得到整篇文章的总结了。你瞧，我们完成了一次经典的 **Map（分）Reduce（合）** 算法。

> MapReduce是一种让计算机协同处理大型任务的编程方式。这就像是有一个团队的员工，每个人都负责完成一小部分工作，最终将工作集合起来以更快完成任务。这种方法通常用于分析大量数据或创建复杂的计算机程序。MapReduce通过将这些任务分解为较小的部分，让不同的计算机协同处理，从而使这些任务更快捷、更高效。--来自AI对维基百科的总结。

一个懒惰的程序员一定不会**一次次**地把小段的文字粘贴到 ChatGPT 里再把答案复制出来。这是典型的重复劳动，应该用程序/工具/代码来解决，比如 LangChain。

# LangChain 登场

LangChain 是啥？先让 AI 来回答一下。

> LangChain 是一个软件开发框架，旨在简化使用大型语言模型（LLM）创建应用程序的过程。作为一种语言模型集成框架，LangChain 的用例类似于语言模型，包括**文档分析和摘要**、聊天机器人和代码分析。由 Harrison Chase 开发，LangChain 预计将于 2022 年 10 月发布，使用 Python 和 JavaScript 编写，采用 MIT 许可证。--来自AI对维基百科的总结。

我用程序员更习惯的语言来解释一下LangChain能干什么：

1. LangChain 是一个集成大语言模型（名字中的 Lang）以及其它服务的框架。比如读取各种离线和在线的内容，包括文本、视频等等，这些内容可以变成和 AI 交互的语料。
2. LangChain可以调用各种 AI 大语言模型的 API（包括 OpenAI 在内），通过代码访问 AI 的能力而不是和 ChatGPT 在浏览器里进行文本交互。 
3. Python 和 JavaScript 编写的程序都可以使用 LangChain 的能力（目前 Python 的生态和功能更加丰富一些，推荐使用 Python）。
4. LangChain 封装了不少和 AI 交互的模式，例如管理提示词的 PromptTemplate，又比如和语言模型进行多轮交互的 Chain（名字的另一半）。我们前面 MapReduce 的例子即可以看做是一组 Chain。MapReduce 这种算法 LangChain 都帮我们做好了。
5. ...

以上这些能力足够我们实现文章总结功能了。当然 LangChain 还有其他更复杂更高阶的功能，比如管理多次交互的上下文，将信息内容变成向量存储方便语义化搜索等等。有兴趣的读者可以查看[LangChain 的文档](https://langchain.readthedocs.io/en/latest/)。

# Show me the Code

> 想要自己动手的读者请先参考 LangChain Python 的 [Quickstart Guide](https://python.langchain.com/en/latest/getting_started/getting_started.html)准备环境（下面代码示例使用的是 python）。
> 另外还需要准备好 OpenAI 的 API Key（可以在[这里](https://platform.openai.com/)申请），并设置为环境变量（参考上面 Quickstart Guide）。

我们的算法前面已经讲了，如果要用 LangChain 实现，需要：
1. 加载文章内容（这里我们直接使用`WebBaseLoader`加载博客网页内容）。
2. 把文章内容分成小段（这里我们使用`RecursiveCharacterTextSplitter`）。
3. 初始化的提示词（每一小段的文字内容是不一样的，这里我们用`PromptTemplate`处理变化的内容）
4. 初始化大语言模型（这里我们使用`OpenAI`）
5. 用 Chain 实现 MapReduce 算法：先总结每一小段，再合并总结（这里我们使用现成的`load_summarize_chain`）

上代码吧。

```python
from typing import List, Any
from langchain.docstore.document import Document
from langchain.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.summarize import load_summarize_chain
from langchain import OpenAI
from langchain.prompts import PromptTemplate


class HugoPostLoader(WebBaseLoader):
    """针对 Hugo 博客的文章加载器（非常简单的爬虫技巧，和AI关系不大）"""
    pass

prompt_template = """
Write a summary of the following:
{text}
SUMMARY IN"""

def _get_blog_documents(blog_url):
    """加载博客文章并拆分成多段"""
    # RecursiveCharacterTextSplitter默认按照行、空白字符递归拆分
    # 拆分成的每一段的长度不超过1500个字符（不会超过 OpenAI 的 token limit）
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1500)
    return HugoPostLoader(blog_url).load_and_split(text_splitter)


def _get_map_prompt(prompt_template, lang="Chinese"):
    """初始化提示词，text会被换成每一小段的文字内容"""
    return PromptTemplate(template=prompt_template+f" {lang}:",
                          input_variables=["text"])


def summarize_blog(url, lang):
    """总结博客文章，url是博客的网址，lang是语言"""
    map_prompt = _get_map_prompt(prompt_template, lang)
    # OpenAI 的 temperature 参数控制生成的文本的多样性
    llm = OpenAI(temperature=0)
    # load_summarize_chain 会自动初始化 Chain，采用 MapReduce 算法
    chain = load_summarize_chain(
        llm, chain_type="map_reduce", map_prompt=map_prompt)
    data = _get_blog_documents(url)
    return chain.run(data)
```

代码不长，很容易理解。来看看效果吧。

执行：

```python
url = "https://www.qinyu.info/post/wardley-maps/ch6/"
lang = "Chinese"
print(summarize_blog(url, lang))
```

输出：

```
本文探讨了在组织内部落地Wardley Map的思路，技巧、术语和符号，以及反模式，以帮助检查组织势态感知能力。作者还推荐了一些书籍，介绍通用的战略概念。本文还提供了一套通用的符号，用于绘制地图，以及防止业务部门破坏流程的反模式组织。
```

这段代码基本完成了我们想要的功能，但还有一些小问题：
1. 如果拆分的段落语义更好，总结的效果会更好。例如中文的段落拆分可以按照标点符号而不是空白字符拆分。
2. 最后把所有段落的总结汇集成一个总结的提示词还可以再优化一下，这样生成的总结会更加连贯。


上面这段代码我还部署到了 Streamlit 上，可以直接在浏览器里使用。没有环境的读者可以直接在[这里](https://web-summarizer-qy.streamlit.app/）尝试效果（如果出错，可能是 OpenAI 的 API 访问次数限制）。

> Streamlit 是一个 Python 库，可以让你在几行代码内构建数据应用。所有的应用都是纯 Python，可以在你的浏览器中实时交互。--来自[Streamlit官网](https://www.streamlit.io/)的解释。（来自 Copilot）

所有代码可以在 github 上找到：https://github.com/qinyu/langchain-playground/tree/main/blog-summarize。


# 被 Copilot 惊艳（xia）到了

> Copilot 是一个基于 OpenAI Codex 的 VS Code 插件，可以帮助你写代码。--来自[官网](https://copilot.github.com/)的解释。（来自 Copilot）

完成上述所有 python 代码的过程中，Copilot 随时都在旁边默默地观察。Copilot 会给出一些代码建议，有时候还会给出完整的代码（见下图，只有蓝框中的代码是我敲的或是用 VS Code 重构的）。就连参数值居然是我期望的逻辑，例如页面的 title和icon。如果我 markdown 的文字内容里写了中文，接下来表单的元素的文字就是中文...。Copilot 帮我完成le 70%的代码！

{{< figure src="copilot-generated-code.jpeg" class="medium" >}}

作为一个两年多没写过 python、第一次接触 Streamlit 声明式 UI 语法的程序员，完成 Streamlit App 的开发和部署只用了差不多半小时（还包括了 Github 提交代码和 Streamlit 的配置时间）。这个效率真的是惊艳（xia）到了我。

整个代码编写调试一共花了半天左右的时间​。

而我在写文章的时候，Copilot 也会跃跃欲试，但效果时好时坏，例如下图这段文字就被放弃了（看来 Copilot 还不太擅长过于开放的上下文）：

{{< figure src="copilot-generated-text.jpeg" class="medium" >}}

# 启发

关于 LangChain:
1. 利用 LangChain 可以非常高效地集成大语言模型和各种服务，拓展现有工具的 AI 能力。
2. LangChain 可以快速封装成 APP 或者 API（使用 Flask 或者 FastAPI），集成到其它工具中降低使用门槛。
3. 为了数据安全，LangChain 还需要可以接入私有部署的大语言模型（例如 https://github.com/imClumsyPanda/langchain-ChatGLM）
3. 为了数据安全，使用 LangChain 包装的 AI 服务可以私有部署，还需要类似 Streamlit 这样可以托管服务的基础设施（类似 Serverless）

最后...

程序员只有能够理解并表述得清楚业务问题、会分析问题、会拆分工序（tasking）的才能保住饭碗。

拥抱变化吧！

本文作者为**覃宇**，分享需遵循[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)许可。
