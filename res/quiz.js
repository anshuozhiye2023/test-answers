// Select DOM elements
const timerElem = document.getElementById('time');
const questionNumElem = document.getElementById('question-number');
const questionTextElem = document.getElementById('question-text');
const optionsContainer = document.getElementById('options');
const resultContainer = document.getElementById('result-container');
const scoreTextElem = document.getElementById('score-text');
const quizContainer = document.getElementById('quiz-container');

// 获取用户信息
const userUnit = localStorage.getItem('selectedDistrict') || '未指定区县';

let questions = [];
let currentQuestionIndex = 0;
let currentQuestion = null;
let score = 0;
let timerInterval = null;
let quizEnded = false;
let startTime = null;
let endTime = null;
let selectedAnswers = []; // 存储多选题已选答案

// 新增：判断题目类型
function getQuestionType(question) {
  return Array.isArray(question.correct) && question.correct.length > 1 ? 'multi' : 'single';
}

function startTimer(duration) {
  let timeRemaining = duration;
  timerElem.textContent = timeRemaining;
  timerInterval = setInterval(() => {
    timeRemaining--;
    timerElem.textContent = timeRemaining;
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      endQuiz();
    }
  }, 1000);
}

function showQuestion(index) {
  selectedAnswers = []; // 重置已选答案
  currentQuestion = questions[index];
  
  // 新增：获取题目类型
  const questionType = getQuestionType(currentQuestion);
  
  questionNumElem.innerText = `第${index + 1}题 共${questions.length}题`;
  questionTextElem.innerText = `（${questionType === 'single' ? '单选' : '多选'}）${currentQuestion.question}`;
  
  optionsContainer.innerHTML = '';
  currentQuestion.options.forEach((optionText, i) => {
    const optionElem = document.createElement('div');
    optionElem.className = 'option';
    optionElem.innerHTML = `
      <span class="option-text">${optionText}</span>
      <span class="option-icon"></span>
    `;
    optionElem.addEventListener('click', (e) => {
      if (quizEnded) return;
      handleOptionSelect(optionElem, i);
    });
    optionsContainer.appendChild(optionElem);
  });
}

function handleOptionSelect(optionElem, selectedIndex) {
  const questionType = getQuestionType(currentQuestion);
  const selectedOption = currentQuestion.options[selectedIndex];
  const optionKey = selectedOption.substring(0, 1);

  // 单选题处理（保持不变）
  if (questionType === 'single') {
    if (optionKey === currentQuestion.correct) {
      optionElem.classList.add('correct');
      score += 10;
      disableOptions();
      setTimeout(moveToNextQuestion, 1000);
    } else {
      optionElem.classList.add('wrong');
      highlightCorrectOption();
      disableOptions();
      setTimeout(moveToNextQuestion, 2000);
    }
    return;
  }

  // 多选题处理（修改部分）
  if (selectedAnswers.includes(optionKey)) return;

  // 立即显示正确/错误状态
  if (currentQuestion.correct.includes(optionKey)) {
    optionElem.classList.add('correct'); // 正确选项立即变绿
    selectedAnswers.push(optionKey);
  } else {
    // 错误选项立即变红
    optionElem.classList.add('wrong');
    highlightCorrectOption();
    disableOptions();
    setTimeout(moveToNextQuestion, 2000);
    return;
  }

  // 检查是否选全
  if (selectedAnswers.length === currentQuestion.correct.length) {
    // 验证是否全部正确
    const allCorrect = currentQuestion.correct.every(c => 
      selectedAnswers.includes(c)
    );
    
    if (allCorrect) {
      score += 10;
      disableOptions();
      setTimeout(moveToNextQuestion, 1000);
    }
  }
}

function highlightCorrectOption() {
  const options = Array.from(optionsContainer.children);
  options.forEach((opt, i) => {
    const optionKey = currentQuestion.options[i].substring(0, 1);
    const correctAnswers = Array.isArray(currentQuestion.correct) ?
      currentQuestion.correct :
      [currentQuestion.correct];
    if (correctAnswers.includes(optionKey)) {
      opt.classList.add('correct');
    }
  });
}

function disableOptions() {
  Array.from(optionsContainer.children).forEach(opt => {
    opt.style.pointerEvents = 'none';
  });
}

function moveToNextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length && !quizEnded) {
    showQuestion(currentQuestionIndex);
  } else {
    endQuiz();
  }
}

// 以下函数保持不变（calculateTotalTime、endQuiz、sendResultToServer）
// ...

 // 计算总用时（秒）
function calculateTotalTime() {
  if (!startTime || !endTime) return 0;
  return Math.floor((endTime - startTime) / 1000);
}

// End the quiz and show the result screen
function endQuiz() {
  if (quizEnded) return; // prevent multiple calls
  quizEnded = true;
  
  // 记录结束时间
  endTime = new Date();
  const totalTime = calculateTotalTime();
  
  // Stop the timer if still running
  clearInterval(timerInterval);
  
  // Hide quiz content and show result within the same container
  questionNumElem.style.display = 'none';
  questionTextElem.style.display = 'none';
  optionsContainer.style.display = 'none';
  
  // Show result container in the same position
  resultContainer.style.display = 'block';
  
  // 添加用户信息到结果页
  let resultHTML = `
    <h2>答题结束！</h2>
    <div class="user-info">
      <p>地区：${userUnit}</p>
      <p>用时：${totalTime}秒</p>
    </div>
    <div id="score-text">
      您的得分：${score} 分（共${questions.length}题，每题10分，满分100分）
    </div>
  `;
  
  resultContainer.innerHTML = resultHTML;
  
  // 添加返回主页按钮事件
  
  // 调用函数
 // submitData();
  // 这里可以添加将成绩和用户信息提交到后台的代码
   sendResultToServer( userUnit,  score, totalTime);
}
// 发送数据到接口（适配你的截图中的请求格式）
function submitData() {
  // 接口地址（POST）
  const apiUrl = 'https://app.xbpjng.net/api/web/publicitySet';

  // 请求数据（和你的截图一致）
  const requestData = {
    name: "测试",
    mobile: "15701305730"
  };

  // 使用fetch发送POST请求
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 如果需要其他Header（根据你的截图，可能有9个Headers）
      // 'Authorization': 'Bearer xxx'
    },
    body: JSON.stringify(requestData)
  })
  .then(response => response.json())
  .then(data => {
    console.log("返回结果:", data); // {code: 200, msg: 'ok'}
    alert(`提交成功: code=${data.code}, msg=${data.msg}`);
  })
  .catch(error => {
    console.error("提交失败:", error);
    alert("提交失败，请检查控制台日志！");
  });
}


// 将用户成绩发送到后台（示例函数，需要根据实际后台接口实现）
function sendResultToServer( unit, score, time) {
  // 这里是一个示例，实际应当连接到您的后台接口
  console.log(`准备提交成绩： ${unit},  ${score}分, ${time}秒`);
  // 使用fetch API发送数据到后端（示例代码）
  const apiUrl = 'https://app.xbpjng.net/api/web/publicitySet';
    // 请求数据（根据接口文档要求调整字段名）
    const requestData = {
      unit: unit,      // 单元/科目
      score: score,    // 分数
      time: time,      // 用时（秒）
      // 其他必填字段（如用户标识，需根据接口文档补充）
      // userId: "123456" 
    };
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),// 默认值，显式声明需跨域
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP错误! 状态码: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('提交成功:', data);
    // 根据返回的code处理结果（示例：code为200表示成功）
    if (data.code === 200) {
      alert('成绩提交成功！');
    } else {
      console.error('服务器返回错误:', data.msg);
    }
  })
  .catch(error => {
    console.error('提交失败:', error);
    alert('提交失败，请检查网络或联系管理员。');
  });
  
}
// 保持原有计时和结束逻辑，只需确保在endQuiz中重置selectedAnswers

// Fetch questions.json时的修改
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    // 规范化数据格式
    startTime = new Date(); 
    data = data.map(q => ({
      ...q,
      correct:getQuestionType(q) === 'multi' ?
      (Array.isArray(q.correct) ? q.correct : [q.correct]) :
      q.correct
    }));
    
    data.sort(() => 0.5 - Math.random());
    questions = data.slice(0, 10);
    currentQuestionIndex = 0;
    score = 0;
    quizEnded = false;
    showQuestion(currentQuestionIndex);
    startTimer(120); // 建议延长多选题时间
  })
  .catch(error => {
    console.error('Error loading questions:', error);
    questionTextElem.innerText = "无法加载题目数据。";
  });