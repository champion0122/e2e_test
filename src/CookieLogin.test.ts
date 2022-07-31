// const {loginFunc} = require('./utils/login');
import {loginFunc} from './utils/login';

describe('cookie Login', () => {
  it('should login to UserHome', async () => {
    await page.goto('http://localhost:8001');
    await page.waitForNavigation();
    await loginFunc(page);
    await page.waitForTimeout(2000);
    const pathName = await page.evaluate(() => {
      return window.location.pathname;
    });
    expect(pathName).toMatch('/UserHome');
  }) 
}) 