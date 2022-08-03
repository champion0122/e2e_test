import {writeFile, readFile} from 'fs/promises'
import { Page } from 'puppeteer';
import { cookieUrl, baseUrl, language, testAccount, testPassword } from '../config/config';

const cookiePath = './src/cookies/cookies.json';

type Cookie = {
  sessionId: string,
  token: string,
  expire: number
}

export const loginByPwd = async (page: Page, account: string, pwd: string) => {
  await page.evaluate(() => {
    localStorage.setItem('umi_locale',language);
  });
  const loginBtnSelector = '.ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-btn';
  const accountInputEle = await page.$('#basic_account');
  const pwdInputEle = await page.$('#basic_password');
  await accountInputEle?.type(account, { delay: 20 });
  await pwdInputEle?.type(pwd, { delay: 20 });

  await page.waitForSelector(loginBtnSelector)
  await page.waitForTimeout(500)
  await page.click(loginBtnSelector)
}

const getCookies = async() => {
  try{
    const cookies = await readFile(cookiePath, 'utf8');
    return JSON.parse(cookies);
  }catch(e) {
    // console.error(e);
    return {};
  }
}

const setCookies = async(page: Page,cookies: Cookie) => {
  const { sessionId, token, expire } = cookies;
  if (sessionId && token && expire > Date.now()){
    await page.setCookie({
      name: 'JSESSIONID',
      value: sessionId,
      url: cookieUrl,
      path: '/receipt',
      // httpOnly: true,
    },
      {
        name: 'token',
        value: token,
        url: cookieUrl,
        path: '/receipt'
    });
    await page.goto(`${baseUrl}/UserHome`);

    await page.waitForTimeout(1000)
    const pathName = await page.evaluate(() => {
      return window.location.pathname;
    });
    if(pathName === '/UserHome')
      return true;
    else 
      return false;
  }else {
    return false;
  }
    
}

const storeCookies = async(ckJson: Cookie) => {
  // 设置过期时间
  ckJson.expire = Date.now() + 1000 * 60 * 60 * 24;
  await writeFile(cookiePath, JSON.stringify(ckJson));
}

export const loginFunc = async(page: Page) => {
  try{
    // 设置语言
    await page.evaluate(() => {
      localStorage.setItem('umi_locale',language);
    });
    const cookies = await getCookies();
    const isSetCookie = await setCookies(page,cookies);
    if (!isSetCookie){
      await loginByPwd(page, testAccount, testPassword);
      const response = await page.waitForResponse(response => response.url().includes('/receipt/login/login') && response.status() === 200);
      const jsonRes:any = await response.json();
      await storeCookies(jsonRes.obj.result);
      await page.waitForNavigation();
    }
  }catch(e) {
    // console.error(e);
  }
}

