const utils = require('../module/utils'); // utils 모듈을 가져옵니다.
const fs = require('fs'); // fs 모듈 추가
const path = require('path'); // path 모듈 추가
const { env } = require('../config.js'); // 환경 변수 불러오기

async function order(driver, type = undefined) {
    try {
        // 대기 후 스크롤 및 클릭 작업 수행
        await utils.wait(10000);
        await utils.scroll(driver, 0.5, 0.6, 0.5, 0.0);
        await utils.wait(5000);
        const CreditText = await driver.$(utils.uiSelectorText('모두사용'));
        if (await !CreditText.isDisplayed()) {
            await utils.scroll(driver, 0.5, 0.3, 0.5, 0.0);
        }
        await utils.click(driver, utils.uiSelectorText('모두사용'));
        await utils.wait(5000);
        await utils.click(driver, utils.uiSelectorText('간편결제'));
        await utils.wait(5000);
        await utils.scroll(driver, 0.5, 0.6, 0.5, 0.0);
        await utils.click(driver, utils.uiSelectorText('개인정보 제3자 제공 내용 및 결제에 동의합니다.'));
        await utils.wait(5000);

        if (type === '무료배달') {
            await utils.click(driver, utils.uiSelectorText('무료배달 결제하기'));
        }
        await utils.click(driver, utils.uiSelectorText('결제하기'));
        console.log('주문 완료');
    } catch (error) {
        console.error(`주문 완료 중 오류 발생: ${error.message}`);
        throw error;
    }
}

async function pay(driver, passwordDigits) {
    try {
        // 대기 후 스크롤 및 클릭 작업 수행
        await utils.wait(10000);
        await utils.scroll(driver, 0.5, 0.7, 0.5, 0.0);
        await utils.click(driver, utils.uiSelectorBtnText('결제'));
        await utils.wait(5000);

        // 비밀번호 입력
        for (const digit of passwordDigits) {
            await utils.click(driver, `android=new UiSelector().className("android.widget.Button").text("${digit}")`);
            await utils.wait(1000);
        }

        // 주문 완료 텍스트 확인 및 클릭
        await utils.wait(5000);
        await utils.contains(driver, utils.uiSelectorText('주문완료'));
        console.log('결제완료 & 주문완료 텍스트가 나타났습니다.');

        // 스크린샷 캡처
        await utils.wait(5 * 1000);
        await driver.takeScreenshot().then(screenshot => {
            const screenshotPath = path.join(__dirname, '../screenshot', `screenshot_${env.DateLabel}.jpg`);
            fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
            fs.writeFileSync(screenshotPath, screenshot, 'base64');
            console.log('스크린샷 캡쳐 완료.');
        });
    } catch (error) {
        console.error(`결제 중 오류 발생: ${error.message}`);
        throw error;
    }
}

module.exports = {
    pay,
    order,
};
