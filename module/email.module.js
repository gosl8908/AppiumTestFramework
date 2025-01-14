const { sendEmail, sendMessage, env } = require('../config.js');
const fs = require('fs');
const path = require('path');

function email2({ TestFails, describeTitle, EmailTitle, TestRange, Screenshots }) {
    const IsTestFailed = TestFails.length > 0;
    const EmailBody = `${describeTitle} App 자동화 테스트가 ${IsTestFailed ? '실패' : '성공'}하였습니다.
        테스트 실행 시간 : ${env.DateLabelWeek}\n
        테스트 범위 : ${TestRange}\n
        ${
            IsTestFailed
                ? `
        테스트 실패 원인 :\n${TestFails.map(fail => `- ${fail.title}: ${fail.error}`).join('\n')}\n`
                : ''
        }`;
    console.log('테스트가 성공적으로 완료되었습니다.');

    const EmailInfo = {
        subject: `${EmailTitle}`,
        body: EmailBody,
        screenshotFileNames: Screenshots.map(name => name + '.png'), // 스크린샷 파일 이름들을 추가
    };

    sendEmail(EmailInfo);
}
function screenshot2(driver, FailureObj, Screenshots, currentTest) {
    if (!FailureObj.Failure) return Promise.resolve(Screenshots);

    const screenshotFileName = `${currentTest.title.replace(/[^a-z0-9]/gi, '_')}_${env.DateLabel}`;
    const screenshotPath = path.join(__dirname, '../screenshot', `${screenshotFileName}.png`);

    fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });

    return driver
        .takeScreenshot()
        .then(screenshot => {
            fs.writeFileSync(screenshotPath, screenshot, 'base64');
            Screenshots.push(screenshotFileName);
            FailureObj.Failure = false;
            return Screenshots;
        })
        .catch(error => {
            console.error('Error taking screenshot:', error);
            throw error;
        });
}

function message({ TestFails, describeTitle, TestRange, Screenshots }) {
    const IsTestFailed = TestFails.length > 0;

    const messageTitle = `${describeTitle} 자동화 테스트가 ${IsTestFailed ? '실패' : '성공'}하였습니다.`;
    const message = `테스트 실행 시간 : ${env.DateLabelWeek}\n
테스트 범위 : ${TestRange}\n
        ${
            IsTestFailed
                ? `
테스트 실패 원인 :\n${TestFails.map(fail => `- ${fail.title}: ${fail.error}`).join('\n')}\n`
                : ''
        }`;

    const payload = {
        text: message,
        title: messageTitle,
        screenshotFileNames: Screenshots.map(name => name + '.png'), // 스크린샷 파일 이름들을 추가
    };

    sendMessage(payload.text, payload.title, payload.screenshotFileNames);
}

module.exports = {
    email2,
    message,
    screenshot2,
};
