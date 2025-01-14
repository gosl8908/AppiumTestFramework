const { remote } = require('webdriverio');
const { app, env, error } = require('../../config.js');
const utils = require('../../module/utils.js');
const Module = require('../../module/manager.module.js');
const { allure } = require('allure-mocha/runtime');

describe('단골맛집 매장', function () {
    this.timeout(360 * 1000);
    let driver;
    let Screenshots = []; // 스크린샷을 저장할 배열
    let TestFails = []; // 실패 원인을 저장할 변수
    let FailureObj = { Failure: false };

    function run(testFunc) {
        return async function () {
            try {
                await testFunc();
                console.log(`Test Passed: ${this.test.title}`);
            } catch (err) {
                error(TestFails, FailureObj, err, this.test.title);
            }
        };
    }
    before(
        'remote',
        run(async function () {
            driver = await remote(
                app(
                    4725,
                    env.GalaxyNote10plus5G.deviceName,
                    env.GalaxyNote10plus5G.udid,
                    env.GalaxyNote10plus5G.platformVersion,
                ),
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
            // 검색
            await Module.searchModule.search(driver, '강남');
            // 검색
            await Module.searchModule.search(driver, '강남(stg)');
        }),
    );
    it(
        '메뉴 진입',
        run(async function () {
            // 메뉴
            await utils.wait(10 * 1000);
            await utils.scroll(driver, 0.5, 0.75, 0.5, 0.0);
            await utils.click(driver, utils.uiSelectorText('치킨'));
            console.log('메뉴 상세 진입 성공');
        }),
    );
    it(
        '메뉴 장바구니 담기',
        run(async function () {
            // 장바구니 담기
            await utils.wait(10 * 1000);
            await utils.click(driver, utils.uiSelectorText('장바구니 담기'));
            await utils.wait(10 * 1000);
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
        }),
    );
    it(
        '카드입력 & 주문완료',
        run(async function () {
            // 카드 입력 & 주문완료 확인
            await Module.payModule.pay(driver, env.cardPassword);
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
            console.log('주문취소 완료 텍스트가 나타났습니다.');
        }),
    );
    afterEach('Status Check', async function () {
        await Module.emailModule.screenshot2(driver, FailureObj, Screenshots, this.currentTest);
    });

    after('send Email', async function () {
        // await utils.finish(driver, app());
        const { title: describeTitle, tests: allTests } = this.test.parent;
        // 실패한 테스트만 필터링
        await Module.emailModule.email2({
            TestFails,
            describeTitle,
            EmailTitle: `[${env.AppEmailTitle}]`,
            TestRange:
                '단골맛집 매장식사 결제' +
                `\n${allTests.map((test, index) => `${index + 1}. ${test.title}`).join('\n')}`,
            Screenshots,
        });
    });
});
