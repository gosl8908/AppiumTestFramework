const loginModule = require('./login.module.js');
const searchModule = require('./search.module.js');
const payModule = require('./pay.module.js');
const emailModule = require('./email.module.js');
const messageModule = require('./message.module.js');
const bootModule = require('./boot.module.js');
const orderModule = require('./order.module.js');
const apiModule = require('./api.module.js');
// 다른 모듈들도 필요한 경우 추가

const Module = {
    loginModule,
    searchModule,
    payModule,
    messageModule,
    bootModule,
    emailModule,
    orderModule,
    apiModule,
};

module.exports = Module;
// module.exports = {
//     loginModule,
//     searchModule,
//     payModule,
//     messageModule,
//     emailModule,
//     // 다른 모듈들도 필요한 경우 추가
// };
