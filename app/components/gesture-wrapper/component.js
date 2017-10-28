import Component from '@ember/component';
import { computed } from '@ember/object';
import $ from 'jquery';
import RecognizerMixin from 'ember-gestures/mixins/recognizers';

export default Component.extend(RecognizerMixin, {
  recognizers: 'pan',

  openDetectionWidth: 10,
  sideMenuOffset: 85,
  currentPosition: 0,
  isDragging: false,

  deltaXCorrection: 0,

  _isOpen: false,
  isOpen: computed('_isOpen', {
    get(){
      return this.get('_isOpen');
    },
    set(key, value){
      if(value){
        $('body').addClass('side-menu-open');
      } else {
        $('body').removeClass('side-menu-open');
      }

      this.set('_isOpen', value);
      return value;
    }
  }),

  open() {
    this.set('isDragging', false);
    this.set('currentPosition', this.get('sideMenuOffset'));
    this.set('isOpen', true);
  },
  close() {
    this.set('isDragging', false);
    this.set('currentPosition', 0);
    this.set('isOpen', false);
  },

  actions: {
    toggle(){
      if(this.get('isOpen')){
        this.close();
      } else {
        this.open();
      }
    }
  },

  _getWindowWidth(){
    return window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
  },

  panStart(e){
    const {
      center
    } = e.originalEvent.gesture;

    const windowWidth = this._getWindowWidth();
    const startOffset = 100 * center.x / windowWidth;

    // add a dragging class so any css transitions are disabled
    // and the pan event is enabled
    if(!this.get('isOpen')){
      // only detect initial drag from left side of the window
      if(startOffset < this.get('openDetectionWidth')){
        this.set('isDragging', true);
      }
    }
  },

  pan(e){
    const {
      deltaX,
      isFinal,
      additionalEvent,
      overallVelocityX,
      center
    } = e.originalEvent.gesture;

    // workaround for https://github.com/hammerjs/hammer.js/issues/1132
    if (center.x === 0 && center.y === 0) return;

    const windowWidth = this._getWindowWidth();
    const sideMenuOffset = this.get('sideMenuOffset');

    if(this.get('isOpen') && !this.get('isDragging')){
      // start drag when center.x is at the menu edge
      const cursorPosition = 100 * center.x / windowWidth;

      // calculate and set a correction delta if the pan started outside the opened menu
      if(cursorPosition < sideMenuOffset) {
        this.set('isDragging', true);
        this.set('deltaXCorrection', 100 * deltaX / windowWidth);
      }
    }

    if(this.get('isDragging')){
      // TODO: limit size & disable drag for desktop
      //    (set sideMenuOffset to pixel value and use deltaX directly instead of mapping to vw)

      const triggerVelocity = 0.25;
      let targetOffset = 100 * deltaX / windowWidth;

      if(isFinal && this.get('isDragging')){
        // when overall horizontal velocity is high, force open/close and skip the rest
        if(
             !this.get('isOpen')
          && overallVelocityX > triggerVelocity
          && additionalEvent === 'panright'
        ){
          // force open
          this.open();
          return;
        } else if(
             this.get('isOpen')
          && overallVelocityX < -1 * triggerVelocity
          && additionalEvent === 'panleft'
        ){
          // force close
          this.close();
          return;
        }
        // the pan action is over, cleanup and set the correct final menu position
        if(    (!this.get('isOpen') && targetOffset > sideMenuOffset / 2)
          || ( this.get('isOpen') && -1 * targetOffset < sideMenuOffset / 2)
        ){
          this.open();
        } else {
          this.close();
        }
      } else {
        // pass the new position taking limits into account
        if(this.get('isOpen')){
          const cursorPosition = 100 * center.x / windowWidth;

          // correct targetOffset with deltaXCorrection set earlier
          targetOffset -= this.get('deltaXCorrection');

          // enforce limits on the offset [0, sideMenuOffset]
          if(cursorPosition < sideMenuOffset){
            if(targetOffset > 0){
              targetOffset = 0;
            } else if(targetOffset < -1 * sideMenuOffset){
              targetOffset = -1 * sideMenuOffset;
            }
            this.set('currentPosition', sideMenuOffset + targetOffset);
          }
        } else {
          // enforce limits on the offset [0, sideMenuOffset]
          if(targetOffset < 0){
            targetOffset = 0;
          } else if(targetOffset > sideMenuOffset){
            targetOffset = sideMenuOffset;
          }
          this.set('currentPosition', targetOffset);
        }
      }
    }
  },

  panEnd(e) {
    this.set('deltaXCorrection', 0);
  }
});
