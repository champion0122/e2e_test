# e2e_test

用于OnPay用户端的e2e测试，目前覆盖登录、数字货币兑换、提现、数字货币提现以及付款功能。

```shell 
  yarn test [reg]
  // reg通过正则来匹配文件名进行测试，如不加该参数则运行所有测试用例
```

测试账号可在src/config/config.ts中配置
