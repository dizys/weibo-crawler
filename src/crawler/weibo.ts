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

    if (content.startsWith('该账号因被投诉违反《微博社区公约》的相关规定')) {
      return;
    }

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

    let timestamp;

    if (matches) {
      timestamp = Date.parse(matches[0]);
    } else {
      matches = /(\d+)月(\d+)日 (\d{2}):(\d{2})/.exec(ctText);

      let date = new Date();

      if (matches) {
        let year = date.getFullYear();
        timestamp = Date.parse(
          `${year}-${matches[1]}-${matches[2]} ${matches[3]}:${matches[4]}`,
        );
      } else {
        matches = /今天 (\d{2}):(\d{2})/.exec(ctText);

        if (matches) {
          let year = date.getFullYear();
          let month = date.getMonth();
          let day = date.getDate();

          timestamp = Date.parse(
            `${year}-${month}-${day} ${matches[1]}:${matches[2]}`,
          );
        } else {
          matches = /(\d+)分钟前/.exec(ctText);

          if (matches) {
            timestamp = Date.now() - parseInt(matches[1]);
          } else {
            console.log('no matches5', ctText);
            return;
          }
        }
      }
    }

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
