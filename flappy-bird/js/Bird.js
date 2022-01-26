class Bird {
  /**
   * @param {object} контекст холста 2d контекст
   * @param {object} image ресурс изображения птицы
   * @param {number} width ширина птицы
   * @param {number} height высота птицы
   * @param {number} v Начальная скорость всплытия, ед. px/s. Значение по умолчанию — 0 пикселей/с.
   * @param {number} flyV Скорость нарастания после каждого клика в px/s. По умолчанию -700px/s.
   * @param {number} a Гравитационное ускорение в px/s^2. Значение по умолчанию — 1400 пикселей/s^2.
   */
  constructor({
    context,
    image,
    width = 85,
    height = 60,
    v = 0,
    flyV = -700,
    a = 1400
  }) {
    this.context = context;
    this.image = image;
    this.width = width;
    this.height = height;
    this.configV = v;
    this.configFlyV = flyV;
    this.configA = a;

    this.yFloor = this.height / 2; //Нижний предел вертикальной координаты центральной точки птицы
    this.fly = this.fly.bind(this);
  }

  reset() {
    let canvas = this.context.canvas;

    this.x = 1.5 * this.width;  // Абсцисса центральной точки птицы
    this.y = canvas.height / 2;  //Вертикальная координата центральной точки птицы
    this.v = this.configV;
    this.flyV = this.configFlyV;
    this.a = this.configA;
    this.yCeil = canvas.height - 280 - this.height / 2 ; // Верхний предел вертикальной координаты центральной точки птицы
    this.sy = 0;  // Возьмите ординату начальной точки изображения на исходном изображении
    this.startTime = Date.now();
    this.updateTime = 0;
  }

  /**
   * @desc порхать
   */
  flap() {
    // порхать: вверх → посередине → вниз → посередине → вверх → посередине → вниз → посередине
    // Полный процесс флэппинга состоит из 4 кадров
    // 10 кадров/с
    let frame = Math.floor((Date.now() - this.startTime) / 100) % 4;
    if (frame === 3) {
      frame = 1;
    }
    this.sy = 60 * frame;
    return this;
  }

  /**
   * @desc Обновить положение птицы
   */
  updatePosition() {
    if (!this.updateTime) {
      this.updateTime = Date.now();
    }

    let now = Date.now(),
      t = (now - this.updateTime) / 1000;
    this.updateTime = now;

    this.y = this.y + this.v * t + 0.5 * this.a * t * t;
    this.v += this.a * t;

    if (this.y < this.yFloor) {
      this.y = this.yFloor;
      this.v = 0;
    } else if (this.y > this.yCeil) {
      this.y = this.yCeil;
      this.v = 0;
    }
    return this;
  }

  /**
   * @desc рисуем птицу на холсте
   */
  draw() {
    let context = this.context;
    context.save();
    context.translate(this.x, this.y);
    context.drawImage(this.image, 0, this.sy, 88, 60, -this.width / 2, -this.height / 2, this.width, this.height);
    context.restore();
  }

  fly() {
    this.v = this.flyV;
  }

  /**
   * @desc Включить настройку после удара
   */
  crashConfig() {
    this.yCeil = 1280 + this.height / 2;
    this.sy = 60;
    this.v = this.flyV * 2;
    this.a = this.a * 3;
  }

  /**
   * @desc, чтобы определить, столкнулся ли он с указанным препятствием
   * @param {object} препятствие объект препятствия
   * @return {логическое значение} {true: столкновение произошло, false: столкновение не произошло}
   */
  ifCrashInto(obstacle) {
    if (
      (this.x - this.width / 2 > obstacle.x + obstacle.width) ||
      (this.x + this.width / 2 < obstacle.x + 7) ||   // Конец трубки более широкий, специальная обработка
      (this.y - this.height / 2 > obstacle.y + obstacle.height) ||
      (this.y + this.height / 2 < obstacle.y)
    ) {
      return false;
    }
    console.log('crash into an obstacle');
    return true;
  }

  /**
   * @desc, чтобы определить, упал ли он на землю
   * @return {логическое значение} {true: упал на землю, false: не упал на землю}
   */
  ifCrashIntoGround() {
    return this.y >= this.yCeil;
  }
}
