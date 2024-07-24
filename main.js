let raceIntervalId = null;
let goalPos = 0;

class Cat {
  constructor($el, name, { x, y }) {
    this.$el = $el;
    this.name = name;
    this.$el.find('.cat-name').text(name);

    this.defaultPos = { x: x, y: y };
    this.pos = { x: x, y: y };
    this.warpToPos(this.pos);

    this.fallDownCount = 0;
    this.fallDownJudgementTimeCount = 0;

    this.randSpeed();
  }

  setCats(cats) {
    this.cats = cats;
  }

  getRank() {
    this.cats.sort((a, b) => b.pos.x - a.pos.x);
    return this.cats.index(this) + 1;
  }

  isTop() {
    return this.getRank() === 1;
  }

  isLast() {
    return this.getRank() === this.cats.length;
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

      if (this.speed < 0) {
        this.randSpeed();
        return;
      }

      const fallDownProbability = this.isTop() ? 0.6 : 0.3;
      const isFallDown = Math.random() < fallDownProbability;
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
    this.speed = (1 + Math.random() * 2) * goalPos / 1000;

    if (!!this.cats && this.isTop() && Math.random() < 0.5) {
      this.speed *= 0.5 * -1;
    }
    if (!!this.cats && this.isLast()) {
      this.speed *= 1.5;
    }
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
    if (cat.isTop()) {
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

  cats.each((_, cat) => {
    cat.setCats(cats);
  });

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
