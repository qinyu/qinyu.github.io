---
title: 跟着 LangChain 学 Prompt
description: 跟着 LangChain 学 Prompt 
date: 2023-05-30
tags:
  - LangChain
  - AI 
  - 效率 
author: 覃宇 
draft: false
series:
  - LangChain
---

_太长不读版总结（by Notion AI）：_
> _LangChain 提供了提示语模板、Chain 和 Memory 等构建块，可以方便地实现常见的问答、总结和会话等场景。LangChain 的文档和开发者 Blog 提供了丰富的示例和解释，源码也可以供我们参考。在使用中，我们可以使用 ChatGPT 验证提示语，把回答做成 FakeLLM 用来调试 Chain，同时使用英文可以更节省 Token。_

<!--more-->

没有 OpenAI API key 可用的日子有点煎熬…. 

{{< figure src="exceeded.png" class="small" >}}

不过这也让我有时间整理一下之前的尝试，补一点课，特别是 LangChain。

> *LangChain 是一个软件开发框架，旨在简化使用大型语言模型（LLM）创建应用程序的过程。作为一种语言模型集成框架，LangChain 的用例类似于语言模型，包括文档分析和摘要、聊天机器人和代码分析。由 Harrison Chase 开发，LangChain 预计将于 2022 年 10 月发布，使用 Python 和 JavaScript 编写，采用 MIT 许可证。--来自AI对维基百科的总结。*

先来介绍一下对长文总结例子做的调整（填了一部分 [LangChain 小试]({{< ref "../langchain-101" >}}) 和 [AI 自由经济账中的坑]({{< ref "../cost-of-ai-free-personal" >}})）

1. 修改了拆分长文的分隔符，用句末标点代替了默认的空白字符。这样拆分的段落更符合语义（仍有改进空间）
2. 调整了提示模板，增加了是否需要简洁总结的参数

功能实现不难，具体代码可以在这里查看：[https://github.com/qinyu/langchain-playground/blob/main/streamlit_app.py](https://github.com/qinyu/langchain-playground/blob/main/streamlit_app.py)

接下来进入本文正题。

# 提问的艺术：Prompt（提示语）

和 ChatGPT（或大语言模型，后面简称 **LLM**）交互的的方式就是**我问你答**（**Question and Answering，QA**）。我们给大语言模型提的问题有一个准备的术语，叫做**提示语（Prompt）**。 提问的技巧越高，得到的答案就越有价值，这一点使用过 ChatGPT 的读者一定有感受。

以至于出现了新兴的研究课题：**提示工程（Prompt Engineering）。**

> **提示工程**是一门较新的学科，关注提示词开发和优化，帮助用户将大语言模型（Large Language Model，LLM）用于各场景和研究领域。 掌握了提示工程相关技能将有助于用户更好地了解大型语言模型的能力和局限性。 

接下来，我们从一些使用 ChatGPT 时碰到的常见问题，来看看如何用提示工程解决，还有 LangChain 提供的支持。

# 问题一：幻觉（Hallucination）

大家在使用 ChatGPT 的时候一定见到 AI “一本正经地胡说八道”的表演。我向 ChatGPT 询问《边缘竞争》这本书（1998 年出版，肖纳 L.布朗/凯瑟琳 M.艾森哈特著）时就遇到了这个问题。

{{< figure src="hallucination.png" class="medium" >}}

答案不正确，但有鼻子有眼，特别唬人，还搬出了波特这位战略大师。文字逻辑没有任何问题，但不正确，这就是**幻觉**。

我们可以继续在下一步的**提示语**中纠正它，比如明确告诉它我想问的是哪一本书。

{{< figure src="hallucination-again.png" class="medium" >}}

这次书虽然找对了，但是对于书的内容总结仍然不对。读者可以自行**搜索（Search）**”边缘竞争”关键字（用百度即可），根据搜索结果判断一下上面的内容总结（红框部分）对不对。

## 解决思路

我们可以使用一些最简单的**提示工程**来改进这个问题。

比如一开始就在**提示语**里**指导**（**Instruct**）ChatGPT：“如果不知道，请不要杜撰答案”。这样回答的幻觉就消失了（但答案的价值也不高了，因为这个问题超出了 ChatGPT 的知识范围，这是我们要解决的第二个问题）

{{< figure src="dont-make-up-answer.png" class="medium">}}

**提示语工程**可以提出明确地要求来**指导** AI ，让 AI 生成结果时出现幻觉的几率更低。除此之外，还有一些常见的**提示语**技巧：

1. 定义**角色**（**Role**），有点像过家家：AI 扮演什么角色，提问的人扮演什么角色。
2. 提供**少量样本**（**OneShot** 或者 **FewShot**），给出一个（One）或几个（Few）回答样本让 AI 参考。
3. 提供**思维链**（**Chain of Thought**），不仅给出**样本**，还要在样本里展示回答的具体逻辑（比如数学问题的解法），让 AI 进一步理解解题思路。

讨论这些**提示工程**技巧的文章太多了，读者们可以自行学习：[https://www.promptingguide.ai/zh](https://www.promptingguide.ai/zh) 或者 [https://github.com/prompt-engineering/prompt-patterns](https://github.com/prompt-engineering/prompt-patterns)

当然直接看下面 LangChain 的例子也行（代码不难理解）。

## LangChain 提供的 Prompt 支持

LangChain 对各种**提示工程**的技巧都提供了丰富的支持。我们从简单的开始，逐步深入。

（下面这些代码只有提示语组装的结果，没有提示语调用大语言模型后的返回，有兴趣发的读者可以自行编码调试，或是直接把最后组装的提示语粘贴到 ChatGPT 中尝试，效果大差不差）。

### 提示语模板（Prompt Template）

先来看看最简单的情况，有些**指导**几乎每条提示语都要反复使用，比如“如果不知道不要杜撰答案”、“以中文回答”等等。

我们可以用**模板（Template）**这种简单的设计模式来消除重复。LangChain 就提供了最基本的`PromptTemplate`。

```python
from langchain.prompts import PromptTemplate

# 简单的 fstring 就可以完成 question 的替换
template = """
You are a experienced Tech Lead of a agile team.
I have just joined your team and I am not familiar with agile practices.
Please tell me: {question}
If you don't know the answer, please say "I don't know". Don't make up an answer.
"""

# question 参数被替换成了真正的问题
prompt = PromptTemplate(template=template,
                        input_variables=["question"])
print(prompt.format(question="When to refactor my code?"))
```

我们观察这段代码运行之后的结果，看到了替换完成的提示语：

> You are a experienced Tech Lead of a agile team.  
> I have just joined your team and I am not familiar with agile practices.  
> Please tell me: **When to refactor my code?**  
> If you don't know the answer, please say "I don't know". Don't make up an answer.  

这里我们还隐含地使用了定义**角色**的提示语技巧。

### 定义角色

OpenAI 最近推出了 Chat API，成本降到了原来的十分之一。模型和 ChatGPT 一样是 gpt-3.5-turbo，可以认为 Chat API 和 ChatGPT 的效果一致。

> 也就是说，我们可以先在 ChatGPT 中修改和验证提示语，达到预期后再放到 Chat Model 中执行（两者是同一个模型）。这将大大降低验证调试的成本！

Chat API 最大的变化就是交互从文本**字符串**（**String**）变成了**聊天消息**（**Chat Message**），明确地区分了**角色**。LangChain 也及时提供了 `ChatOpenAI` 还有一系列 `Messasge` 封装。

```python
from langchain.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)

# 给 System （即 AI）角色的指导
# 注意不是 AIMessagePromptTemplate（这是 AI 返回的消息）
system_prompt = SystemMessagePromptTemplate.from_template("\
				You are a experienced Tech Lead of a agile team. \
        If you don't know the answer, just say that you don't know. \
        Don't try to make up an answer.")
# 人要提的问题和要求，这里有模板参数，最后会被替换成真正的问题
human_prompt = HumanMessagePromptTemplate.from_template("\
        I have just joined your team and I am not familiar with agile practices. \
        Please tell me {question}.", 
        input_variables=["question"])
# 和 ChatOpenAI 交互的 ChatMessage，就是一组消息组合。
chat_prompt = ChatPromptTemplate.from_messages([
    system_prompt,
    human_prompt
])

# 最终组合后的提示词
prompt = chat_prompt.format_prompt(question="when to refactor my code")
print(prompt.to_string()) # Message 也可以转换成字符串消息
```

运行这段代码之后，我们得到了最后的**提示语**（增加换行方便阅读）：

> System: You are a experienced Tech Lead of a agile team.   
>         If you don't know the answer, just say that you don't know.   
>         Don't try to make up an answer.  
> Human: I have just joined your team and I am not familiar with agile practices.   
>        Please tell me **when to refactor my code**.  

我们也可以学到 OpenAI/LangChain 设定角色的写法，用到自己的**提示语**里。

### FewShot 样本

我在翻译中经常需要把文章中的术语找出来，总结成一份术语表。原文中的术语有些是英文缩写，有些则是中英文对照。这时我就可以用**少量样本**（让 AI 学习找出术语的方法）和我要找出术语的大段文字组合成一条**提示语**。

```python
from langchain.prompts import PromptTemplate，FewShotPromptTemplate

# 第一个简单样本直接展示了问题和答案，没有思考过程。
# 第二个样本还使用了 Chain of Thoughts 技巧，给出了找术语的过程。
examples = [
    {
        "question": "\"提出的问题越舒服，得到的答案就越有价值，\
这一点使用过 ChatGPT 的读者一定有感受。\"\
这段文字中有哪些术语？",
        "answer": "\"ChatGPT\""
    },
    {
        "question": "\"GPT 提示工程（Prompt Engineering）是一门较新的学科\"\
这段文字中有哪些术语？",
        "answer":
        """这个问题可以如下分析找到答案：
1. 找到这段文字中"（）"中间的英文词组，如"Prompt Engineering"，这个词组就是术语；
2. 找到这段文字中间的英文缩写，如"GPT"，这个缩写就是术语；
3. 术语不包含任何中文字符，"提示工程（Prompt Engineering）"不是术语，"学科"也不是术语。
最终的答案就是："Prompt Engineering"、"GPT"
        """
    }
]

# 把样本组合成提示语一部分的模板 
example_prompt = PromptTemplate(
    input_variables=["question", "answer"],
    template="Question: {question}\n{answer}")

# FewShot 完整的提示语模板
fewshot_prompt = FewShotPromptTemplate(
    example_prompt=example_prompt, # 组合样本
    examples=examples, # 样本
    suffix="Question: \"{input} \"这段文字中有哪些术语？", # 替换真正要找出术语的文本
    input_variables=["input"]
)

# 打印出最终组合出来的提示语
print(fewshot_prompt.format(
    input="比如 OpenAI 2020 年发布的 gpt-3 用了 570GB 文本，\
它能生成的知识就冻结（Frozen）在了发布的 2020 年，2021 年之后发生的事一概不知，\
也只知道这 570GB 文本中的知识")
)
```

最后组合出来的**提示语**如下（前面两问是样本，最后是才是真正的问题）：

> Question: "提出的问题越舒服，得到的答案就越有价值，这一点使用过 ChatGPT 的读者一定有感受。"这段文字中有哪些术语？  
> "ChatGPT"  
>   
> Question: "GPT 提示工程（Prompt Engineering）是一门较新的学科"这段文字中有哪些术语？  
> 这个问题可以如下分析找到答案：  
> 1. 找到这段文字中"（）"中间的英文词组，如"Prompt Engineering"，这个词组就是术语；  
> 2. 找到这段文字中间的英文缩写，如"GPT"，这个缩写就是术语；  
> 3. 术语不包含任何中文字符，"提示工程（Prompt Engineering）"不是术语，"学科"也不是术语。  
> 最终的答案就是："Prompt Engineering"、"GPT"  
>         
>   
> Question: "比如 OpenAI 2020 年发布的 gpt-3 用了 570GB 文本，它能生成的知识就冻结（Frozen）在了发布的 2020 年，2021 年之后发生的事一概不知，也只知道这 570GB 文本中的知识 "这段文字中有哪些术语？  

上面这段提示语在 gpt4（ChatGPT plus）中的效果很好，而 gpt-3.5-turo 似乎没有明白（似乎用英文提示效果会更好）。

{{< figure src="looking-for-terms.png" class="medium">}}

感兴趣的读者可以改一下第二个例子，去掉解决步骤的 Chain of Thought，看看效果有什么不同。

# 问题二：有限的知识

生成式 AI 的背后的大语言模型是用**已知的数据集预训练的**，通俗的讲就是 AI 的知识（数据）是有**时效**（不包括还未发生的事实）且**有边界**（尽管比普通人已经多的多得多得多）。

比如 OpenAI 2020 年发布的 gpt-3 用了 570GB 文本，它能生成的知识就**冻结**（**Frozen**）在了发布的 2020 年，2021 年之后发生的事一概不知，也只知道这 570GB 文本中的知识。

如果问它预训练之后的事实，它会很干脆地回答不知道，但会给出下一步**行动**（**Action**）的建议。

{{< figure src="search-action.png" class="medium">}}

我自己才知道的知识（前面）它也不懂，我可以和它友好地~~争论~~探讨一番（这里我会在**提示语**告诉一些它我知道的知识：“代码太混乱，设计完全不对时应该重写而不是重构”）。

{{< figure src="refactor-conversation.png" class="medium">}}

我们还发现类似 ChatGPT 这种**对话**（**Conversation**）类的应用都有**记忆**（**Memory**）。在我的**指导**下，AI 结合**对话**的**记忆**逐步接近正确答案。也就是说， **提示语**可以**链接**（**Chain**）起来，用上一轮问答的**输出**（**Output**）作为下一轮问答的**输入**（**Input**），同样可以**指导** AI。

## 解决思路

这样追问（补充知识）有点累，如果我一开始就把我自己知道的知识告诉 ChatGPT，再问它同样的问题，它的回答会有变化吗？我们来试一试。

{{< figure src="refactor-docs.png" class="medium">}}

效果比第一次好了很多！

我们来总结一下这次尝试的思路。

我们把 AI 不知道的知识总**填充**（**Stuff**）到**提示语**里，就可以**增强**（**Augment**）AI 的生成能力。AI 相当于“外挂”了一个可信**来源**（**Source**）不同于模型训练数据集的知识库，可以基于这个知识库里的新知识进行**问答**。

> 这并不是**微调**（**Fine-tune**）模型，模型仍然是**冻结的**，模型的参数没有变化。没有耗费计算资源，不需要特别专业的知识，也就不会产生高昂的成本。

## LangChain 提供的 Document 构建块

LangChain 提示语里最后封装的外挂知识数据结构为 `Document`，里面包括了知识内容 `page_content` 字符串和 `metadata` 字典（一般会有一个叫做`'source'`的 key， 其 value 就是这段内容的**来源**）。上面这段关于重构的知识在 LangChain 里可以这样填充到提示语里：

```python
from langchain.chains.question_answering import load_qa_chain
from langchain.docstore.document import Document
from langchain.llms.fake import FakeListLLM

# 把准备好的知识封装成 Document
docs = [
    Document(page_content="重构（名词)：对软件内部结构的一种调整，\
目的是在不改变软件可观察行为的前提下，\
提高其可理解性，降低其修改成本。",
             metadata={"source": "《重构》第一版"}),
    Document(page_content="重构（动词)：使用一系列重构手法，\
在不改变软件可观察行为的前提下，调整共结构。",
             metadata={"source": "《重构》第一版"}),
    Document(page_content="几乎任何情况下我都反对专门拔出时间进行重构。\
重构本来就不是一件应该特别拨出时间做的事情，\
重构应该随时随地进行。你不应该为重构而重构，你之所以重构，\
是因为你想做别的什么事，而重构可以帮助你把那些事做好。",
             metadata={"source": "《重构》第一版"}),
    Document(page_content="Don Roberts给了我一条准则：\
第一次做某件事时只管去做；\
第二次做类似的事会产生反感，但无论如何还是可以去做；\
第三次再做类似的事，你就应该重构。",
             metadata={"source": "《重构》第一版"}),
    Document(page_content="最常见的重构时机就是我想给软件添加新特性的时候。\
此时，重构的直接原因往往是为了帮助我理解需要修改的代码。\
在这里，重构的另一个原动力是：代码的设计无法帮助我经松添加我所需要的特性。\
而在调试过程中运用重构，多半是为了让代码更具可读性。\
我还发现，重构可以帮助我复审别人的代码。\
开始重构前我可以先阅读代码，得到一定程度的理解，并提出一些建议。\
一旦想到一些点子，我就会考感是否可以通过重构立即轻松地实现它们。\
如果可以，我就会动手。\
这样做了几次以后，我可以把代码看得更清楚，提出更多恰当的建议。",
             metadata={"source": "《重构》第一版"}),
    Document(page_content="有时候你根本不应该重构，例如当你应该重新编写所有代码的时候。\
有时候既有代码实在太混乱，重构它还不如重新写一个简单。\
作出这种决定很困难，我承认我也没有什么好准则可以判断何时应该放弃重构。\
另外，如果项目已近最后期限，你也应该避免重构。",
             metadata={"source": "《重构》第一版"}),
]

# 我们用一个 Fake 答案代替
fakellm = FakeListLLM(responses=["!!!This is the final fake answer.!!!"])
# 这里我提前用到了下面要介绍的 Chain 中的一种，这个 Chain 就是把 LLM 包装起来了
stuff_qa = load_qa_chain(fakellm, # 直接返回 Fake 答案
                         chain_type="stuff", # 把文档填充（Stuff）到提示语中
												 verbose=True) # 把 Chain 执行的过程打印出来
# 执行我们的问题
print(stuff_qa.run(input_documents=docs, question="什么时候不能重构？"))
```

我们来看看终端中的执行结果：

> \> Entering new StuffDocumentsChain chain...  
>   
> \> Entering new LLMChain chain...  
> Prompt after formatting:  
> **Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.  
>   
> 重构（名词)：对软件内部结构的一种调整，目的是在不改变软件可观察行为的前提下，提高其可理解性，降低其修改成本。  
>   
> 重构（动词)：使用一系列重构手法，在不改变软件可观察行为的前提下，调整共结构。  
>   
> 几乎任何情况下我都反对专门拔出时间进行重构。重构本来就不是一件应该特别拨出时间做的事情，重构应该随时随地进行。你不应该为重构而重构，你之所以重构，是因为你想做别的什么事，而重构可以帮助你把那些事做好。  
>   
> Don Roberts给了我一条准则：第一次做某件事时只管去做；第二次做类似的事会产生反感，但无论如何还是可以去做；第三次再做类似的事，你就应该重构。  
>   
> 最常见的重构时机就是我想给软件添加新特性的时候。此时，重构的直接原因往往是为了帮助我理解需要修改的代码。在这里，重构的另一个原动力是：代码的设计无法帮助我经松添加我所需要的特性。而在调试过程中运用重构，多半是为了让代码更具可读性。我还发现，重构可以帮助我复审别人的代码。开始重构前我可以先阅读代码，得到一定程度的理解，并提出一些建议。一旦想到一些点子，我就会考感是否可以通过重构立即轻松地实现它们。如果可以，我就会动手。这样做了几次以后，我可以把代码看得更清楚，提出更多恰当的建议。  
>   
> 有时候你根本不应该重构，例如当你应该重新编写所有代码的时候。有时候既有代码实在太混乱，重构它还不如重新写一个简单。作出这种决定很困难，我承认我也没有什么好准则可以判断何时应该放弃重构。另外，如果项目已近最后期限，你也应该避免重构。  
>   
> Question: 什么时候不能重构？  
> Helpful Answer:  
>   
> \> Finished chain.  
>   
> \> Finished chain.  
> !!!This is the final fake answer.!!!  

**黑体加粗**的部分就是这个 Chain 中使用的**提示语**。没错，这个 Chain 里面包装了一个 `PromptTemplate`，把问题和**文档**都包了进去。这段提示语我们可以放在 ChatGPT 里验证一下。

{{< figure src="refactor-docs-answer.png" class="medium">}}

读者同样可以在 ChatGPT 里试试这段**提示语**的效果，看看回答和我们**填充**的**文档**是不是一致。

### LangChain 提供的 Memory 构建块

读者们可能已经猜到了，**会话**历史的**记忆**可以当成一种新鲜的知识，包进**提示语**。

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain.llms.fake import FakeListLLM

# 替代真实大模型的 Fake
fakellm = FakeListLLM(responses=[
    "我们不应该在添加新功能时进行重构。\
其他情况如修补错误、代码太混乱、\
设计完全错误以及 Code Review 时都是\
可以考虑进行重构的好机会。",
    "在添加新功能时重构可能导致项目的进度延误，\
....\
并确保不破坏现有代码的功能。",
    "在某些情况下，代码太混乱和设计错误，重构可能不足以解决问题。\
...\
在决定重构或重写代码时，需要考虑代码的当前状况和实际需求。"
    ]
)

# 对话 Chain，可以一直追问
conversation = ConversationChain(
    llm=fakellm, # 对话中大模型给出 Fake 答案
    verbose=True, # 显示 Chain 内部调用 LLM 的过程，这样我们可以看见提示语
    memory=ConversationBufferMemory() # 在内存中记录所有对话历史
)

# 连续问了三个问题
print(conversation.predict(input="""下面这些情况里，哪些时候我们不应该进行重构：
添加新功能时。
修补错误时。
代码太混乱，设计完全错误时。
Code Review 时。"""))
print(conversation.predict(input="添加新功能时为什么不能重构？"))
print(conversation.predict(input="代码太混乱，设计完全错误时，应该重写而不是重构吧？"))
```

我们来看一下代码执行的结果：

> \> Entering new ConversationChain chain...  
> Prompt after formatting:  
> The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of > specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.  
>   
> Current conversation:    
>   
> Human: 下面这些情况里，哪些时候我们不应该进行重构：  
> 添加新功能时。  
> 修补错误时。  
> 代码太混乱，设计完全错误时。  
> Code Review 时。  
> AI:  
>   
> \> Finished chain.  
> **我们不应该在添加新功能时进行重构。其他情况如修补错误、代码太混乱、设计完全错误以及 Code Review 时都是可以考虑进行重构的好机会。**  
>   
> \> Entering new ConversationChain chain...  
> Prompt after formatting:  
> The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of > specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.  
>   
> Current conversation:  
> Human: 下面这些情况里，哪些时候我们不应该进行重构：  
> 添加新功能时。  
> 修补错误时。  
> 代码太混乱，设计完全错误时。  
> Code Review 时。  
> AI: **我们不应该在添加新功能时进行重构。其他情况如修补错误、代码太混乱、设计完全错误以及 Code Review 时都是可以考虑进行重构的好机会。**  
> Human: 添加新功能时为什么不能重构？  
> AI:  
>   
> \> Finished chain.  
> **在添加新功能时重构可能导致项目的进度延误，....并确保不破坏现有代码的功能。**  
>   
> \> Entering new ConversationChain chain...  
> Prompt after formatting:  
> The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of > specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.  
>   
> Current conversation:  
> Human: 下面这些情况里，哪些时候我们不应该进行重构：  
> 添加新功能时。  
> 修补错误时。  
> 代码太混乱，设计完全错误时。  
> Code Review 时。  
> AI: **我们不应该在添加新功能时进行重构。其他情况如修补错误、代码太混乱、设计完全错误以及 Code Review 时都是可以考虑进行重构的好机会。**  
> Human: 添加新功能时为什么不能重构？  
> AI: **在添加新功能时重构可能导致项目的进度延误，....并确保不破坏现有代码的功能。**  
> Human: 代码太混乱，设计完全错误时，应该重写而不是重构吧？  
> AI:  
>   
> \> Finished chain.  
> 在某些情况下，代码太混乱和设计错误，重构可能不足以解决问题。...在决定重构或重写代码时，需要考虑代码的当前状况和实际需求。  

我们可以看到三条**提示语**（每个问题一条），后面两条**提示语**中都包含了之前对话中的全部问题和回答（用**黑体加粗**了）。

我们也有点关于 Chain 的感觉了：Chain 似乎就是包装好了特定的提示语模板，负责组装提示语和 LLM 进行交互，而且可以反复交互。（现在我们先暂且这样这样认为） 

# LangChain Prompt 小结

首先说明前文中的术语都做了**加粗**或者**英文对照**，也是帮助大家加深印象。​

LangChain 几乎把所有的**提示语**技巧（角色、样本、指导）做了便利的实现，把一些好用的**提示语模板**封装到了 Chain 当中，提供了外挂知识库的基本数据结构（**Document**），提供了方便的数据结构（**Memory**）**记忆对话**历史。

而这一切并不复杂，简单的数据结构封装和字符串模板就能实现上述大部分功能（尽管这只是冰上一角）。简单的结构才漂亮。

同时借助开源社区贡献的力量，LangChain 几乎囊括了常见的 LLM 使用场景（总结、问答、会话等等），也积累了大量经过验证的提示语模板，大大降低了我们开发 AI 应用的复杂度。

Python 语言和生态也让 LangChain 坐上了火箭。

下面的文章中我们还将继续领教 Chain 的威力。

# LangChain 真是宝藏

除了本身的功能，我们还可以从 LangChain 学到许多。

1. LangChain 文档：[https://python.langchain.com/en/latest](https://python.langchain.com/en/latest)。详细的解释了各种概念和构建块，还有丰富的示例。Command + K 还可以语义化搜索。（绝佳的语义化知识管理示范）。
    
    {{< figure src="langchain-search.png" class="medium">}}
    
2. LangChain 开发者的 Blog：[https://blog.langchain.dev/](https://blog.langchain.dev/)。例如这篇 [https://blog.langchain.dev/retrieval/](https://blog.langchain.dev/retrieval/) 详细地解释了 RAG 检索强化生成的使用场景和方法。
    
3. LangChain 源码：[https://github.com/hwchase17/langchain](https://github.com/hwchase17/langchain)。找一找源码中的 [prompt.py](http://prompt.py)，比如下面这条用于数学问题解答 LlmMathChain 的提示语就示范了 Chain of Thought 的用法。
    
    {{< figure src="langchain-prompt.png" class="medium">}}


# 预告

我们看到了 LangChain 的 Prompt 和（部分）Chiain 的能力，可以打开一下思路：

1. **文档**准备起来似乎还很麻烦（要翻书摘抄），有没有更便捷的方法？
2. 复杂问题是不是只有 MapReduce 这种分而治之的方法吗？
3. AI 给了我下一步行动（例如**搜索**）的建议，能不能**自动帮我执行**下一步行动？

另外，我们似乎也摸到了一些使用的技巧

1. 使用 ChatGPT 验证提示语，把回答做成 FakeLLM，用来调试 Chain
2. 提示语模板使用英文更节省 Token

别急，这些内容我将在接下来的系列文章中逐一介绍。

文中所有代码可以在这里找到：[https://gist.github.com/qinyu/1852ba8a167bd9e17e41aec2caf5dced](https://gist.github.com/qinyu/1852ba8a167bd9e17e41aec2caf5dced)

本文作者为**覃宇**，分享需遵循[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)许可。

