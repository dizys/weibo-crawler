import * as Path from 'path';

import * as FastCSV from 'fast-csv';
import * as FSE from 'fs-extra';
import ProgressBar from 'progress';
import Axios from 'axios';

import {search, WeiboItem} from './crawler';

main().catch(console.error);

async function main() {
  let keywords = '海啸';
  let category = keywords;
  let startTime = 20190701;
  let endTime = 20190730;
  let startPage = 1;
  let endPage = 100;

  let page = endPage - startPage + 1;
  let progressBar = new ProgressBar('crawling [:bar] :rate/s :percent :etas', {
    total: page,
  });
  // get cookie at https://passport.weibo.cn/signin/login
  let cookies = [
    'SUB=_2A25zBkXRDeRhGeBJ6VMX9SvPzTqIHXVQCWuZrDV6PUJbktAfLVTHkW1NRkOwAG8zLQUJ2cAfA0EJJkOmXtj2_fjq; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WFvT1B6.oueW0m-pWW35NCd5JpX5KzhUgL.FoqNeo2cSK-0Soq2dJLoIp7LxKML1KBLBKnLxKqL1hnLBoMcS0zpSo-fe0qc; SUHB=0QSpeY3N6iya0F; SSOLoginState=1577203073; _T_WM=22979219601; WEIBOCN_FROM=1110006030; MLOGIN=1; M_WEIBOCN_PARAMS=uicode%3D20000174',
    '_T_WM=cbf6804c0a98ed517282210b464a8eee; SUB=_2A25zAASnDeRhGeBI71UY8yvMwjWIHXVQCqzvrDV6PUJbkdANLXPXkW1NRnkBV03YBz3oX43zg3dlUMNgPPpzZP8X; SUHB=0WGMd_nJqWLcwS; SCF=AhuKLDRDvbxe-I1d0tqDtOWxXTgxKTNd5k_CMPgjOorZ-dWLW1mPa9e8KjKIdyaKvRt9e2XjVJV3CnNN3sMYKHg.; SSOLoginState=1577350391',
    '_T_WM=fb8a2ebef9e2c7f46eeceb95175988c5; SUB=_2A25zAAUADeRhGeBI71UY8yvOzDyIHXVQCqtIrDV6PUJbkdANLVSskW1NRnkBLJjC11lO51PbwjDw08ZY6jyCGcgu; SUHB=0QSpeibfL_P_n1; SCF=AuJX1AufSnb5fYCyOIZN-gPZTxxMoRiTDkV6Sl1SntJHJU6YBcj7rbZUrFyShGafp1tXgQFwA8gUwXk-9lw-pl0.; SSOLoginState=1577350480',
    '_T_WM=398dbd599c604e1920b11cca1e378645; SUB=_2A25zAAXPDeRhGeBI41cV8yfPwzSIHXVQCquHrDV6PUJbkdANLRjmkW1NRnkBHGOBjdKMQt3f93otUYa0Dyln0Sw2; SUHB=0BL4yEYXWR0J07; SCF=AgpwK4ENiR8sqm8ClIOvSYQY24yJs7jmOe-KYeg3C0HqNXJUu0sd77o1QWgN-0ihbYLVSeWWYEss9c2U3sn1IYo.; SSOLoginState=1577350559',
    '_T_WM=6f96f896af378fd10443b8a4342e3b52; SUB=_2A25zAAWLDeRhGeBI71UW8CnFzD6IHXVQCqvDrDV6PUJbkdANLVT5kW1NRnkBFp4YlRvJ1Z-ounbXzep5MYX0yc7k; SUHB=0cS3uxxGSt9pOU; SCF=AqSet-wZ1biQUUvy4l_2IrZeIF8sQolxuk3MxIpi2g0hB1eU_-KN49VQ6SZcVuP6XY4n-tD-vYcZDiZV1PGUsuY.; SSOLoginState=1577350619',
    'SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WFvT1B6.oueW0m-pWW35NCd5JpX5KzhUgL.FoqNeo2cSK-0Soq2dJLoIp7LxKML1KBLBKnLxKqL1hnLBoMcS0zpSo-fe0qc; _T_WM=22979219601; SUB=_2A25zAAMwDeRhGeBI71UY8yvMwjWIHXVQCq14rDV6PUJbkdANLXHVkW1NRnkBVxxzux2hsPWXm_Mktd0ZqqP3K4Pm; SUHB=0P1cVbqI6RZCO2; SCF=AhuKLDRDvbxe-I1d0tqDtOWxXTgxKTNd5k_CMPgjOorZ7Gsr3i1jpIMJPVkygI2ZB_Cdw9wrNB8mJJ_yXjXT8bQ.; SSOLoginState=1577349984; MLOGIN=1; M_WEIBOCN_PARAMS=luicode%3D20000174',
  ];

  await search(
    {
      cookies,
      keywords,
      startTime,
      endTime,
      pageRange: [startPage, endPage],
    },
    async (items: WeiboItem[]) => {
      let csvText = await FastCSV.writeToString(items, {headers: false});
      await FSE.appendFile(
        Path.join(
          'outputs',
          category,
          `${startTime}-${startPage}_${endPage}.csv`,
        ),
        csvText + '\n',
      );
      progressBar.tick();
    },
  );
  // let response = await Axios.get('http://2000019.ip138.com/', {
  //   proxy: {
  //     host: '114.101.253.45',
  //     port: 43819,
  //   },
  // });
  // console.log(response.data);
}
