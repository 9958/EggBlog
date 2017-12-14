const crypto = require('crypto');

module.exports = {
    foo(param) {
        // this 是 helper 对象，在其中可以调用其他 helper 方法
        // this.ctx => context 对象
        // this.app => application 对象
    },

    /**
     * 加密函数
     * @param str 源串
     * @param secret  因子
     * @returns str
     */
    encrypt(str, secret) {
        let cipher = crypto.createCipher('aes192', secret);
        let enc = cipher.update(str, 'utf8', 'hex');
        enc += cipher.final('hex');
        return enc;
    },

    /**
     * 解密
     * @param str
     * @param secret
     * @returns str
     */
    decrypt(str, secret) {
        let decipher = crypto.createDecipher('aes192', secret);
        let dec = decipher.update(str, 'hex', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    }

};