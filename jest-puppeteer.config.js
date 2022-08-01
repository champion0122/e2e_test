//jest-puppeteer.config.js
module.exports = {
  launch: {
      headless: false, //设定运行模式，false的情况下将会工作在有GUI界面的模式，true则不开启GUI界面
      executablePath: //设定本地Chrome路径，官方推荐使用Chrome Canary
         "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      defaultViewport: { width: 1500, height: 700 }, // 默认窗口的大小
      // devtools: true,
      slowMo: 10, //慢速模式，每次操作的延迟时间
  },
  
};