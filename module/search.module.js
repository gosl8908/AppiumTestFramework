const utils = require('../module/utils'); // utils 모듈을 가져옵니다.

async function search(driver, searchText) {
    try {
        // 검색 버튼 클릭
        await utils.click(driver, utils.uiSelectorText('검색'));
        await utils.wait(5000); // 대기

        // 검색 텍스트가 이미 있는 경우 클릭, 없으면 텍스트 입력 후 엔터키 입력
        const storeTextSelector = utils.uiSelectorText(searchText);
        const storeTextBtn = await driver.$(storeTextSelector);

        if (await storeTextBtn.isDisplayed()) {
            await utils.click(driver, storeTextSelector);
            await utils.wait(5000); // 대기
        } else {
            await utils.enterText(driver, utils.uiSelectorText('음식이나 음식점 이름을 검색해주세요'), searchText);
            await utils.wait(5000); // 대기
            // Enter 키를 누릅니다 (Android의 경우 key code 66)
            await driver.pressKeyCode(66); // 66은 Enter 키의 key code
            await utils.wait(5000); // 대기
        }

        // 검색 텍스트 필드를 비우고 다시 클릭
        await utils.clearText(driver, utils.uiSelectorText(`${searchText}`));
        await utils.wait(5 * 1000); // 대기
        await utils.click(driver, storeTextSelector);
        await utils.wait(5 * 1000); // 대기

        console.log('검색 및 선택 완료');
    } catch (error) {
        console.error(`검색 및 선택 중 오류 발생: ${error.message}`);
        throw error;
    }
}

module.exports = {
    search,
};
