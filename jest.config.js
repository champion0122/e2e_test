//jest.config.js
// const config = require('config');
// const _ = require('lodash');

module.exports = {
    preset: 'jest-puppeteer', //调用preset
    // globals: _.assign({}, config.get('e2e.variable'), { //这里可以注入全局变量
    //     ENV_URL: config.get('baseUrl')
    // }),
    // testMatch: ['**/__e2e__/**/*.test.js?(x)'] //指定需要进行测试的文件
    testTimeout: 30000, //设置测试超时时间
    reporters: [
        "default",
        ["./node_modules/jest-html-reporter", {
            "pageTitle": "Test Report",
            "includeFailureMsg": true,
            "includeSuiteFailure": true
        }]
    ]
};