import { Page } from 'puppeteer';
import { loginFunc } from './utils/login';

// todo: 配置文件的使用
let loginTestData: LoginTestDataUnit[] = [
  {
    account: 'faqob@dropjar.com',
    pwd: 'Xyc980830',
    expectResult: '🎉 🎉 🎉 登录成功！',
    type: 0
  },
  {
    account: 'faqob@dropjar.com',
    pwd: 'Xyc980831',
    expectResult: '账号或密码错误',
    type: 1
  },
  {
    account: 'sawuhuw@givmail.com',
    pwd: '1123456',
    expectResult: '账号或密码错误',
    type: 1
  },
  {
    account: 'sawuhuw@givmail.com',
    pwd: '2123456',
    expectResult: '账号或密码错误',
    type: 1
  },
  {
    account: 'sawuhuw@givmail.com',
    pwd: '123456',
    expectResult: '🎉 🎉 🎉 登录成功！',
    type: 0
  }];

type LoginTestDataUnit = {
  account: string,
  pwd: string,
  expectResult: string,
  type: 0 | 1
}

beforeEach(async () => {
  await page.goto('http://localhost:8001/user/login');
});

describe.each(loginTestData)('$account测试登录', (item: LoginTestDataUnit) => {
  const { account, pwd, expectResult, type } = item;
  const text = type === 0 ? '账密正确' : '账密错误';
  test(text, async () => {
    let toastText;
    await loginFunc(page, account, pwd);
    await page.waitForResponse(response => response.url().includes('/receipt/login/login') && response.status() === 200);
    // const jsonRes = (await response.json()) as JsonResponse;
    if (type === 0)
      await page.waitForNavigation();
    toastText = await page.$eval('div > .ant-message > div > .ant-message-notice > .ant-message-notice-content > div > span:nth-child(2)', el => (el as HTMLElement).innerText);
    // 账密正确与错误的登录结果不一样
    await expect(toastText).toMatch(expectResult);
  }, 10000);
})

describe('Onpay Login And Logout', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:8001/user/login');
  });

  it('should be titled "OnPay"', async () => {
    await expect(page.title()).resolves.toMatch('OnPay');
  });

  it('正确退出', async () => {
    await loginFunc(page,'faqob@dropjar.com', 'Xyc980830');
    await page.waitForSelector('span.ant-dropdown-trigger');
    await page.hover('span.ant-dropdown-trigger');
    await page.waitForSelector('span.ant-dropdown-menu-title-content > span.anticon-logout');
    await page.$eval('span.ant-dropdown-menu-title-content > span.anticon-logout', el => {
      (el as HTMLElement).click();
    });
    await page.waitForNavigation();
    const pathName = await page.evaluate(() => {
      return window.location.pathname;
    });
    expect(pathName).toMatch('/user/login');
    await page.waitForTimeout(2000);
  })
});