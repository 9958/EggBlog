'use strict';

const Controller = require('egg').Controller;
const marked = require('marked');
const moment = require('moment');

class HomeController extends Controller {
  async index() {
    const { ctx,app } = this
    
    const settings = app.config.settings
    // 获取文章总数
    const count = await app.mysql.count('posts');

    let maxPage = parseInt(count / settings.postNum) + (count % settings.postNum ? 1:0);
    let currentPage = isNaN(parseInt(ctx.params[0])) ? 1 : parseInt(ctx.params[0]);
    if(currentPage == 0) currentPage = 1;

    let nextPage = currentPage;
    let title = settings.name;

    if(currentPage > 1){
      title +=" > 第" + currentPage + "页";
    }

    let start = (currentPage - 1) * settings.postNum;

    if(maxPage < currentPage){
      return;
    }else if(maxPage > currentPage){
      nextPage = parseInt(currentPage) + 1;
    }

    //获取文章列表
    const resultArr = await app.mysql.query('select id,title,content,created,createdAt,clicknum,slug from posts where status=1 order by id desc limit ?,?',[start,settings.postNum]);
    let result = resultArr;
    for(let i = 0; i<result.length; i++){
      result[i].content = marked(result[i].content);
      let time = result[i].created || result[i].createdAt;
      result[i].addtime = moment(new Date(time)).format("YYYY-MM-DD");
      if(result[i].content.indexOf('<!--more-->') > 0){
        result[i].content = result[i].content.substring(0, result[i].content.indexOf('<!--more-->')) + '<div class="ReadMore"><a href="/post/' + result[i].slug + '">[阅读更多]</a></div>';
      }
    }

    //获取云标签
    const tags = await app.mysql.query('select title from tags order by count desc limit 50');

    //获取热门文章
    const hotpost = await app.mysql.query('select id,title,created,createdAt,clicknum,slug from posts where status=1 order by clicknum desc limit 12');

    //获取7天热门文章
    let today = new Date();
    let begin,yearBegin;
    today.setTime(today.getTime()-7*24*3600*1000);
    //begin = today.format('yyyy-MM-dd');
    begin = moment(today).format("YYYY-MM-DD");
    today.setTime(today.getTime()-180*24*3600*1000);
    yearBegin = moment(today).format("YYYY-MM-DD");
    const hotpost_week = await app.mysql.query('select id,title,created,createdAt,clicknum,slug from posts where status=1 and  `updatedAt` > "?" and `created` > "?"  order by clicknum desc limit 12',[begin,yearBegin]);

    let data = {
      site_url: settings.site_url,
      name: settings.name,
      title: settings.title,
      keywords: settings.keywords,
      description: settings.description,
      posts: result,
      crtP: currentPage,
      maxP: maxPage,
      nextP: nextPage,
      hotpost: hotpost,
      hotpost_week: hotpost_week,
      tags: tags,
      user: {}
    };

    ctx.body = await ctx.renderView('front/index.nj', data);
  }

  async archives() {
    const { ctx,app } = this

    const settings = app.config.settings

    let sortNumber = function(a, b){
			return a.year < b.year
    };
    
    let keyword = ctx.query.keyword;
		let searchWhere = {};
		let searchWhereStr = " status = 1 ";
		if(keyword && keyword != ''){
			// 字符串组合
			searchWhereStr +=" and (title like '%"+keyword+"%' or tags like '%"+keyword+"%' )";
    }
    
    //查询总数
    let countArr =  await app.mysql.query('select count(*) as count from posts where ?',[searchWhereStr])
    let count = countArr && countArr[0].count || 0

    let pagesize = ctx.query.size || (settings.postNum * 5);
    let maxPage = parseInt(count / pagesize) + (count % pagesize ? 1:0);
    let currentPage = isNaN(parseInt(ctx.params[0])) ? 1 : parseInt(ctx.params[0]);
    if(currentPage == 0) currentPage = 1;

    let nextPage = currentPage;
    let title = settings.name;

    if(currentPage > 1){
      title +=" > 第" + currentPage + "页";
    }

    let start = (currentPage - 1) * pagesize;
    

    if(maxPage < currentPage){
      maxPage = currentPage;
    }else if(maxPage > currentPage){
      nextPage = parseInt(currentPage) + 1;
    }

    let archiveList = {};

    let archives = await app.mysql.query("select title,created,createdAt,clicknum,slug from posts where "+ searchWhereStr +" order by id desc limit ?,?",[start,pagesize])
    
    for(let i = 0; i<archives.length; i++){
      let time = archives[i].created || archives[i].createdAt;
      let year = new Date(time).getFullYear();
      
      if(archives[i].clicknum === undefined){
        archives[i].clicknum = 0;
      }
      
      if(archiveList[year] === undefined){
        archiveList[year] = {year: year, archives: []};
      }
      archives[i].addtime = moment(new Date(time)).format("YYYY-MM-DD");

      archiveList[year].archives.push(archives[i]);
    }
    let tmp=[];
    for(var key in archiveList){
       //key是属性,object[key]是值
       tmp.push(archiveList[key]);//往数组中放属性
    }
    archiveList = tmp.sort(sortNumber);
    let data = {
      site_url:settings.site_url,
      title: settings.name + " › 文章存档", 
      archives: archiveList, 
      name: settings.name,
      keywords: settings.keywords,
      description: settings.description,
      crtP: currentPage,
      maxP: maxPage,
      nextP: nextPage,
      user: {}
    };
    ctx.body = await ctx.renderView('front/archives.nj', data);
  }

  async post() {
    const { ctx,app } = this

    const settings = app.config.settings

    let id = ctx.params.id;
		let idInt = parseInt(id);
		let where = {};
		if(idInt > 0){
			where.id = idInt;
		}else{
			where.slug = id;
		}
    // get
    const post = await app.mysql.get('posts', where);
    if(post == null){
      return;
    }
    let time = post.created || post.createdAt;
    post.addtime = moment(new Date(time)).format("YYYY-MM-DD");
    post.content = marked(post.content);
    //clicknum
    if(post.clicknum !=undefined){
      post.clicknum = post.clicknum + 1;
    }else{
      post.clicknum = 1;
    }
    //更新
    app.mysql.update('posts', {id:post.id,clicknum: post.clicknum})

    let page_title = post.title + ' | ' + settings.name;
    let keywords = settings.keywords;
    if(post.keywords != undefined){
      keywords = post.keywords;
    }

    let description = settings.description;
    if(post.description != undefined){
      description = post.description;
    }

    //newposts
    const newposts = await app.mysql.query('select title,created,createdAt,clicknum,slug from posts where status=1 order by id desc limit 10')

    let re_result = []
    if(post.tags){
      post.tags = post.tags.split(',');
      let likeStr = "";
      for(var i = 0; i<post.tags.length; i++){
        if(likeStr != ''){
          likeStr += " or ";
        }
        likeStr += " tags like '%" + post.tags[i] +"%' ";
      }
      re_result = await app.mysql.query('select * from posts where '+likeStr+' order by clicknum desc limit 10')

    }

    var data = {
      site_url:settings.site_url,
      title: page_title,
      keywords: keywords,
      description: description, 
      post: post,
      newposts: newposts, 
      name: settings.name,
      user:{},
      re_result:re_result
    }
    ctx.body = await ctx.renderView('front/post.nj', data);
  }

  async tag() {
    const { ctx,app } = this

    const settings = app.config.settings

    let result = await app.mysql.query("select title,created,createdAt,clicknum,slug from posts where tags like '%"+ ctx.params.tag +"%'")
    for(var i = 0; i < result.length; i++){
      result[i].content = '';
      var time = result[i].created || result[i].createdAt;
      result[i].addtime = moment(new Date(time)).format("YYYY-MM-DD");
    }
    var data = {
      site_url:settings.site_url,
      name: settings.name, 
      title: settings.name,
      keywords: settings.keywords,
      description: settings.description, 
      posts: result, 
      tag_name: ctx.params.tag
    };
    ctx.body = await ctx.renderView('front/tag.nj', data);
  }

  async page() {
    const { ctx,app } = this

    const settings = app.config.settings

    let page = await app.mysql.query("select * from pages where slug like '%"+ ctx.params.slug +"%'")

    var data = {
      site_url:settings.site_url,
      name: settings.name, 
      title: settings.name + ' › ' + page.title,
      keywords: settings.keywords,
      description: settings.description, 
      page: page && page[0],
      tag_name: ctx.params.tag
    };
    ctx.body = await ctx.renderView('front/page.nj', data);
  }

}

module.exports = HomeController;
