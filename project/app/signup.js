const { remote } = require('webdriverio');
const { app, env, error } = require('../../config.js');
const utils = require('../../module/utils.js');
const Module = require('../../module/manager.module.js');
const { allure } = require('allure-mocha/runtime');

describe('회원가입', function () {
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
                app(4724, env.GalaxyA24.deviceName, env.GalaxyA24.port, env.GalaxyA24.platformVersion),
            );
            await utils.wait(10 * 1000);
        }),
    );
    it(
        '회원가입',
        run(async function () {
            await Module.bootModule.boot(driver);

            await utils.click(driver, utils.uiSelectorText('간편회원가입'));

            await utils.click(driver, utils.uiSelectorText('약관에 모두 동의합니다.'));

            await utils.click(driver, utils.uiSelectorText('확인'));

            await utils.enterText(
                driver,
                '//android.widget.EditText[@text="휴대폰 번호를 입력해 주세요"]',
                env.testphone,
            );

            await utils.click(driver, utils.uiSelectorText('인증번호 받기'));
            // await utils.click(driver, utils.uiSelectorText('재전송'));

            // 인증번호를 읽어오는 함수
            const verificationCode = await Module.messageModule.message(env.GalaxyA24.port, '18995678');

            if (verificationCode) {
                // 인증번호 입력란에 입력
                const verificationInput = await driver.$('//android.widget.EditText[@text="인증번호를 입력해 주세요"]');
                await verificationInput.setValue(verificationCode);
                console.log(`인증번호 입력 완료: ${verificationCode}`);
            } else {
                console.log('인증번호를 찾을 수 없습니다.');
            }

            await utils.click(driver, utils.uiSelectorText('인증하기'));
            const NotNumber = await driver.$(utils.uiSelectorText('휴대폰 인증코드가 일치하지 않습니다'));

            if (await NotNumber.isDisplayed()) {
                const verificationInput = await driver.$(`//android.widget.EditText[@text='${verificationCode}']`);
                await verificationInput.clearValue();

                // 인증번호를 읽어오는 함수
                const verificationNewCode = await Module.messageModule.message(env.GalaxyA24.port, '18995678');
                await verificationInput.setValue(verificationNewCode);
                await utils.click(driver, utils.uiSelectorText('인증하기'));
            }

            await utils.enterText(
                driver,
                '//android.widget.EditText[@text="이메일 주소를 입력해 주세요"]',
                env.testemail,
            );
            const buttons = await driver.$$(`android=new UiSelector().textContains("중복확인")`);
            await buttons[0].click();
            await utils.wait(3 * 1000);
            const email = await driver.$(utils.uiSelectorText('email이 존재합니다'));
            if (await email.isDisplayed()) {
                await utils.enterText(
                    driver,
                    `//android.widget.EditText[@text="${env.testemail}"]`,
                    '1' + env.testemail,
                );
                await buttons[0].click();
            }

            await utils.enterText(driver, '//android.widget.EditText[@text="닉네임을 입력해 주세요"]', 'stg몬키');
            await buttons[1].click();
            await utils.wait(3 * 1000);
            const nickname = await driver.$(utils.uiSelectorText('닉네임이 존재합니다'));
            if (await nickname.isDisplayed()) {
                await utils.enterText(driver, '//android.widget.EditText[@text="몬키"]', env.testid);
                await buttons[1].click();
            }

            await utils.enterText(driver, '//android.widget.EditText[@text="비밀번호를 입력해 주세요"]', env.testpwd);

            await utils.enterText(
                driver,
                '//android.widget.EditText[@text="비밀번호 한번 더 입력해 주세요"]',
                env.testpwd,
            );
            await utils.click(driver, utils.uiSelectorText('가입완료'));
            await utils.contains(driver, utils.uiSelectorText('회원가입이 완료되었습니다.'));
            await utils.click(driver, utils.uiSelectorText('확인'));
            await utils.click(driver, utils.uiSelectorText('먼키홈으로 가기'));

            const eventBtn = await driver.$(utils.uiSelectorText('오늘하루 그만보기'));
            if (await eventBtn.isDisplayed()) {
                await utils.click(driver, '오늘하루 그만보기');
            }
        }),
    );
    // it(
    //     '로그인',
    //     run(async function () {
    //         await Module.loginModule.login(driver, env.testemail, env.testpwd);
    //     }),
    // );
    // it(
    //     '회원탈퇴',
    //     run(async function () {
    //         await Module.loginModule.signout(driver);
    //     }),
    // );
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
                '1. 회원가입, 2. 회원탈퇴' +
                `\n${allTests.map((test, index) => `${index + 1}. ${test.title}`).join('\n')}`,
            Screenshots,
        });
    });
});
