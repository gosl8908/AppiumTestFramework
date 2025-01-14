const axios = require('axios'); // HTTP 요청을 위한 axios 라이브러리
const crypto = require('crypto'); // Node.js crypto 모듈
const assert = require('assert'); // 필요에 따라 API 응답 검증용
const { env } = require('../config.js');
const BaseUrl = 'http://staging-to-api.monthlykitchen.kr';

async function token(userId, userPass) {
    // 3. 엑세스 토큰 발급
    const hashedPass = crypto.createHash('sha256').update(userPass).digest('hex');
    const authUrl = `${BaseUrl}/auth/token`;

    const authBody = {
        appType: 'tableorder_app',
        grantType: 'password',
        userId: userId,
        userPass: hashedPass, // 변환된 해시값 사용
    };
    try {
        // POST 요청으로 토큰 발급
        const authResponse = await axios.post(authUrl, authBody);
        accessToken = authResponse.data.accessToken; // 응답에서 엑세스 토큰 추출
        console.log('엑세스 토큰 발급 성공:', accessToken);
        return accessToken; // 토큰 반환
    } catch (error) {
        console.error('엑세스 토큰 발급 실패:', error.message);
        throw error; // 테스트 실패 처리
    }
}

async function order(accessToken, storeNo) {
    // 4. 주문 API 호출
    const apiUrl = `${BaseUrl}/common/orders/${storeNo}`;
    const params = {
        day: env.Date,
        regFromAppType: 'APPT_012',
    };

    try {
        // GET 요청으로 주문 API 호출 (Authorization 헤더 추가)
        const orderResponse = await axios.get(apiUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`, // 토큰 포함
            },
            params,
        });

        // 첫 번째 주문 결과만 추출
        const firstOrder = orderResponse.data[0];
        if (firstOrder.orderItemStatusName === '취소' && orderResponse.data.length > 1) {
            firstOrder = orderResponse.data[1];
        }

        // 응답 데이터 출력
        console.log('주문 API 호출 성공');
        // console.log('주문 API 응답 데이터:', firstOrder.data);
        return firstOrder;
    } catch (error) {
        console.error('주문 API 호출 실패:', error.message);
        throw error; // 테스트 실패 처리
    }
}
async function staff(accessToken, storeNo) {
    const apiUrl = `${BaseUrl}/tableorders/employee-calls/${storeNo}/employeecallitem`;
    try {
        const staffResponse = await axios.get(apiUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`, // 토큰 포함
            },
        });

        // 응답 데이터 출력
        console.log('직원호출 리스트트 API 호출 성공');
        console.log('직원호출 API 응답 데이터:', staffResponse.data);
        // 첫 번째 itemName 추출
        const firstItemName = staffResponse.data[1]?.itemName || null;

        // 첫 번째 itemName 반환
        return firstItemName;
    } catch (error) {
        console.error('직원호출출 API 호출 실패:', error.message);
        throw error;
    }
}

// Products 호출 함수
async function products(accessToken, storeNo) {
    const url = `${BaseUrl}/common/products/${storeNo}`;
    const appType = 'tableorder_app';

    try {
        const response = await axios.get(url, {
            params: { appType },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        // 데이터에서 menuNm과 menuPrice 추출
        const tableorderApp = response.data.tableorderApp;

        const result = tableorderApp.map(item => {
            const { categoryNm, menuNm, menuPrice, menuOptions } = item;

            // 첫 번째 서브옵션 가격을 가져옴 (서브옵션이 없으면 0)
            let firstSubOptionPrice = 0;

            if (menuOptions && menuOptions.length > 0) {
                // 메뉴 옵션이 있을 때
                const firstOption = menuOptions[0]; // 첫 번째 옵션 (옵션1)

                console.log('첫 번째 옵션:', firstOption); // 첫 번째 옵션 정보 로그로 출력

                if (firstOption.subOption && firstOption.subOption.length > 0) {
                    // 서브옵션이 있을 경우
                    firstSubOptionPrice = firstOption.subOption[0].optionPrice || 0; // 서브옵션 가격
                }
            }

            // 메뉴 가격에 첫 번째 서브옵션 가격을 더함
            const totalPrice = menuPrice + firstSubOptionPrice;

            // 가격 포맷팅 (천 단위 콤마 추가)
            const formattedPrice = menuPrice.toLocaleString(); // 옵션을 더하지 않은 기본 가격 포맷팅
            const formattedOptionPrice = totalPrice.toLocaleString(); // 옵션을 더한 최종 가격 포맷팅

            // 결과 반환 (옵션이 포함된 가격도 함께 포함)
            return {
                categoryNm,
                menuNm,
                menuPrice,
                menuOptions,
                formattedPrice,
                formattedOptionPrice,
            };
        });

        console.log('상품 목록:', result); // 확인용 로그
        return result; // 메뉴 이름과 포맷된 가격을 포함한 결과 반환
    } catch (error) {
        console.error('상품 API 호출 오류:', error.message);
        throw error;
    }
}

module.exports = {
    token,
    order,
    products,
    staff,
};
