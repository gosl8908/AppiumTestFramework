const { remote } = require('webdriverio');
const { tableorder, env, error } = require('../../../config.js');
const utils = require('../../../module/utils.js');
const Module = require('../../../module/manager.module.js');
const { allure } = require('allure-mocha/runtime');

describe('Appium Test Suite', function () {
    this.timeout(360 * 1000);
    let driver;
    let accessToken;
    let formattedPrice;
    let Screenshots = []; // 스크린샷을 저장할 배열
    let TestFails = []; // 실패 원인을 저장할 변수
    let FailureObj = { Failure: false };
    const run = testFunc =>
        async function () {
            try {
                await testFunc();
                console.log(`Test Passed: ${this.test.title}`);
            } catch (err) {
                error(TestFails, FailureObj, err, this.test.title);
            }
        };
    before(
        'remote',
        run(async () => {
            driver = await remote(
                tableorder(4723, env.GalaxyTabS7FE.deviceName, `${env.GalaxyTabS7FE.udid}${'35331'}`),
            );
            await utils.wait(10 * 1000);
            const currentPackage = await driver.getCurrentPackage();
            const currentActivity = await driver.getCurrentActivity();
            console.log('Current app package:', currentPackage);
            console.log('Current app activity:', currentActivity);
        }),
    );
    it(
        '로그인',
        run(async () => {
            await Module.loginModule.TOlogin(driver, env.monkitest[3], env.testpwd2);
            accessToken = await Module.apiModule.token(env.monkitest[3], env.testpwd2); // 엑세스 토큰을 변수에 저장
        }),
    );
    it(
        '후불매장 테이블 주문',
        run(async () => {
            const products = await Module.apiModule.products(accessToken, env.storeNo); // 첫 번째 상품명 반환
            if (products && products.length > 0) {
                const { categoryNm, menuNm, formattedPrice: price, formattedOptionPrice } = products[0];
                formattedPrice = price;
                await Module.orderModule.order(driver, categoryNm, menuNm, formattedPrice, formattedOptionPrice); // 저장된 엑세스 토큰을 사용하여 주문 API 호출
                await Module.apiModule.order(accessToken, env.storeNo);
            }
        }),
    );
    it(
        '직원 호출',
        run(async () => {
            const firstItemName = await Module.apiModule.staff(accessToken, env.storeNo);
            await Module.orderModule.staffCall(driver, firstItemName);
        }),
    );
    it(
        '주문취소',
        run(async () => {
            await Module.orderModule.adminMode(driver);
            await Module.orderModule.orderCancel(driver, '1', formattedPrice, formattedPrice);
        }),
    );
    afterEach('Status Check', async function () {
        await Module.emailModule.screenshot2(driver, FailureObj, Screenshots, this.currentTest);
    });

    after('Send Email', async function () {
        // await utils.finish(driver, tableorder());
        // await Module.emailModule.message({
        //     TestFails,
        //     describeTitle: this.test.parent.title,
        //     TestRange: `테스트\n${this.test.parent.tests.map((test, index) => `${index + 1}. ${test.title}`).join('\n')}`,
        //     Screenshots,
        // });
        // await Module.emailModule.email2({
        //     TestFails,
        //     describeTitle: this.test.parent.title,
        //     EmailTitle: `[${env.TableorderEmailTitle}]`,
        //     TestRange: `후불_테이블오더 주문\n${this.test.parent.tests.map((test, index) => `${index + 1}. ${test.title}`).join('\n')}`,
        //     Screenshots,
        // });
    });
});
