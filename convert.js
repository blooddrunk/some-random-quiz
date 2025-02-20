const fs = require('fs');
const path = require('path');

/**
 * 解析题库文本内容
 * @param {string} content - 文件内容
 * @param {string} questionType - 题型：single（单选）、multi（多选）、judge（判断）
 * @returns {Array} 题目对象数组
 */
function parseFileContent(content, questionType) {
  const questions = [];
  // 按空行拆分每道题（支持Windows和Unix的换行）
  const parts = content.split(/\r?\n\s*\r?\n/);

  parts.forEach((part) => {
    // 按行拆分，并去除空行
    const lines = part
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== '');
    if (lines.length === 0) return;

    let questionText = '';
    const options = [];
    let answer = [];
    let explanation = '';

    // 如果第一行包含题型标签【单选题】等，则去掉
    let firstLine = lines[0];
    if (firstLine.startsWith('【') && firstLine.indexOf('】') > -1) {
      firstLine = firstLine.substring(firstLine.indexOf('】') + 1).trim();
    }
    questionText = firstLine;

    // 遍历后续行进行解析
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('正确答案：')) {
        // 去除“正确答案：”前缀，并分割可能的多选答案（逗号或顿号分隔）
        const ansStr = line.replace('正确答案：', '').trim();
        answer = ansStr.split(/,|，/).map((s) => s.trim());
      } else if (line.startsWith('解析：')) {
        explanation = line.replace('解析：', '').trim();
      } else if (/^[A-Z]、/.test(line)) {
        // 选项行，例如 "A、xxx"，此处保留完整文本，也可以根据需要进一步处理
        options.push(line);
      } else {
        // 其它行归入题干（有时题目较长时可能分行书写）
        questionText += ' ' + line;
      }
    }

    // 对于判断题，如果没有选项，则预设为 ["正确", "错误"]
    if (questionType === 'judge' && options.length === 0) {
      options.push('正确', '错误');
    }

    questions.push({
      text: questionText,
      options: options,
      answer: answer,
      explanation: explanation,
      type: questionType,
    });
  });

  return questions;
}

// 指定文件路径（请确保文本文件与脚本在同一目录，或调整路径）
const singlePath = path.join(__dirname, '单选题.txt');
const multiPath = path.join(__dirname, '多选题.txt');
const judgePath = path.join(__dirname, '判断题.txt');

// 读取文件内容
const singleText = fs.readFileSync(singlePath, 'utf8');
const multiText = fs.readFileSync(multiPath, 'utf8');
const judgeText = fs.readFileSync(judgePath, 'utf8');

// 分别解析三个题库
const singleQuestions = parseFileContent(singleText, 'single');
const multiQuestions = parseFileContent(multiText, 'multi');
const judgeQuestions = parseFileContent(judgeText, 'judge');

// 将所有题目合并到一起，也可以根据需要分开保存
const allQuestions = [...singleQuestions, ...multiQuestions, ...judgeQuestions];

// 保存为 JSON 文件（格式化后便于调试）
fs.writeFileSync(
  path.join(__dirname, 'questions.json'),
  JSON.stringify(allQuestions, null, 2),
  'utf8'
);
console.log('questions.json 已成功生成！');
