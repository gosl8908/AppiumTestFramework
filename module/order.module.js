const utils = require('../module/utils'); // utils 모듈을 가져옵니다.
async function order(driver, category, menu, prise, priseOption = undefined, credit = undefined) {
    try {
        const categoryNm = await driver.$(utils.android(category, true, { timeout: 5 * 1000 }));
        if (await categoryNm.isDisplayed()) {
            await utils.click(driver, utils.android(category));
            await utils.wait(1 * 1000);
        } else {
            await utils.scroll(driver, 0.1, 0.6, 0.1, 0.0);
            await utils.click(driver, utils.android(category));
            await utils.wait(1 * 1000);
        }

        try {
            // 먼저 ImageView를 찾고 클릭 시도
            await utils.click(driver, utils.android(`${menu}\n${prise}원`));
        } catch (error) {
            console.log(`ImageView를 찾을 수 없어 View를 찾습니다. 에러: ${error.message}`);
            // ImageView가 없을 경우 View로 클릭 시도
            await utils.click(driver, utils.android(`${menu}\n${prise}원`));
        }
        await utils.wait(1 * 1000);
        if (priseOption) {
            await utils.click(driver, utils.android(`${priseOption}원 담기`));
        } else {
            await utils.click(driver, utils.android(`${prise}원 담기`));
        }
        await utils.wait(1 * 1000);
        await utils.click(driver, utils.android('장바구니\n1'));
        await utils.wait(1 * 1000);

        const Prepaid = await driver.$(utils.android('한번에 결제하기', { timeout: 5 * 1000 }));
        if (await Prepaid.isDisplayed()) {
            await utils.click(driver, utils.android('한번에 결제하기'));
        } else {
            await utils.click(driver, utils.android('주문하기'));
        }
        if (credit === 'Y') {
            await utils.wait(1 * 1000);
            const clickSequence = async (driver, sequence) => {
                for (const view of sequence) {
                    await utils.click(driver, utils.android(view));
                    await utils.wait(1000);
                }
            };
            await clickSequence(driver, ['2', '0', '4', '3', '1', '6', '5']);
            const viewsWithContentDesc3 = await driver.$$(`//android.view.View[@content-desc="3"]`);
            if (viewsWithContentDesc3.length > 1) {
                await utils.click(driver, viewsWithContentDesc3[1]);
                await utils.wait(1000);
            }
            await utils.wait(1 * 1000);
            await utils.click(driver, utils.android('에 동의합니다.'));
            await utils.wait(1 * 1000);
            await utils.click(driver, utils.android('이후 주문도 이 번호로 적립할게요.'));
            await utils.wait(1 * 1000);
            await utils.click(driver, utils.android('확인'));
        } else if (credit === 'N') {
            await utils.click(driver, utils.android('괜찮아요, 다음에 할게요.'));
            await utils.wait(1 * 1000);
        } else if (credit === undefined) {
            await utils.wait(1 * 1000);
        }
        await utils.contains(driver, utils.android('주문완료', true, { timeout: 5 * 1000 }));

        await utils.wait(1 * 1000);
        await utils.click(driver, utils.android('확인'));

        await utils.click(driver, utils.android('주문내역'));
        await utils.contains(driver, utils.android(`${menu}`, true));
        await utils.click(driver, utils.android('닫기'));
        await console.log('주문 완료');
    } catch (error) {
        console.error(`주문 완료 중 오류 발생: ${error.message}`);
        throw error;
    }
}
async function payCancel(driver, prise, formattedOptionPrice = undefined) {
    try {
        const targetText = formattedOptionPrice ? `${formattedOptionPrice}원` : `${prise}원`;
        await utils.click(driver, utils.android('결제내역\n탭 5개 중 4번째')); // 결제내역

        await utils.click(driver, utils.android(targetText));
        await utils.wait(1 * 1000);
        await utils.click(driver, utils.android('결제취소'));
        await utils.wait(1 * 1000);
        await utils.touchTap(driver, 0.349, 0.292);
        await utils.wait(1 * 1000);
        await utils.click(driver, utils.android('결제취소'));
        await utils.wait(1 * 1000);
        await utils.click(driver, utils.btnTandroidext('네'));
        await utils.wait(1 * 1000);
        await utils.contains(driver, utils.android('결제가 취소되었습니다.', true));
        await utils.wait(1 * 1000);
        await utils.click(driver, utils.android('확인'));
        await utils.wait(1 * 1000);
        console.log('결제 취소 완료');
    } catch (error) {
        console.error(`결제 취소 중 오류 발생: ${error.message}`);
        throw error;
    }
}
async function adminMode(driver) {
    try {
        /* 결제취소 */
        await utils.touchTap(driver, 0.1, 0.05);
        await utils.touchTap(driver, 0.1, 0.05);

        await utils.click(driver, utils.android('테이블번호'));
        await utils.click(driver, utils.android('테이블번호'));

        for (let i = 0; i < 6; i++) {
            await utils.click(driver, utils.android('1'));
        }
        await utils.click(driver, utils.android('확인'));
        await utils.wait(1 * 1000);
        // await utils.click(driver, utils.view('관리자 모드'));
        await utils.touchTap(driver, 0.3698, 0.5917);
        await utils.wait(1 * 1000);
        await utils.click(driver, utils.android('확인'));

        const issue = await driver.$(utils.android('테이블 점검안내', true, { timeout: 5 * 1000 }));
        if (await issue.isDisplayed()) {
            await utils.click(driver, utils.android('닫기', true));
        }
        console.log('관리자모드 진입 완료');
    } catch (error) {
        console.error(`관리자모드 진입 중 오류 발생: ${error.message}`);
        throw error;
    }
}
async function orderCancel(driver, tableNo, prise, formattedOptionPrice = undefined) {
    try {
        // 클릭할 텍스트 결정: formattedOptionPrice가 있으면 그것을 클릭, 없으면 prise 클릭
        const targetText = formattedOptionPrice
            ? `${tableNo}\n${formattedOptionPrice}원` // formattedOptionPrice 클릭
            : `${tableNo}\n${prise}원`; // prise 클릭

        try {
            // View를 먼저 시도
            await utils.click(driver, utils.android(targetText));
        } catch (error) {
            // View가 없으면 ImageView로 시도
            await utils.click(driver, utils.android(targetText));
        }
        await utils.click(driver, utils.android('완료'));
        await utils.wait(1000);
        await utils.click(driver, utils.android('주문취소')); // '주문취소' 버튼 클릭
        await utils.wait(3000);
        await utils.touchTap(driver, 0.33, 0.18); // 전체 선택
        await utils.wait(3000);
        await utils.click(driver, utils.android('취소')); // '취소' 버튼 클릭
        await utils.wait(1000);

        await utils.touchTap(driver, 0.05, 0.15); // 이전
        await utils.wait(1000);

        console.log('주문취소 완료');

        /* 메인 화면 진입 */
        await utils.click(driver, utils.android('설정\n탭 5개 중 5번째'));
        await utils.wait(1000);
        await utils.click(driver, utils.android('테이블 모드 전환'));
        await utils.wait(1000);

        const Prepaid = await driver.$(utils.view('안녕하세요 :)\n저희는 선불로 운영되는 매장이에요'));
        const Postpaid = await driver.$(utils.view('안녕하세요 :)\n메뉴 확인 후 바로 주문해 주세요'));

        if (await Prepaid.isDisplayed()) {
            await utils.click(driver, utils.android('확인'));
        }
        if (await Postpaid.isDisplayed()) {
            await utils.click(driver, utils.android('확인'));
        }
        console.log('메인화면 진입 완료');
    } catch (error) {
        console.error(`주문 취소 중 오류 발생: ${error.message}`);
        throw error; // 오류를 다시 던져 호출한 곳에서 처리
    }
}

async function orderCashPay(driver, tableNo, prise, formattedOptionPrice = undefined) {
    try {
        const targetText = formattedOptionPrice ? `${tableNo}\n${formattedOptionPrice}원` : `${tableNo}\n${prise}원`;

        try {
            await utils.click(driver, utils.android(targetText));
        } catch (error) {
            await utils.click(driver, utils.android(targetText));
        }
        await utils.wait(1000);
        await utils.click(driver, utils.android('완료'));
        await utils.wait(1000);
        await utils.click(driver, utils.android('현금'));
        await utils.wait(1000);
        await utils.click(driver, utils.android('+50,000'));
        await utils.wait(1000);
        await utils.click(driver, utils.android('자진발급'));
        await utils.wait(1000);
        await utils.click(driver, utils.android('결제'));
        await utils.wait(1000);
        await utils.contains(driver, utils.android('결제완료', true));
        await utils.wait(1000);
        await utils.click(driver, utils.android('확인'));

        console.log('결제 완료');
    } catch (error) {
        console.error(`결제제 중 오류 발생: ${error.message}`);
        throw error;
    }
}

async function staffCall(driver, staff) {
    try {
        await utils.click(driver, utils.android('직원호출'));
        await utils.wait(1 * 1000);
        await utils.click(driver, utils.android(staff));
        await utils.wait(1 * 1000);
        await utils.click(driver, utils.android('호출하기'));
    } catch (error) {
        console.error(`직원호출 중 에러 발생 : ${error.message}`);
        throw error;
    }
}

module.exports = {
    order,
    payCancel,
    adminMode,
    orderCancel,
    staffCall,
    orderCashPay,
};
