import * as QS from 'query-string';
import Axios from 'axios';
import Cheerio from 'cheerio';
import {filterHTMLTags} from './@utils';

export interface WeiboSearchConfigs {
  cookie: string;
  keywords: string;
  startTime?: number;
  endTime?: number;
  page?: number;
}

export interface WeiboItem {
  uid?: number;
  username: string;
  content: string;
  likeCount: number;
  forwardCount: number;
  commentCount: number;
  timestamp: number;
}

export async function searchOnePage(
  configs: WeiboSearchConfigs,
): Promise<WeiboItem[]> {
  let {cookie, keywords, startTime, endTime, page} = configs;

  let quest = QS.stringify({
    hideSearchFrame: undefined,
    keyword: keywords,
    advancedfilter: 1,
    starttime: startTime,
    endtime: endTime,
    sort: 'hot',
  });

  let response = await Axios.post(
    `https://weibo.cn/search/mblog?${quest}`,
    QS.stringify({
      mp: 100,
      page,
    }),
    {
      headers: {
        cookie,
      },
    },
  );

  let html = response.data;

  return extractWeiboItemFromHTML(html);
}

export function extractWeiboItemFromHTML(html: string): WeiboItem[] {
  let result: WeiboItem[] = [];
  let $ = Cheerio.load(html);

  $('.c').each((_, element) => {
    let $element = $(element);

    if (!$element.attr('id')) {
      return;
    }

    let $user = $element.find('a.nk').first();

    let username = $user.text();
    let userLink = $user.attr('href')?.trim();
    userLink = userLink || '';

    let matches = /u\/(\d+)$/.exec(userLink);

    let uid = matches ? parseInt(matches[1]) : undefined;

    let content = $element.find('.ctt').text();
    content = filterHTMLTags(content);

    let $commentCount = $element.find('a.cc');

    let commentCountText = $commentCount
      .last()
      .text()
      .trim();

    matches = /\[(\d+)\]$/.exec(commentCountText);

    if (!matches) {
      console.log('no matches2', commentCountText);
      return;
    }

    let commentCount = parseInt(matches[1]);

    let $forwardCount = $commentCount.prev('a');

    let forwardCountText = $forwardCount.text().trim();

    matches = /\[(\d+)\]$/.exec(forwardCountText);

    if (!matches) {
      console.log('no matches3', forwardCountText);
      return;
    }

    let forwardCount = parseInt(matches[1]);

    let $likeCount = $forwardCount.prev('a');

    let likeCountText = $likeCount.text().trim();

    matches = /\[(\d+)\]$/.exec(likeCountText);

    if (!matches) {
      console.log('no matches4', likeCountText);
      return;
    }

    let likeCount = parseInt(matches[1]);

    let ctText = $element
      .find('.ct')
      .last()
      .text()
      .trim();

    matches = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.exec(ctText);

    if (!matches) {
      console.log('no matches5', ctText);
      return;
    }

    let timestamp = Date.parse(matches[0]);

    let item: WeiboItem = {
      uid,
      username,
      content,
      likeCount,
      forwardCount,
      commentCount,
      timestamp,
    };

    result.push(item);
  });

  return result;
}
