const nodeUrl = require('url');
const net     = require('net');

process.on('uncaughtException', function uncaughtExceptionListener(err) {
  console.error(err);
  //quit and disconnect
  process.exit(1);
});

class TrunkedBodyParser {
  constructor() {
    this.WAITING_LENGTH          = 0;
    this.WAITING_LENGTH_LINE_END = 1;
    this.READING_TRUNK           = 2;
    this.WAITING_NEW_LINE        = 3;
    this.WAITING_NEW_LINE_END    = 4;
    this.length                  = 0; //chunk length
    this.chunkLengthCount        = 0;
    this.content                 = []; //body的字符存放区
    this.isFinished              = false;
    this.current                 = this.WAITING_LENGTH;
  }

  receiveChar(char) {
    if (this.current === this.WAITING_LENGTH) {
      if (char === '\r') {
        //chunk描述结束
        if (this.length === 0) {
          // 0表示后续没有新的chunk，body部分结束
          this.isFinished = true;
        }
        this.chunkLengthCount += this.length;
        this.current = this.WAITING_LENGTH_LINE_END;
        console.log('chunk length:', this.length);
      }
      else {
        //解析chunk描述的长度
        this.length *= 16; //为什么要*16，调试发现length每次都是0
        this.length += parseInt(char, 16);
      }
    }
    else if (this.current === this.WAITING_LENGTH_LINE_END) {
      if (char === '\n') {
        this.current = this.READING_TRUNK;
      }
    }
    else if (this.current === this.READING_TRUNK) {
      // 真正的body部分，我加了一个判断是否chunk结束，否则会把报文末尾的CRLF字符错误地加入this.content
      if (this.isFinished === false) {
        this.content.push(char); //chunk的内容
        this.length--;

        // ❌️️这里还有个问题，chunk的内容如果有非BMP字符，这时候chunk length和js的string length是不相等的
        /*
          从服务器使用utf8编码文本进行传输，所以这里的this.length对应的是chunk的utf8编码下的长度
          根据上次string课程的内容：0x80-0x7FF是2字节长度，0x800-0xFFFF是3字节长度，0x10000-0x10FFFF是4字节长度（需要补课JS的编码）
          接下来我们对utf8字符检查，如果char code范围表示这是一个字符的起始部分，我们调整this.length以符合js的长度表示
         */
        let cc = char.charCodeAt(0);
        console.log('char code point:', '0b' + cc.toString(2));
        //2字节编码
        if (cc >= 0x80 && cc <= 0x7FF) {
          this.length >= 1 ? this.length -= 1 : void 0;
        }
        //3字节编码
        else if (cc >= 0x800 && cc <= 0xFFFF) {
          this.length >= 2 ? this.length -= 2 : void 0;
        }
        //4字节编码
        else if (cc >= 0x10000 && cc <= 0x10FFFF) {
          this.length >= 3 ? this.length -= 3 : void 0;
        }
        /*if (cc > 0x7F) {
          this.length > 0 && this.length--;
          if (cc > 0x7FF) {
            this.length > 0 && this.length--;
            if (cc > 0xFFFF) {
              //this.length--
            }
          }
        }*/

        if (this.length === 0) {
          //满足当前chunk的长度，进入下一个chunk
          this.current = this.WAITING_NEW_LINE;
        }
      }
    }
    else if (this.current === this.WAITING_NEW_LINE) {
      if (char === '\r') {
        this.current = this.WAITING_NEW_LINE_END;
      }
    }
    else if (this.current === this.WAITING_NEW_LINE_END) {
      if (char === '\n') {
        //状态机的reconsume
        this.current = this.WAITING_LENGTH;
      }
    }
  }
}

class ResponseParser {
  constructor() {
    this.WAITING_STATUS_LINE      = 0;
    this.WAITING_STATUS_LINE_END  = 1;
    this.WAITING_HEADER_NAME      = 2;
    this.WAITING_HEADER_SPACE     = 3;
    this.WAITING_HEADER_VALUE     = 4;
    this.WAITING_HEADER_LINE_END  = 5;
    this.WAITING_HEADER_BLOCK_END = 6;
    this.WAITING_BODY             = 7;

    this.current     = this.WAITING_STATUS_LINE;
    this.statusLine  = "";
    this.headers     = {};
    this.headerName  = "";
    this.headerValue = "";
    this.bodyParser  = null;
  }

  receive(str) {
    for (let i = 0; i < str.length; i++) {
      this.receiveChar(str.charAt(i));
    }
  }

  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished;
  }

  get response() {
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
    return {
      statusCode: parseInt(RegExp.$1),
      statusText: RegExp.$2,
      headers: this.headers,
      chunkLengthCount: this.bodyParser.chunkLengthCount,
      contentLength: this.bodyParser.content.length,
      body: this.bodyParser.content.join(''),
    }
  }

  //处理HTTP响应，用状态机的方法实现
  receiveChar(char) {
    //根据报文格式，第一行是HTTP状态
    if (this.current === this.WAITING_STATUS_LINE) {
      if (char === '\r') {
        // CRLF表示行结束
        this.current = this.WAITING_STATUS_LINE_END;
      }
      else {
        //暂存到statusLine，逐字拼接
        this.statusLine += char;
      }
    }
    else if (this.current === this.WAITING_STATUS_LINE_END) {
      // \r\n 表示状态行结束，进入到下一个部分
      if (char === '\n') {
        this.current = this.WAITING_HEADER_NAME;
      }
    }
    else if (this.current === this.WAITING_HEADER_NAME) {
      //进入headers部分
      if (char === ':') {
        //header名称结束，进入header value处理
        this.current = this.WAITING_HEADER_SPACE;
      }
      else if (char === '\r') {
        // \r是行首字符，说明headers部分结束
        this.current = this.WAITING_HEADER_BLOCK_END;
        if (this.headers['Transfer-Encoding'] === 'chunked') {
          this.bodyParser = new TrunkedBodyParser();
        }
      }
      else {
        //header名称
        this.headerName += char;
      }
    }
    else if (this.current === this.WAITING_HEADER_SPACE) {
      //'header name:'后的空格
      if (char === ' ') {
        this.current = this.WAITING_HEADER_VALUE;
      }
    }
    else if (this.current === this.WAITING_HEADER_VALUE) {
      if (char === '\r') {
        //一个header处理完成
        this.current                  = this.WAITING_HEADER_LINE_END;
        this.headers[this.headerName] = this.headerValue;
        this.headerName               = '';
        this.headerValue              = '';
      }
      else {
        this.headerValue += char;
      }
    }
    else if (this.current === this.WAITING_HEADER_LINE_END) {
      //一个header处理完成
      if (char === '\n') {
        //状态机的reconsume
        this.current = this.WAITING_HEADER_NAME;
      }
    }
    else if (this.current === this.WAITING_HEADER_BLOCK_END) {
      //headers部分结束，继续处理Body
      if (char === '\n') {
        this.current = this.WAITING_BODY;
      }
    }
    else if (this.current === this.WAITING_BODY) {
      this.bodyParser.receiveChar(char);
    }
  }
}

class HttpRequest {
  defaultConf = {
    method: 'GET',
    url: '',
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Accept': '*',
    }
  }

  constructor(config) {
    this.req      = Object.assign({}, this.defaultConf, config);
    this.req._url = new nodeUrl.URL(this.req.url);
    console.log(this.req._url);
    if (this.req.headers["Content-Type"] === 'application/json') {
      this.req.body = JSON.stringify(this.req.body);
    }
    else if (this.req.headers["Content-Type"] === 'application/x-www-form-urlencoded') {
      this.req.body = Object.keys(this.req.body).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(this.req.body[k])}`).join('&');
    }
    this.req.headers['Content-Length'] = this.req.body.length;
    this.req.headers['Host']           = this.req._url.host;
  }

  send(connection) {
    return new Promise((resolve, reject) => {
      let parser = new ResponseParser();
      if (connection) {
        connection.write(this.toString());
      }
      else {
        connection = net.createConnection({
          host: this.req._url.hostname,
          port: parseInt(this.req._url.port),
        }, () => {
          connection.write(this.toString());
        });
      }
      connection.on('data', data => {
        console.log('chunk raw:', JSON.stringify(data.toString()));
        //console.log(String.raw`${data.toString()}`);
        parser.receive(data.toString());
        if (parser.isFinished) {
          connection.end();
          resolve(parser.response);
        }
      });
      connection.on('error', err => {
        connection.end();
        reject(err);
      });

    });
  }

  toString() {
    return `${this.req.method} ${this.req._url.pathname} HTTP/1.1\r\n${Object.keys(this.req.headers).map(k => `${k}: ${this.req.headers[k]}`).join('\r\n')}\r\n\r\n${this.req.body}`;
  }
}

void async function main() {
  let client   = new HttpRequest({
    method: 'GET',
    url: 'http://127.0.0.1:8080/',
    headers: {
      "X-foo": '123123'
    },
    body: 'hi'
  });
  let response = await client.send();
  console.log(response);

}();