// 대기
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
// 텍스트로 요소 선택자 생성
const uiedit = text => `//android.widget.EditText[@text="${text}"]`;
const uiSelector = text => `android=new UiSelector().text("${text}")`;
const uiSelectorText = text => `android=new UiSelector().textContains("${text}")`;
const uiSelectorBtnText = text => `android=new UiSelector().className("android.widget.Button").text("${text}")`;
const webText = text => `//*[text()="${text}"]`;
const containstext = text => `//*[contains(text(), "${text}")]`;
const webviewText = text => `//android.widget.TextView[@text="${text}"]`;
const btnText = text => `//android.widget.Button[@content-desc="${text}"]`;
const ImageView = text => `//android.widget.ImageView[@content-desc='${text}']`;
const view = text => `//android.view.View[@content-desc="${text}"]`;
const containsview = text => `//android.view.View[contains(@content-desc, "${text}")]`;
const checkbox = text => `//android.widget.CheckBox[@content-desc="${text}"]`;

const android = (text, contains = false, startsWith = false) => {
    if (contains) {
        return `//*[contains(@content-desc, "${text}") or contains(@text, "${text}")]`;
    }
    if (startsWith) {
        return `//*[starts-with(@content-desc, "${text}") or starts-with(@text, "${text}")]`;
    }
    return `//*[@content-desc="${text}" or @text="${text}"]`;
};

// 요소 클릭
async function click(driver, selector) {
    await driver.$(selector).click();
}

// 스크롤 동작
async function scroll(driver, startXRatio, startYRatio, endXRatio, endYRatio, duration = 1000) {
    try {
        // 디바이스의 해상도를 가져옵니다.
        const windowRect = await driver.getWindowRect();
        const deviceWidth = windowRect.width;
        const deviceHeight = windowRect.height;

        // 비율에 따라 실제 스크롤 좌표를 계산합니다.
        const startX = Math.floor(deviceWidth * startXRatio);
        const startY = Math.floor(deviceHeight * startYRatio);
        const endX = Math.floor(deviceWidth * endXRatio);
        const endY = Math.floor(deviceHeight * endYRatio);

        // 스크롤 액션을 수행합니다.
        await driver.performActions([
            {
                type: 'pointer',
                id: 'finger1',
                parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', duration: 0, x: startX, y: startY }, // 포인트 이동
                    { type: 'pointerDown', button: 0 }, // 터치 다운
                    { type: 'pause', duration: 1000 }, // 일시 정지
                    { type: 'pointerMove', duration, origin: 'viewport', x: endX, y: endY }, // 스크롤 이동
                    { type: 'pointerUp', button: 0 }, // 터치 업
                ],
            },
        ]);

        // 추가 대기 시간
        await wait(3 * 1000);
    } catch (error) {
        console.error(`scroll error:`, error);
        throw error;
    }
}

async function touchTap(driver, xRatio, yRatio) {
    try {
        // 디바이스의 해상도를 가져옵니다.
        const windowRect = await driver.getWindowRect();
        const deviceWidth = windowRect.width;
        const deviceHeight = windowRect.height;

        // 비율에 따라 실제 터치 좌표를 계산합니다.
        const x = Math.floor(deviceWidth * xRatio);
        const y = Math.floor(deviceHeight * yRatio);

        // 터치 액션을 수행합니다.
        await driver.performActions([
            {
                type: 'pointer',
                id: 'finger1',
                parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', duration: 0, x: x, y: y }, // 터치 위치로 이동
                    { type: 'pointerDown', button: 0 }, // 터치 다운
                    { type: 'pause', duration: 200 }, // 일시 정지
                    { type: 'pointerUp', button: 0 }, // 터치 업
                ],
            },
        ]);

        // 추가 대기 시간
        await wait(1 * 1000);
    } catch (error) {
        console.error(`touch error:`, error);
        throw error;
    }
}

// 텍스트 입력
async function enterText(driver, selector, value) {
    try {
        const element = await driver.$(selector);
        await element.waitForExist({ timeout: 5 * 1000 });
        await element.setValue(value);
        await wait(3 * 1000);
        console.log(`Entered value '${value}' successfully.`);
    } catch (error) {
        console.error(`Error entering value '${value}' into element with selector '${selector}':`, error);
        throw error;
    }
}
// 텍스트 지우기
async function clearText(driver, selector) {
    try {
        // Wait for the element to be displayed
        const element = await driver.$(selector);
        await element.waitForDisplayed({ timeout: 5000 });
        // Clear the text
        await element.clearValue(); // `clear` is deprecated in WebdriverIO v5+, use `clearValue` instead
        await wait(3 * 1000);
    } catch (error) {
        console.error(`Error clearing text in element with selector '${selector}':`, error);
        throw error;
    }
}

// 볼륨 버튼 조작
async function pressVolumeButton(driver, direction = 'up') {
    try {
        const keyCode = direction.toLowerCase() === 'up' ? 24 : 25; // 24: 볼륨 업, 25: 볼륨 다운
        await driver.pressKeyCode(keyCode);
        console.log(`Volume button '${direction}' pressed successfully.`);
    } catch (error) {
        console.error(`Error pressing volume button '${direction}':`, error);
        throw error;
    }
}

// 텍스트 확인
async function contains(driver, type) {
    try {
        const element = await driver.$(type, { timeout: 10 * 1000 });
        await element.waitForExist({ timeout: 10 * 1000 });
        console.log(`such element '${type}'`);
    } catch (error) {
        console.error(`no such element '${type}':`, error);
        throw error;
    }
}

async function finish(driver, app) {
    if (driver) {
        try {
            const appPackage = app.capabilities['appium:appPackage'];
            console.log('App Package:', appPackage);
            await driver.terminateApp(appPackage);
            if (appPackage === 'com.svcorps.mkitchen') {
                await driver.removeApp(appPackage);
                console.log('App removed.');
            }
            await driver.deleteSession();
            console.log('Driver session ended.');
        } catch (deleteSessionError) {
            console.error('Error ending driver session:', deleteSessionError);
            throw deleteSessionError;
        }
    }
}

const utils = {
    click,
    scroll,
    uiedit,
    finish,
    webText,
    containstext,
    wait,
    webviewText,
    uiSelector,
    uiSelectorText,
    uiSelectorBtnText,
    btnText,
    view,
    containsview,
    enterText,
    clearText,
    pressVolumeButton,
    ImageView,
    contains,
    touchTap,
    checkbox,
    android,
};

module.exports = utils;
