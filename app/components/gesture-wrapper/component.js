import Component from '@ember/component';
import RecognizerMixin from 'ember-gestures/mixins/recognizers';

export default Component.extend(RecognizerMixin, {
  recognizers: 'swipe pan',

  currentPosition: 0,
  isDragging: false,
  isOpen: false,

  pan(e){
    const {
      deltaX,
      isFinal
    } = e.originalEvent.gesture;

    // TODO: only initiate when we started at the edge of the screen

    const sideMenuOffset = 80;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
    let targetOffset = deltaX * (sideMenuOffset / (windowWidth * 0.8));

    // add a dragging class so any css transitions are disabled
    if(!this.get('isDragging')){
      this.set('isDragging', true);
    }

    //TODO: clean this up
    // pass the new position
    if(this.get('isOpen')){
      // enforce limits on the offset [0, 80]
      if(targetOffset > 0){
        targetOffset = 0;
      } else if(targetOffset < -sideMenuOffset){
        targetOffset = -sideMenuOffset;
      }
      this.set('currentPosition', sideMenuOffset + targetOffset);
    } else {
      // enforce limits on the offset [0, 80]
      if(targetOffset < 0){
        targetOffset = 0;
      } else if(targetOffset > sideMenuOffset){
        targetOffset = sideMenuOffset;
      }
      this.set('currentPosition', targetOffset);
    }

    // the pan action is over, cleanup and set the correct final menu position
    if(isFinal && this.get('isDragging')){
      this.set('isDragging', false);

      if(    (!this.get('isOpen') && targetOffset > sideMenuOffset / 2)
          || ( this.get('isOpen') && -1 * targetOffset < sideMenuOffset / 2)
      ){
        this.set('currentPosition', sideMenuOffset);
        this.set('isOpen', true);
      } else {
        this.set('currentPosition', 0);
        this.set('isOpen', false);
      }

    }
  }
});
