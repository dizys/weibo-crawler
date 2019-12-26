import PromisePool from 'es6-promise-pool';

import {WeiboItem, searchOnePage} from './weibo';

export interface SearchConfigs {
  keywords: string;
  startTime: number;
  endTime: number;
  cookies: string[];
  pageRange?: number[];
  poolSize?: number;
}

export type SearchCallback = (item: WeiboItem[]) => Promise<void>;

export async function search(configs: SearchConfigs, callback: SearchCallback) {
  let {
    keywords,
    startTime,
    endTime,
    cookies,
    pageRange,
    poolSize = 1,
  } = configs;

  let pageStart = 1;
  let pageEnd = 100;

  if (pageRange && pageRange.length) {
    pageStart = pageRange[0];
    pageEnd = pageRange.length >= 2 ? pageRange[1] : pageStart;
  }

  let page = 0;

  let promiseReducer = () => {
    if (page > pageEnd) {
      return undefined;
    }

    page++;

    return searchOnePageAndCallback(
      {keywords, startTime, endTime, cookies, page},
      callback,
    );
  };

  let pool = new PromisePool(promiseReducer, poolSize);

  await pool.start();
}

interface SearchOnePageAndSaveConfigs {
  keywords: string;
  startTime: number;
  endTime: number;
  page: number;
  cookies: string[];
}

async function searchOnePageAndCallback(
  configs: SearchOnePageAndSaveConfigs,
  callback: SearchCallback,
) {
  let {keywords, startTime, endTime, page, cookies} = configs;

  let cookie = getRandomCookie(cookies);

  let items = await searchOnePage({keywords, startTime, endTime, page, cookie});

  await callback(items);
}

function getRandomCookie(cookies: string[]): string {
  let length = cookies.length;

  return cookies[Math.floor(Math.random() * length)];
}
