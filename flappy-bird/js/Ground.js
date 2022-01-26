class Ground {
  /**
   * @param {object} контекст холста 2d контекст
   * @param {object} image ресурс изображения земли
   */
  constructor({context, image}) {
    this.context = context;
    this.image = image;
    this.startTime = Date.now();
  }

  draw() {
    let context = this.context,
      sx = ((Date.now() - this.startTime) % 300) / 300 * 60;  // Изображение смещается влево на 60px каждые 300 мс.
    context.save();
    context.drawImage(this.image, sx, 0, 720, 280, 0, 1000, 720, 280);
    context.restore();
  }
}