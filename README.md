分散桌面
安装
这些包都没有签名。确保你只从这个GitHub和NOWHERE ELSE下载Scatter Desktop 。

点击这里并获取最新发布
在开发模式下运行
这与node v9.8.0和electron v1.8.2

克隆回购
运行yarn install以安装依赖项。重要提示：您现在只能使用纱线安装，因为有两个版本的eosjs被拉入并且只有纱线支持锯齿。
运行npm start以使用热重新启动本地服务器
运行electron .或./node_modules/bin/electron .从目录中启动电子。
建造
npm run build
npm run release-mac或者（npm run release-windows或者npm run release-linux你必须从目标机器构建）
为Scatter创建应用程序
查看文档
