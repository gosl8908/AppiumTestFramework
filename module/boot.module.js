const utils = require('./utils'); // utils 모듈을 가져옵니다.

async function boot(driver) {
    try {
        const boottext = await driver.$(
            utils.uiSelectorText('먼키오더에서 이 기기의 위치 정보에 액세스하도록 허용하시겠습니까?'),
        );
        if (await boottext.isDisplayed()) {
            await utils.click(driver, utils.uiSelector('앱 사용 중에만 허용'));
            await utils.wait(1 * 1000);
        }
        const boottext2 = await driver.$(
            utils.uiSelectorText('먼키오더에서 기기의 사진과 동영상에 액세스하도록 허용하시겠습니까?'),
        );
        if (await boottext2.isDisplayed()) {
            await utils.click(driver, utils.uiSelector('모두 허용'));
            await utils.wait(1 * 1000);
        }
        const boottext3 = await driver.$(
            utils.uiSelectorText('먼키오더에서 사진을 촬영하고 동영상을 녹화하도록 허용하시겠습니까?'),
        );
        if (await boottext3.isDisplayed()) {
            await utils.click(driver, utils.uiSelector('앱 사용 중에만 허용'));
            await utils.wait(1 * 1000);
        }
        const boottext4 = await driver.$(utils.uiSelectorText('먼키오더에서 알림을 보내도록 허용하시겠습니까?'));
        if (await boottext4.isDisplayed()) {
            await utils.click(driver, utils.uiSelector('허용'));
            await utils.wait(1 * 1000);
        }

        // 로그인 버튼을 찾고 클릭하기
        const loginButton = await driver.$(utils.uiSelectorText('앱 접근 권한 안내'));
        if (await loginButton.isDisplayed()) {
            await utils.click(driver, utils.uiSelector('확인'));
            await utils.wait(5 * 1000); // 5초 대기
        }
        const loginButton2 = await driver.$(utils.uiSelectorText('포인트로 쌓고\n현금처럼 쓰고'));
        if (await loginButton2.isDisplayed()) {
            await utils.scroll(driver, 0.9, 0.5, 0.1, 0.5);
            await utils.wait(3 * 1000);
            await utils.scroll(driver, 0.9, 0.5, 0.1, 0.5);
            await utils.wait(3 * 1000);
            await utils.scroll(driver, 0.9, 0.5, 0.1, 0.5);
            await utils.wait(3 * 1000);
            await utils.click(driver, utils.uiSelector('시작하기'));
            await utils.wait(3 * 1000);
        }
        console.log('부팅 성공');
    } catch (error) {
        console.error(`부팅 중 오류 발생: ${error.message}`);
        throw error;
    }
}

module.exports = {
    boot,
};
