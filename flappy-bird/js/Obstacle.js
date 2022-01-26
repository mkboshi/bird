class Obstacle {
  /**
   * @param {object} context canvas 2d контекст
   * @param {object} image Имиджевые ресурсы препятствий
   * @param {string} type Тип препятствия {'вверху': верхнее препятствие, 'внизу': нижнее препятствие}, значение по умолчанию — "вверх".
   * @param {number} x Абсцисса левого верхнего угла препятствия
   * @param {number} y Вертикальная координата левого верхнего угла препятствия
   * @param {number} width Ширина препятствия в px.
   * @param {number} height Высота препятствия, в px.
   * @param {number} speedX Скорость препятствия в отрицательном направлении оси x, в px/s, по умолчанию 100px/s.
   * @param {number} canvasWidth Ширина холста в пикселях, значение по умолчанию 720 px.
   */
  constructor({context, image, type = 'up', x, y, width, height, speedX = 100, canvasWidth = 720}) {
    this.context = context;
    this.image = image;
    this.type = type;
    this.x = this.startX = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speedX = speedX;
    this.startTime = 0;
  }

  /**
   * @desc Обновите положение препятствия и перерисуйте его на холсте.
   */
  updatePosition() {
    if (!this.startTime) {
      this.startTime = Date.now();
    }
    this.x = this.startX - this.speedX * (Date.now() - this.startTime) / 1000;
    return this;
  }

  draw() {
    let context = this.context;
    context.save();
    if (this.type === 'up') {
      context.drawImage(this.image, 157, 819 - this.height, 133, this.height, this.x, this.y, this.width, this.height);
    } else {
      context.drawImage(this.image, 9, 0, 133, this.height, this.x, this.y, this.width, this.height);
    }
    context.restore();
  }

  /**
   * @desc Определить, полностью ли исчезло препятствие из поля зрения.
   * Если холст полностью переместился влево от оси Y холста, считается, что он полностью покинул поле зрения.
   * @return {логическое значение} {true: полностью вне поля зрения, false: не совсем вне поля зрения}.
   */
  isOutOfView() {
    return this.x < -this.width;
  }
}
