const { remote } = require('webdriverio');
const { app, env, error } = require('../../config.js'); // Import from config.js
const utils = require('../../module/utils.js');
const Module = require('../../module/manager.module.js');
const { allure } = require('allure-mocha/runtime');

describe('Appium Test Suite', function () {
    this.timeout(360 * 1000);
    let driver;
    let Screenshots = []; // Array to store screenshots
    let TestFails = []; // Variable to store failure reasons
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
            driver = await remote(app(4723, env.GalaxyA24.deviceName, `${env.GalaxyA24.port}${'34023'}`));
            await utils.wait(10 * 1000);
            await Module.bootModule.boot(driver);

            // Login
            await Module.loginModule.login(driver, env.email, env.testpwd);
        }),
    );

    it(
        'Fail1',
        run(async () => {
            // Test scroll action
            await utils.scroll(driver, 0.5, 0.1, 0.5, 0.8);
        }),
    );

    afterEach('Status Check', async function () {
        await Module.emailModule.screenshot2(driver, FailureObj, Screenshots, this.currentTest);
    });

    after('send Email', async function () {
        const { title: describeTitle, tests: allTests } = this.test.parent;
        await Module.emailModule.email2({
            TestFails,
            describeTitle,
            EmailTitle: `[${env.AppEmailTitle}]`,
            TestRange:
                '테스트 스크립트1' + `\n${allTests.map((test, index) => `${index + 1}. ${test.title}`).join('\n')}`,
            Screenshots,
        });
    });
});
