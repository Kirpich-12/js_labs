const VALID_SYMBOLS = /^[а-яё]$/i;

// ====== СЛОВАРИ ПО ТЕМАМ ======
const themeWords = {
  animals: ['тигр','слон','лев','панда','кошка','собака','лягушка','кролик','олень','зебра'],
  cities: ['москва','париж','лондон','киев','мадрид','питер','варшава','токио','пхукет','софия'],
  weather: ['дождь','снег','ветер','гроза','мороз','туман','ураган','облако','жара','холод'],
  racing: ['форсаж','гонка','трек','спринт','ралли','дрифт','байк','авто','формула','мото'],
  webdev: ['бэкенд','фронт','реакт','скрипт','класс','тег','сайт','запрос','файл','цикл'],
  sports: ['футбол','теннис','хоккей','баскет','волейб','бокс','плаванье','гандбол','регби','лыжи'],
  math: ['сумма','число','угол','дробь','процент','множитель','площадь','корень','логарифм','параметр']
};

let word = '';
let answerArray = [];
let usedLetters = new Set();
let remainingLetters = 0;

let gameActive = document.querySelector('.game-input');
let lettersInput = gameActive.querySelector('input');
let buttonToVerif = gameActive.querySelector('button');
let gameMessage = document.querySelector('.game-input__validation');
let guessWord = document.querySelector('.game-result__word');
let humanParts = document.querySelectorAll('.human > *');
let keyboardContainer = document.querySelector('.keyboard');
let gameContainer = document.querySelector('.game-container')

let themeSelection = document.querySelector('.theme-selection');
let themeButtons = document.querySelectorAll('.theme-selection button');

// ====== ФУНКЦИИ ======
function getRandomWord(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function hideHumanParts() {
  humanParts.forEach(part => part.style.visibility = 'hidden');
}

function createKeyboard() {
  const letters = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'.split('');
  keyboardContainer.innerHTML = '';
  letters.forEach(letter => {
    let btn = document.createElement('button');
    btn.textContent = letter;
    btn.addEventListener('click', () => handleLetter(letter, btn));
    keyboardContainer.appendChild(btn);
  });
}

function disableButton(btn, type) {
  btn.classList.add('used');
  if(type==='correct') btn.classList.add('correct');
  if(type==='wrong') btn.classList.add('wrong');
  btn.disabled = true;
}

function endGame() {
  buttonToVerif.style.display = 'none';
  let btnRestart = document.createElement('button');
  btnRestart.classList.add('game-input__btn');
  btnRestart.textContent = 'сыграть ещё раз';
  gameActive.appendChild(btnRestart);
  btnRestart.addEventListener('click', () => location.reload());
}

function updateGameState(value, btn) {
  if(!word.includes(value)) {
    // показать следующую часть человека
    for(let part of humanParts){
      if(part.style.visibility === 'hidden'){
        part.style.visibility = 'visible';
        break;
      }
    }
    disableButton(btn,'wrong');

    // проверка поражения
    if([...humanParts].every(p => p.style.visibility==='visible')){
      gameMessage.innerHTML = `Поражение! Ответ: ${word}`;
      guessWord.textContent = word;
      endGame();
    }
    return;
  }

  // открытие букв
  for(let i=0;i<word.length;i++){
    if(word[i] === value && answerArray[i]==='_'){
      answerArray[i] = value;
      remainingLetters--;
    }
  }

  disableButton(btn,'correct');
  guessWord.textContent = answerArray.join(' ');

  // проверка победы
  if(!answerArray.includes('_')){
    gameMessage.innerHTML = `Браво! Вы угадали слово "${word}"!`;
    endGame();
  }
}

function handleLetter(letter, btn){
  if(usedLetters.has(letter)) return;
  usedLetters.add(letter);
  updateGameState(letter, btn);
}

function validateInput(value){
  if(!value) return 'Введите букву';
  if(value.length>1) return 'Только одна буква';
  if(!VALID_SYMBOLS.test(value)) return 'Только русские буквы';
  if(usedLetters.has(value)) return 'Буква уже была';
}

// ====== ВЫБОР ТЕМЫ ======
themeButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const theme = btn.dataset.theme;
    const words = themeWords[theme];
    word = getRandomWord(words);
    answerArray = Array(word.length).fill('_');
    remainingLetters = word.length;
    usedLetters.clear();

    // плавное скрытие темы
    themeSelection.style.transition = 'opacity 0.5s, height 0.5s, padding 0.5s';
    themeSelection.style.opacity = 0;
    themeSelection.style.height = 0;
    themeSelection.style.padding = 0;

    setTimeout(()=>{
      themeSelection.style.display='none';

      // убираем класс hidden у игры, чтобы она появилась
      gameContainer.classList.remove('hidden');

      // инициализация состояния игры
      guessWord.textContent = answerArray.join(' ');
      hideHumanParts();
      createKeyboard();
      lettersInput.disabled = false;
      buttonToVerif.disabled = false;
      buttonToVerif.style.display = 'inline-block';
    },500);
  });
});

// ====== СТАРТ ======
window.addEventListener('load', ()=>{
  hideHumanParts();
  guessWord.textContent = '';
});

// кнопка проверки
buttonToVerif.addEventListener('click', ()=>{
  const value = lettersInput.value.toLowerCase();
  const error = validateInput(value);
  if(error){
    gameMessage.innerHTML = error;
    buttonToVerif.disabled = true;
    return;
  }
  let btn = [...keyboardContainer.children].find(b=>b.textContent===value);
  handleLetter(value, btn);
  lettersInput.value = '';
  gameMessage.innerHTML = '';
  buttonToVerif.disabled = false;
});

// ввод с клавиатуры
lettersInput.addEventListener('input', ()=>{
  if(lettersInput.value.length <= 1){
    buttonToVerif.disabled = false;
    gameMessage.innerHTML = '';
  }
});
