

module.exports = () => {
    return async function checkAdmin(ctx, next) {
        let settings = ctx.app.config.settings
        if (ctx.session.admin) {
            await next();
        } else {
            let cookie = ctx.cookies.get(settings.auth_cookie_name);
            if (!cookie) {
                ctx.redirect('/admin/login');
                return
            }
                
            let auth_token = ctx.helper.decrypt(cookie, settings.session_secret);
            let auth = auth_token.split('\t');
            let admin_name = auth[0];

            const result = await ctx.app.mysql.get('admins', { name: admin_name });

            if (result) {
                ctx.session.admin = result;
                await next();
            } else {
                ctx.redirect('/admin/login')
            }
        }
    };
};