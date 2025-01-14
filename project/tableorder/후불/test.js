const { remote } = require('webdriverio');
const { tableorder, env, error } = require('../../../config.js');
const utils = require('../../../module/utils.js');
const Module = require('../../../module/manager.module.js');

describe('후불-Test', function () {
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
            const currentPackage = await driver.getCurrentPackage();
            console.log('Current app package:', currentPackage);

            const currentActivity = await driver.getCurrentActivity();
            console.log('Current app activity:', currentActivity);
            await utils.wait(5 * 1000);
        }),
    );
    it(
        'UPdate',
        run(async () => {
            const update = await driver.$(utils.android('최신 버전으로 앱 업데이트 진행 중 입니다.', true));
            if (await update.isDisplayed()) {
                const update = await driver.$(utils.android('이 앱을 업데이트하시겠습니까?', true));

                if (await update.isDisplayed()) {
                    await utils.wait(5 * 1000);
                }
                await utils.click(driver, utils.android('업데이트'));
                await utils.click(driver, utils.android('세부정보 더보기'));

                await utils.click(driver, utils.android('앱 검사', true));
                await utils.contains(driver, utils.android('이 앱을 업데이트하시겠습니까?', true));
                await utils.click(driver, utils.android('업데이트'));
                await utils.contains(driver, utils.android('앱이 설치되었습니다.', true));
            }
            const setting = await driver.$(
                utils.android(
                    '보안상의 이유로 현재 이 출처의 알 수 없는 앱을 휴대전화에 설치할 수 없습니다. 설정에서 변경할 수 있습니다.',
                    true,
                ),
            );
            if (await setting.isDisplayed()) {
                await utils.click(driver, utils.android('설정'));
                await utils.click(driver, utils.android('권한 허용'));
                await utils.click(driver, utils.android('업데이트'));
                await utils.wait(10 * 1000);
                await utils.click(driver, utils.android('열기', true));
            }
        }),
    );
    it(
        'Fail-2',
        run(async () => {
            await utils.contains(driver, utils.android('asdasd', true));
        }),
    );
    afterEach('Status Check', async function () {
        await Module.emailModule.screenshot2(driver, FailureObj, Screenshots, this.currentTest);
    });

    after('Send Email', async function () {
        //     // await utils.finish(driver, tableorder());
        await Module.emailModule.message({
            TestFails,
            describeTitle: this.test.parent.title,
            TestRange: `테스트\n${this.test.parent.tests.map((test, index) => `${index + 1}. ${test.title}`).join('\n')}`,
            Screenshots,
        });
        // await Module.emailModule.email2({
        //     TestFails,
        //     describeTitle: this.test.parent.title,
        //     EmailTitle: `[${env.TableorderEmailTitle}]`,
        //     TestRange: `테스트\n${this.test.parent.tests.map((test, index) => `${index + 1}. ${test.title}`).join('\n')}`,
        //     Screenshots,
        // });
    });
});
