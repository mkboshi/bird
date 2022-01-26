class Scoreboard {
  /**
   * @param {object} контекст холста 2d контекст
   * @param {object} image ресурс изображения земли
   * @param {object} птица экземпляр птицы
   * @param {массив} препятствия массив управления препятствиями
   */
  constructor({context, image, bird, obstacles}) {
    this.context = context;
    this.image = image;
    this.bird = bird;
    this.obstacles = obstacles;
    this.score = 0;
    this.numberX = [0, 61, 121, 191, 261, 331, 401, 471, 541, 611]; //Цифры 0-9 на картинке по оси абсцисс
    this.numberY = 0;   // Ордината числа на картинке
    this.numberWidth = 60;    //ширина одной цифры
    this.numberHeight = 91;   // однозначная высота
  }

  reset() {
    this.score = 0;
  }

  /**
   * @desc подсчет очков
   */
  count() {
    let obstacles = this.obstacles,
      bird = this.bird;
    if (obstacles.length > 0) {
      for (let i = 0, len = obstacles.length; i < len; i += 2) {
        let obst = obstacles[i];
        if (!obst.counted && (bird.x - bird.width / 2) > (obst.x + obst.width)) {   // Текущее препятствие не засчитывается и находится позади птицы
          obst.counted = true;
          this.score++;
          console.log(this.score);
        } else if ((bird.x + bird.width / 2) < obst.x) {  // Текущее препятствие находится перед птицей
          break;
        }
      }
    }
    return this;
  }

  draw() {
    let context = this.context,
      numsArr = this.score.toString().split(''),  // Преобразование текущего счета в массив одиночных чисел
      len = numsArr.length,
      startX = (context.canvas.width - len * this.numberWidth) / 2;   // Начните рисовать абсциссу числа
    for (let i = 0; i < len; i++) {
      context.drawImage(this.image, this.numberX[+numsArr[i]], this.numberY, this.numberWidth, this.numberHeight, startX + i * this.numberWidth, 100, this.numberWidth, this.numberHeight);
    }
  }
}