import {searchOnePage} from './crawler/weibo';

main().catch(console.error);

async function main() {
  // get cookie at https://passport.weibo.cn/signin/login
  let cookie =
    'SUB=_2A25zBkXRDeRhGeBJ6VMX9SvPzTqIHXVQCWuZrDV6PUJbktAfLVTHkW1NRkOwAG8zLQUJ2cAfA0EJJkOmXtj2_fjq; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WFvT1B6.oueW0m-pWW35NCd5JpX5KzhUgL.FoqNeo2cSK-0Soq2dJLoIp7LxKML1KBLBKnLxKqL1hnLBoMcS0zpSo-fe0qc; SUHB=0QSpeY3N6iya0F; SSOLoginState=1577203073; _T_WM=22979219601; WEIBOCN_FROM=1110006030; MLOGIN=1; M_WEIBOCN_PARAMS=uicode%3D20000174';

  let items = await searchOnePage({
    cookie,
    keywords: '绵阳 地震',
    startTime: 20180101,
    endTime: 20180202,
    page: 1,
  });

  console.log(items);
}
