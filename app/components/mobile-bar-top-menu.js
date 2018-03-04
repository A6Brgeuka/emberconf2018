import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';

import { Promise } from 'rsvp';
import { timeout } from 'ember-concurrency'; //TODO: maybe import "wait" from ember-animated?
import opacity from 'ember-animated/motions/opacity';
import move from 'ember-animated/motions/move';
import { printSprites } from 'ember-animated';

let transitionsService;

export default Component.extend({
  btnLeftIconTransition,
  btnLeftTransition,
  titleTransition,
  btnRightTransition,

  router: service(),
  motion: service('-ea-motion'),
  transitions: service(),

  menuToggleComponent: null,

  init(){
    this._super(...arguments);

    transitionsService = get(this, 'transitions')
  }
});

function * btnLeftIconTransition({ insertedSprites, removedSprites, duration }) {
  removedSprites.forEach(sprite => { opacity(sprite, { to: 0, duration: duration / 2 }); });
  yield timeout(duration * 0.4); // prevents glitching the btnLeftTransition
  insertedSprites.forEach(sprite => { opacity(sprite, { to: 1, duration: duration * 0.6 }); });

}
function * btnLeftTransition({ receivedSprites, sentSprites }) {
  printSprites(arguments[0]);

  receivedSprites.forEach(sprite => {
    opacity(sprite, { from: 0, to: 1 });
    move(sprite);
  });

  sentSprites.forEach(sprite => {
    opacity(sprite, { to: 0 });
    move(sprite);
  });

}
function * btnRightTransition({ insertedSprites, removedSprites }) {
  removedSprites.forEach(sprite => {
    opacity(sprite, { to: 0 });
  });

  // delay right button fade in until other transitions are done
  if(insertedSprites){
    yield timeout(300);

    insertedSprites.forEach(sprite => {
      opacity(sprite, { to: 1 });
    });
  }
}

function titleTransition(){
  const oldRouteName = transitionsService.get('oldRouteName');
  const newRouteName = transitionsService.get('newRouteName');
  const transitionDirection = transitionsService.get('direction');

  //TODO: make this generic
  const withinRoute = oldRouteName.startsWith('home.settings') && newRouteName.startsWith('home.settings');

  if(withinRoute){
    const viewportWidth = document.body.clientWidth;

    return function * ({ insertedSprites, removedSprites, receivedSprites, sentSprites }) {
      printSprites(arguments[0]);

      receivedSprites.forEach(sprite => {
        opacity(sprite, { from: 0, to: 1 });
        move(sprite);
      });

      sentSprites.forEach(sprite => {
        opacity(sprite, { to: 0 });
        move(sprite);
      });

      if (transitionDirection === 'up') {
        removedSprites.forEach(sprite => {
          sprite.endAtPixel({x: viewportWidth});
          move(sprite);
          opacity(sprite, {to: 0});
        });
      }
      if (transitionDirection === 'down') {
        insertedSprites.forEach(sprite => {
          sprite.startAtPixel({x: viewportWidth});
          move(sprite);
          opacity(sprite, {from: 0, to: 1});
        });
      }
    };
  } else {
    return function * ({ insertedSprites, removedSprites, duration }) {
      yield Promise.all(removedSprites.map(
        sprite => opacity(sprite, { to: 0, duration: 0 })
      ));
      insertedSprites.forEach(sprite => {
        opacity(sprite, { from: 0, to: 1, duration: duration / 2 });
      });
    };
  }
}
