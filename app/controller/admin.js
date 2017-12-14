'use strict';

const Controller = require('egg').Controller;
const _ = require('lodash');
const marked = require('marked');
const utility = require('utility');

class AdminController extends Controller {

  async login() {
    let { ctx } = this
    const data = { title: '登陆' };
    ctx.body = await ctx.renderView('admin/login.nj', data);
  }

  async logout() {
    let { ctx,app } = this
    let settings = app.config.settings
    ctx.session = null
    ctx.cookies.set(settings.auth_cookie_name, null);
    ctx.redirect('/');
  }

  async doLogin() {
    let { ctx,app } = this
    let settings = app.config.settings
    let name = ctx.request.body.name;
    let pass = ctx.request.body.pass;
    if(name == '' || pass == ''){
        ctx.body = await ctx.renderString('账号或密码为空！');
        return;
    }
    const admin = await app.mysql.get('admins', { name: name });
    if(admin) {
      pass = utility.md5(pass);
      if(admin.password !=pass){
        //to be safe,show username or password error
        ctx.body = await ctx.renderString('账号或密码错误！');
        return;
      }
      //store session cookie
      let auth_token = ctx.helper.encrypt(admin.name + '\t' + admin.password, settings.session_secret);
      ctx.cookies.set(settings.auth_cookie_name, auth_token, {path: '/',maxAge: 1000*60*60*24*7});
      ctx.redirect('/admin');
    }else{
      ctx.redirect('/admin/login')
    }
  }

  async index() {
    let { ctx } = this
    const data = { title: '管理后台' };
    ctx.body = await ctx.renderView('admin/index.nj', data);
  }

  async postWrite() {
    let { ctx } = this
    const data = { title: '新增文章' };
    ctx.body = await ctx.renderView('admin/postWrite.nj', data);
  }

  async postDelete() {
    let { ctx,app } = this
    const result = await app.mysql.delete('posts', {
      id: ctx.params.id
    });
    ctx.redirect('/admin/post')
  }

  async postWriteSave() {
    let { ctx, app } = this

    let post = _.pick(ctx.request.body, 'title', 'slug', 'content', 'keywords', 'description', 'tags', 'status');
    post.content_html = marked(post.content);
    // insert
    const result = await app.mysql.insert('posts', post);
    const insertSuccess = result.affectedRows === 1;

    if (insertSuccess) {
      //成功处理
    }

    ctx.redirect('/admin')
  }

  async postIndex() {
    let { ctx, app } = this

    // query
    const results = await app.mysql.select('posts');
    const data = { title: '文章列表', post_list: results };

    ctx.body = await ctx.renderView('admin/postIndex.nj', data);
  }

  async postEdit() {
    let { ctx, app } = this

    // get
    const post = await app.mysql.get('posts', { id: ctx.params.id });
    const data = { title: '文章修改', post: post };
    let ajax = ctx.query && ctx.query.ajax;
    if (ajax && ajax == 1) {
      ctx.body = post ? { success: 1, result: post } : { success: 0, result: {} }
    } else {
      ctx.body = await ctx.renderView('admin/postEdit.nj', data);
    }
  }

  async postEditSave() {
    let { ctx, app } = this

    let post = _.pick(ctx.request.body, 'title', 'slug', 'content', 'keywords', 'description', 'tags', 'status');
    post.content_html = marked(post.content);
    post.id = ctx.params.id
    const result = await app.mysql.update('posts', post);
    const updateSuccess = result.affectedRows === 1;
    ctx.body = { success: updateSuccess ? 1 : 0 }
  }

  /**
   *============================================================================
   * page 模块
   *============================================================================
   */
  async pageIndex() {
    let { ctx, app } = this

    // query
    const results = await app.mysql.select('pages');
    const data = { title: '页面列表', page_list: results };

    ctx.body = await ctx.renderView('admin/pageIndex.nj', data);
  }

  async pageWriteSave() {
    let { ctx, app } = this

    let page = _.pick(ctx.request.body, 'title', 'slug','content','keywords','description');
    page.content_html = marked(page.content);
    page.status = 1;
    // insert
    const result = await app.mysql.insert('pages', page);
    const insertSuccess = result.affectedRows === 1;

    if (insertSuccess) {
      //成功处理
    }

    ctx.redirect('/admin')
  }

  async pageEdit() {
    let { ctx, app } = this

    // get
    const page = await app.mysql.get('pages', { id: ctx.params.id });
    const data = { title: '页面修改', page: page };
    let ajax = ctx.query && ctx.query.ajax;
    if (ajax && ajax == 1) {
      ctx.body = page ? { success: 1, result: page } : { success: 0, result: {} }
    } else {
      ctx.body = await ctx.renderView('admin/pageEdit.nj', data);
    }
  }

  async pageWrite() {
    let { ctx } = this
    const data = { title: '新增页面' };
    ctx.body = await ctx.renderView('admin/pageWrite.nj', data);
  }

  async pageDelete() {
    let { ctx,app } = this
    const result = await app.mysql.delete('pages', {
      id: ctx.params.id
    });
    ctx.redirect('/admin/page')
  }

  async pageEditSave() {
    let { ctx, app } = this

    let page = _.pick(ctx.request.body, 'title', 'slug','content','keywords','description');
    page.content_html = marked(page.content);
    page.id = ctx.params.id
    page.status = 1;
    const result = await app.mysql.update('pages', page);
    const updateSuccess = result.affectedRows === 1;
    ctx.redirect('/admin')
  }

  /**
   *============================================================================
   * 标签 模块
   *============================================================================
   */
  async tag() {
    let { ctx, app } = this

    // query
    const results = await app.mysql.select('tags');
    let data = { title: '标签列表', tag_list: results };

    // query
    const tagRes = await app.mysql.select('tag_logs');
    data.tag_log = tagRes

    ctx.body = await ctx.renderView('admin/tag.nj', data);
  }

  async tagSave() {
    let { ctx, app } = this

    let tag = _.pick(ctx.request.body, 'title','count');
    tag.status = 1;
    if(ctx.request.body.id>0){
      tag.id = ctx.request.body.id
      const result = await app.mysql.update('tags', tag);
      ctx.body = {
        success:true
      }
    }else{
      // insert
      const result = await app.mysql.insert('tags', tag);
      ctx.body = {
        success:true,
        result:result
      }
    }

  }
  

}

module.exports = AdminController;
