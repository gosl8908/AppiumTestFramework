const { remote } = require('webdriverio');
const { app, env, error } = require('../../config.js');
const utils = require('../../module/utils.js');
const Module = require('../../module/manager.module.js');
const { allure } = require('allure-mocha/runtime');

describe('주소 설정', function () {
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
        'Fail1',
        run(async function () {
            await utils.wait(5 * 1000);

            await utils.click(driver, utils.uiSelectorText('My먼키'));

            await utils.click(driver, utils.uiSelectorText('주소설정'));

            await utils.click(driver, utils.uiSelectorText('현재 위치 찾기'));

            await utils.enterText(driver, utils.uiedit('상세주소를 입력해 주세요'), '1');

            await utils.enterText(driver, utils.uiedit('명칭을 입력해 주세요'), '1');

            await utils.click(driver, utils.uiSelectorText('주소로 설정하기'));

            await utils.contains(driver, utils.uiSelectorText('주소가 등록되었습니다.'));

            await utils.click(driver, utils.uiSelectorText('확인'));
        }),
    );
    afterEach('Status Check', async function () {
        await Module.emailModule.screenshot2(driver, FailureObj, Screenshots, this.currentTest);
    });

    after('send Email', async function () {
        await utils.finish(driver, app());
        const { title: describeTitle, tests: allTests } = this.test.parent;
        // 실패한 테스트만 필터링
        await Module.emailModule.email2({
            TestFails,
            describeTitle,
            EmailTitle: `[${env.AppEmailTitle}]`,
            TestRange: '주소 설정' + `\n${allTests.map((test, index) => `${index + 1}. ${test.title}`).join('\n')}`,
            Screenshots,
        });
    });
});
