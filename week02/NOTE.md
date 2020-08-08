学习笔记

### toy-broswer是如何工作的
1. 对URL发送HTTP请求，取得HTML内容
2. HTML文本进行分析，创建初始的DOM树
3. DOM树结合CSS Computing，计算出每个树节点的样式
4. 得到带样式的DOM，进行layout步骤
5. css算出盒模型，得出dom的位置
6. 运行render渲染，得出bitmap输出图象


### 状态机

有限状态机
- 每一个状态都是一个机器，每个机器互相解耦
  - 在每一个机器里，我们可以做计算、存储、输出......
  - 所有的这些机器接受的输入是一致的
  - 状态机的每一个机器本身没有状态，如果我们用函数来表示的话，它应
该是纯函数(无副作用)
- 每一个机器知道下一个状态
  - 每个机器都有确定的下一个状态(Moore)
  - 每个机器根据输入决定下一个状态(Mealy)

使用状态机处理文本：

初始状态机，通过输入进入不同状态，在状态机里的循环处理的技巧叫reconsume

### HTTP
HTTP协议处于ISO-OSI模型的会话,表示,应用层。基于TCP/IP协议

HTTP1.1不是全双工协议，是由客户发起request，服务器收到后返回response的流程

HTTP1.1 RFC标准：https://tools.ietf.org/html/rfc2616

HTTP概述：https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Overview

##### Request报文
`HTTP method` `资源路径` `HTTP协议版本号`

`<CR><LF>`

`header: value`形式的header若干个`<CR><LF>`

`<CR><LF>`

body部分

##### Response报文
`HTTP协议版本号` `状态码` `状态信息`

`<CR><LF>`

`header: value`形式的header若干个`<CR><LF>`

`<CR><LF>`

body部分

**分块传输编码（Chunked transfer encoding）** 是超文本传输协议（HTTP）中的一种数据传输机制，允许HTTP由网页伺服器发送给客户端应用（ 通常是网页浏览器）的数据可以分成多个部分。分块传输编码只在HTTP协议1.1版本（HTTP/1.1）中提供。 https://zh.wikipedia.org/zh-hans/%E5%88%86%E5%9D%97%E4%BC%A0%E8%BE%93%E7%BC%96%E7%A0%81
