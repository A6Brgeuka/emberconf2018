import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

import trackPan from 'ember-fastboot-blog/motions/track-pan';
import move from 'ember-animated/motions/move';

let transitionsService;

export default Controller.extend({
  transition,

  transitions: service(),

  init(){
    this._super(...arguments);

    transitionsService = this.get('transitions')
  },

  actions: {
    save(){
      console.log('Account save action was called!');
    }
  }
});

function transition(){
  const oldRouteName = transitionsService.get('oldRouteName');
  const newRouteName = transitionsService.get('newRouteName');

  const withinRoute = oldRouteName.startsWith('home.settings') && newRouteName.startsWith('home.settings');

  if(withinRoute){
    return function * ({ insertedSprites, removedSprites }) {
      insertedSprites.forEach(sprite => {
        sprite.startTranslatedBy(window.outerWidth, 0);
        //sprite.startAtPixel({ x: window.outerWidth });
        move(sprite);
      });

      removedSprites.forEach(sprite => {
        sprite.endAtPixel({ x: window.outerWidth });
        //sprite.endTranslatedBy(window.outerWidth, 0);
        //move(sprite);
        //TODO: apply scroll
        trackPan(sprite);
      });
    }

  }
}
