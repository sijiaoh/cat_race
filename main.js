let raceIntervalId = null;
let goalPos = 0;

class Cat {
  constructor($el, name, { x, y }) {
    this.$el = $el;
    this.$el.find('.cat-name').text(name);

    this.defaultPos = { x: x, y: y };
    this.pos = { x: x, y: y };
    this.warpToPos(this.pos);

    this.fallDownCount = 0;
    this.fallDownJudgementTimeCount = 0;

    this.randSpeed();
  }

  update() {
    if (this.fallDownCount > 0) {
      this.fallDownCount--;
      return;
    }

    this.run();

    this.fallDownJudgementTimeCount++;
    if (this.fallDownJudgementTimeCount > 100) {
      this.fallDownJudgementTimeCount = 0;

      const isFallDown = Math.random() < 0.3;
      if (!isFallDown) return;

      this.fallDown();
    }
  }

  isGoaled() {
    return this.pos.x > goalPos;
  }

  run() {
    this.$el.addClass('shaking');
    this.$el.removeClass('fall-down');
    this.warpToPos({ x: this.pos.x + this.speed, y: this.pos.y });
  }

  fallDown() {
      this.$el.removeClass('shaking');
      this.$el.addClass('fall-down');
      this.fallDownCount = 60;
      this.randSpeed();
  }

  randSpeed() {
    this.speed = 1 + Math.random() * 1;
  }

  warpToPos({ x, y }) {
    this.pos.x = x;
    this.pos.y = y;

    this.$el.css('top', this.pos.y + 'px');
    this.$el.css('left', this.pos.x + 'px');
  }
}

function goalCelebration(cats) {
  cats.each((_, cat) => {
    if (cat.isGoaled()) {
      cat.run();
    }
    else {
      cat.fallDown();
    }
  });
}

function startRace(names) {
  $('#race').show();

  const $goal = $('#goal');
  $goal.css('left', goalPos + 'px');

  const $cats = $('.cat')
  const cats = $cats.map((index, cat) => {
    const $cat = $(cat);

    const name = names[index];
    if (!name) {
      $cat.hide();
      return null;
    }

    return new Cat($cat, name, { x: 0, y: 150 * index });
  }).filter(cat => cat != null);

  raceIntervalId = setInterval(() => {
    cats.each((_, cat) => {
      cat.update();

      if (cat.isGoaled()) {
        clearInterval(raceIntervalId);
        goalCelebration(cats);
      }
    });
  }, 16);
}

$(() => {
  const windowWidth = $(window).width();
  goalPos = (windowWidth > 1000) ? 1000 : windowWidth * 0.8;

  $('#submit').on('click', () => {
    const names = $('.input-name').map((_, input) => $(input).val()).filter((_, name) => name != '');
    if (names.length <= 1) {
      alert('请输入至少两个选项！');
      return
    }

    $('#input').hide();
    startRace(names);
  });
});
