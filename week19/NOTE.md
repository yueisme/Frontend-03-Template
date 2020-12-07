学习笔记


### 使用 nodejs 建立 http server

使用express和node自带的http库创建http服务器。

分别创建三个程序：
- web server 提供静态文件服务
- publish server 身份验证和更新web server的文件
- publish tool 提供发布上传功能

### nodejs的流（Stream）

nodejs的流分成5类：
- 可读流（例如`fs.ReadStream`, ）
- 可写流（例如`fs.WriteStream`, `http.ServerResponse`）
- 双重流（可以读也可以写，例如`net.Socket`）
- 转换流

> https://segmentfault.com/a/1190000012660403
>
> https://nodejs.org/dist/latest-v14.x/docs/api/stream.html

### 压缩和解压缩

使用[archiver](https://www.npmjs.com/package/archiver)创建压缩包的流：

```javascript
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});
archive.directory('subdir/', false);
archive.finalize();
archive.pipe(writeable_stream);
```
使用[unzipper](https://www.npmjs.com/package/unzipper)创建解压文件的流：

```javascript
let unzipStream = unzipper.Extract({path: path.join(__dirname, '../server/public/')});

await new Promise((resolve, reject) => {
  // `ctx.req`     is Node's request object.
  // `ctx.request` is Koa Request object.
  ctx.req.pipe(unzipStream);
  unzipStream.on('finish', resolve);
  unzipStream.on('error', reject);
});
```

### GitHub OAuth

> https://docs.github.com/cn/free-pro-team@latest/developers/apps/identifying-and-authorizing-users-for-github-apps
