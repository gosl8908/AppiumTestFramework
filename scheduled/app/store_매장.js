const { remote } = require('webdriverio');
const { app, env, error } = require('../../config.js');
const utils = require('../../module/utils.js');
const Module = require('../../module/manager.module.js');
const { allure } = require('allure-mocha/runtime');

describe('지점 매장', function () {
    this.timeout(360 * 1000);
    let driver;
    let Screenshots = []; // 스크린샷을 저장할 배열
    let TestFails = []; // 실패 원인을 저장할 변수
    let FailureObj = { Failure: false };
    function run(testFunc) {
        return async function () {
            try {
                await testFunc();
            } catch (err) {
                error(TestFails, FailureObj, err, this.test.title);
            }
        };
    }
    before(
        'remote',
        run(async function () {
            driver = await remote(
                app(4725, env.GalaxyA24.deviceName, env.GalaxyA24.udid, env.GalaxyA24.platformVersion),
            );
            await utils.wait(10 * 1000);
            await Module.bootModule.boot(driver);
            /* 로그인 */
            await Module.loginModule.login(driver, env.email, env.testpwd);
        }),
    );
    it(
        '검색',
        run(async function () {
            const store = await driver.$(utils.uiSelectorText('번개지점(stg)'));
            const Notstore = await driver.$(utils.uiSelectorText('설정하기'));
            if (await Notstore.isDisplayed()) {
                await utils.click(driver, utils.uiSelectorText('설정하기'));
                await utils.wait(3 * 1000);
                await utils.scroll(driver, 0.5, 0.6, 0.5, 0.0);
                await utils.click(driver, utils.uiSelectorText('번개지점(stg)'));
                await utils.click(driver, utils.uiSelector('선택'));
            } else if (!(await store.isDisplayed())) {
                await utils.click(driver, utils.uiSelectorText('변경'));
                await utils.click(driver, utils.uiSelectorText('번개지점(stg)'));

                await utils.click(driver, utils.uiSelector('선택'));
                await utils.wait(3 * 1000);
                await utils.scroll(driver, 0.5, 0.1, 0.5, 0.8);
                await utils.click(driver, utils.uiSelectorText('무료배달'));
            }
            await utils.click(driver, utils.uiSelectorText('번개지점(stg)'));
            await utils.wait(10 * 1000);
            await utils.scroll(driver, 0.5, 0.6, 0.5, 0.0);
            await utils.click(driver, utils.uiSelectorText('몬키지점'));
            console.log('검색 성공');
        }),
    );
    it(
        '메뉴 상세 진입',
        run(async function () {
            // 메뉴
            await utils.wait(10 * 1000);
            await utils.scroll(driver, 0.5, 0.6, 0.5, 0.0);
            await utils.click(driver, utils.uiSelectorText('라면'));
            console.log('메뉴 상세 진입 성공');
        }),
    );
    it(
        '메뉴 장바구니',
        run(async function () {
            // 장바구니 담기
            await utils.wait(10 * 1000);
            await utils.scroll(driver, 0.5, 0.75, 0.5, 0.0);
            await utils.click(driver, utils.uiSelectorText('기본'));
            await utils.click(driver, utils.uiSelectorText('장바구니 담기'));
            await utils.wait(15 * 1000);
            await utils.click(driver, utils.uiSelectorText('장바구니 보기'));
            await utils.wait(5 * 1000);
            await utils.click(driver, utils.uiSelectorText('매장식사 주문'));
            console.log('메뉴 장바구니 담기 성공');
        }),
    );
    it(
        '결제',
        run(async function () {
            // 결제
            await Module.payModule.order(driver);
            console.log('결제 진입 성공');
        }),
    );
    it(
        '카드 입력 & 주문완료',
        run(async function () {
            // 카드 입력 & 주문완료 확인
            await Module.payModule.pay(driver, env.cardPassword);
            console.log('결제 성공 & 주문완료');
        }),
    );
    it(
        '주문취소',
        run(async function () {
            // 주문취소
            await utils.click(driver, utils.uiSelectorText('주문취소'));
            await utils.wait(5000);
            await utils.click(driver, utils.uiSelectorText('단순 변심'));
            await utils.wait(5000);
            await utils.click(driver, utils.uiSelectorText('취소하기'));
            await utils.contains(driver, utils.uiSelectorText('주문이 취소되었습니다.'));
            await utils.click(driver, utils.uiSelectorText('확인'));
            console.log('주문취소 완료 성공');
        }),
    );
    afterEach('Status Check', async function () {
        await Module.emailModule.screenshot2(driver, FailureObj, Screenshots, this.currentTest);
    });

    after('send Email', async function () {
        await utils.finish(driver, app());
        await Module.emailModule.email2({
            TestFails,
            describeTitle: this.test.parent.title,
            EmailTitle: `[${env.AppEmailTitle}]`,
            TestRange: `지점 매장식사 결제\n${this.test.parent.tests.map((test, index) => `${index + 1}. ${test.title}`).join('\n')}`,
            Screenshots,
        });
    });
});
