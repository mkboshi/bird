class Game {
  /**
   * @param {object} images Ресурсы изображений, используемые игрой
   */
  constructor(images) {
    this.canvas = document.createElement('canvas');
    this.width = this.canvas.width = 700; // Ширина холста, в px.
    this.height = this.canvas.height = 1280; //Высота холста в px.
    this.context = this.canvas.getContext('2d');
    this.obstMinHeight = 380; // Минимальная высота препятствия внизу, в px
    this.obstMaxHeight = 700; // Максимальная высота препятствия внизу, в px.
    this.gapMinHeight = 280; // Минимальное расстояние между верхним и нижним препятствиями, в px.
    this.gapMaxHeight = 380; // Максимальное расстояние между верхним и нижним препятствиями, в px.
    this.obstTimeInterval = 4000; // Интервал времени генерации препятствия
    this.images = images;
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.bird = new Bird({
      context: this.context,
      image: this.images.bird
    });
    this.obstacles = [];
    this.ground = new Ground({
      context: this.context,
      image: this.images.ground
    });
    this.scoreboard = new Scoreboard({
      context: this.context,
      image: this.images.number,
      bird: this.bird,
      obstacles: this.obstacles
    });
  }

  /**
   * @desc Подготовить
   */
  getReady() {
    this.bird.reset();
    this.obstacles.length = 0;
    this.scoreboard.reset();

    let flag = true,  // Переключатель, который определяет, находится ли он в настоящее время в состоянии готовности
      cb = () => {
        this.canvas.removeEventListener('click', cb, false);
        flag = false;
      };
    this.canvas.addEventListener('click', cb, false);

    let frame = () => {
      this.readyFrame();
      if (flag) {
        window.requestAnimationFrame(frame);
      } else {
        this.play();
      }
    };

    frame();
  }

  /**
   * @desc Начинать
   */
  play() {
    this.lastObstTime = Date.now() - this.obstTimeInterval; // В последний раз, когда препятствие было создано, установите это значение в начале каждой игры перед интервалом создания препятствия.

    let cb = () => {
      this.bird.fly();
    };

    this.canvas.addEventListener('click', cb, false);

    let frame = () => {
      this.playFrame();

      if (this.checkCrash()) {
        this.canvas.removeEventListener('click', cb, false);
        this.crash();
      } else {
        window.requestAnimationFrame(frame);
      }
    };

    frame();
  }

  /**
   * @desc спустись
   */
  crash() {
    this.bird.crashConfig();

    let frame = () => {
      this.crashFrame();

      if (this.bird.ifCrashIntoGround()) {
        this.getResult();
      } else {
        window.requestAnimationFrame(frame);
      }
    };

    frame();
  }

  /**
   * @desc результат
   */
  getResult() {
    let flag = true,  // Переключатель, который определяет, находится ли текущее состояние в состоянии результата.
      canvas = this.canvas,
      cb = (e) => {
        // 坐标转换
        let x = e.offsetX / canvas.clientWidth * 720,
          y = e.offsetY / canvas.clientHeight * 1280;

        if (x > 228 && x < 492 && y > 700 && y < 850) { // координаты и размер кнопки：228, 700, 264, 150
          canvas.removeEventListener('click', cb, false);
          flag = false;
        }
      };

    window.addEventListener('click', cb, false);

    let frame = () => {
      this.resultFrame();
      if (flag) {
        window.requestAnimationFrame(frame);
      } else {
        this.getReady();
      }
    };

    frame();
  }

  /**
   * @desc Подготовка кадров игровой анимации
   */
  readyFrame() {
    this.clear();
    this.bird.flap().draw();
    this.ground.draw();
    this.context.drawImage(this.images.ready, 10, 15, 470, 135, 125, 300, 470, 135);  // get ready
    this.context.drawImage(this.images.ready, 0, 150, 286, 255, 217, 600, 286, 255);  // tap
  }

  /**
   * @desc Кадр анимации в игре
   */
  playFrame() {
    this.clear();

    // Очистить препятствия, вышедшие за левую границу
    if (this.obstacles.length !== 0) {
      let idx = this.obstacles.findIndex(obst => {
        return !obst.isOutOfView();
      });
      this.obstacles.splice(0, idx);
    }

    // Добавить препятствия
    if (Date.now() - this.lastObstTime > this.obstTimeInterval) {
      this.addTwoObstacles();
    }

    // Обновите положение оставшихся препятствий
    this.obstacles.forEach(obst => {
      obst.updatePosition().draw();
    });

    this.bird.flap().updatePosition().draw();
    this.ground.draw();
    this.scoreboard.count().draw();
  }

  /**
   * @desc падающий анимационный кадр
   */
  crashFrame() {
    this.clear();
    this.obstacles.forEach(obst => {
      obst.draw();
    });
    this.ground.draw();
    this.bird.updatePosition().draw();
    this.scoreboard.draw();
  }

  /**
   * @desc Результат показывает кадр анимации
   */
  resultFrame() {
    this.clear();
    this.obstacles.forEach(obst => {
      obst.draw();
    });
    this.ground.draw();
    // this.bird.draw();
    this.scoreboard.draw();
    this.context.drawImage(this.images.over, 15, 315, 484, 110, 118, 400, 484, 110);  // game over
    this.context.drawImage(this.images.over, 604, 2, 264, 150, 228, 700, 264, 150); // button
  }

  /**
   * @desc пустой холст
   */
  clear() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  /**
   * @desc Обнаруживает, сталкивается ли птица с препятствием или падает на землю.
   */
  checkCrash() {
    let bird = this.bird,
      obstacles = this.obstacles,
      crashed = false;
    for (let i = 0, len = obstacles.length; i < len; i++) {
      if (bird.ifCrashInto(obstacles[i])) {
        crashed = true;
        break;
      } else if (bird.x + bird.width < obstacles[i].x) {
        break;
      }
    }

    if (!crashed && this.bird.ifCrashIntoGround()) {
      crashed = true;
      console.log('crash into the ground');
    }

    return crashed;
  }

  /**
   * @desc Создайте пару нисходящих двух препятствий
   */
  addTwoObstacles() {
    this.lastObstTime = Date.now();
    let bottomObstHeight = this.obstMinHeight + Math.random() * (this.obstMaxHeight - this.obstMinHeight), // Высота препятствия ниже
      gapHeight = this.gapMinHeight + Math.random() * (this.gapMaxHeight - this.gapMinHeight), // Высота разделения препятствий
      topObstHeight = this.height - bottomObstHeight - gapHeight, // Высота препятствия выше
      bottomObstY = this.height - bottomObstHeight; // Координата Y препятствия внизу на холсте
    // Создавайте верхние и нижние препятствия и помещайте их в массив препятствий для единого управления.
    this.obstacles.push(new Obstacle({
      context: this.context,
      image: this.images.pipe,
      type: 'up',
      x: this.width,
      y: 0,
      width: 140,
      height: topObstHeight,
      speedX: 150
    }));
    this.obstacles.push(new Obstacle({
      context: this.context,
      image: this.images.pipe,
      type: 'down',
      x: this.width,
      y: bottomObstY,
      width: 140,
      height: bottomObstHeight,
      speedX: 150
    }));
  }
}
