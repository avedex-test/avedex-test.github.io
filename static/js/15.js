(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[15],{

/***/ "./node_modules/draggabilly/draggabilly.js":
/*!*************************************************!*\
  !*** ./node_modules/draggabilly/draggabilly.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*!\n * Draggabilly v3.0.0\n * Make that shiz draggable\n * https://draggabilly.desandro.com\n * MIT license\n */\n\n( function( window, factory ) {\n  // universal module definition\n  if (  true && module.exports ) {\n    // CommonJS\n    module.exports = factory(\n        window,\n        __webpack_require__(/*! get-size */ \"./node_modules/get-size/get-size.js\"),\n        __webpack_require__(/*! unidragger */ \"./node_modules/unidragger/unidragger.js\"),\n    );\n  } else {\n    // browser global\n    window.Draggabilly = factory(\n        window,\n        window.getSize,\n        window.Unidragger,\n    );\n  }\n\n}( typeof window != 'undefined' ? window : this,\n    function factory( window, getSize, Unidragger ) {\n\n// -------------------------- helpers & variables -------------------------- //\n\nfunction noop() {}\n\nlet jQuery = window.jQuery;\n\n// -------------------------- Draggabilly -------------------------- //\n\nfunction Draggabilly( element, options ) {\n  // querySelector if string\n  this.element = typeof element == 'string' ?\n    document.querySelector( element ) : element;\n\n  if ( jQuery ) {\n    this.$element = jQuery( this.element );\n  }\n\n  // options\n  this.options = {};\n  this.option( options );\n\n  this._create();\n}\n\n// inherit Unidragger methods\nlet proto = Draggabilly.prototype = Object.create( Unidragger.prototype );\n\n/**\n * set options\n * @param {Object} opts\n */\nproto.option = function( opts ) {\n  this.options = {\n    ...this.options,\n    ...opts,\n  };\n};\n\n// css position values that don't need to be set\nconst positionValues = [ 'relative', 'absolute', 'fixed' ];\n\nproto._create = function() {\n  // properties\n  this.position = {};\n  this._getPosition();\n\n  this.startPoint = { x: 0, y: 0 };\n  this.dragPoint = { x: 0, y: 0 };\n\n  this.startPosition = { ...this.position };\n\n  // set relative positioning\n  let style = getComputedStyle( this.element );\n  if ( !positionValues.includes( style.position ) ) {\n    this.element.style.position = 'relative';\n  }\n\n  // events\n  this.on( 'pointerDown', this.handlePointerDown );\n  this.on( 'pointerUp', this.handlePointerUp );\n  this.on( 'dragStart', this.handleDragStart );\n  this.on( 'dragMove', this.handleDragMove );\n  this.on( 'dragEnd', this.handleDragEnd );\n\n  this.setHandles();\n  this.enable();\n};\n\n// set this.handles  and bind start events to 'em\nproto.setHandles = function() {\n  let { handle } = this.options;\n  if ( typeof handle == 'string' ) {\n    this.handles = this.element.querySelectorAll( handle );\n  } else if ( typeof handle == 'object' && handle.length ) {\n    this.handles = handle;\n  } else if ( handle instanceof HTMLElement ) {\n    this.handles = [ handle ];\n  } else {\n    this.handles = [ this.element ];\n  }\n};\n\nconst cancelableEvents = [ 'dragStart', 'dragMove', 'dragEnd' ];\n\n// duck-punch emitEvent to dispatch jQuery events as well\nlet emitEvent = proto.emitEvent;\nproto.emitEvent = function( eventName, args ) {\n  // do not emit cancelable events if dragging is disabled\n  let isCanceled = !this.isEnabled && cancelableEvents.includes( eventName );\n  if ( isCanceled ) return;\n\n  emitEvent.call( this, eventName, args );\n\n  // trigger jQuery event\n  let jquery = window.jQuery;\n  if ( !jquery || !this.$element ) return;\n  // create jQuery event\n  let event;\n  let jqArgs = args;\n  let isFirstArgEvent = args && args[0] instanceof Event;\n  if ( isFirstArgEvent ) [ event, ...jqArgs ] = args;\n  /* eslint-disable-next-line new-cap */\n  let $event = jquery.Event( event );\n  $event.type = eventName;\n  this.$element.trigger( $event, jqArgs );\n};\n\n// -------------------------- position -------------------------- //\n\n// get x/y position from style\nproto._getPosition = function() {\n  let style = getComputedStyle( this.element );\n  let x = this._getPositionCoord( style.left, 'width' );\n  let y = this._getPositionCoord( style.top, 'height' );\n  // clean up 'auto' or other non-integer values\n  this.position.x = isNaN( x ) ? 0 : x;\n  this.position.y = isNaN( y ) ? 0 : y;\n\n  this._addTransformPosition( style );\n};\n\nproto._getPositionCoord = function( styleSide, measure ) {\n  if ( styleSide.includes('%') ) {\n    // convert percent into pixel for Safari, #75\n    let parentSize = getSize( this.element.parentNode );\n    // prevent not-in-DOM element throwing bug, #131\n    return !parentSize ? 0 :\n      ( parseFloat( styleSide ) / 100 ) * parentSize[ measure ];\n  }\n  return parseInt( styleSide, 10 );\n};\n\n// add transform: translate( x, y ) to position\nproto._addTransformPosition = function( style ) {\n  let transform = style.transform;\n  // bail out if value is 'none'\n  if ( !transform.startsWith('matrix') ) return;\n\n  // split matrix(1, 0, 0, 1, x, y)\n  let matrixValues = transform.split(',');\n  // translate X value is in 12th or 4th position\n  let xIndex = transform.startsWith('matrix3d') ? 12 : 4;\n  let translateX = parseInt( matrixValues[ xIndex ], 10 );\n  // translate Y value is in 13th or 5th position\n  let translateY = parseInt( matrixValues[ xIndex + 1 ], 10 );\n  this.position.x += translateX;\n  this.position.y += translateY;\n};\n\n// -------------------------- events -------------------------- //\n\nproto.handlePointerDown = function( event, pointer ) {\n  if ( !this.isEnabled ) return;\n  // track start event position\n  // Safari 9 overrides pageX and pageY. These values needs to be copied. flickity#842\n  this.pointerDownPointer = {\n    pageX: pointer.pageX,\n    pageY: pointer.pageY,\n  };\n\n  event.preventDefault();\n  document.activeElement.blur();\n  // bind move and end events\n  this.bindActivePointerEvents( event );\n  this.element.classList.add('is-pointer-down');\n};\n\nproto.handleDragStart = function() {\n  if ( !this.isEnabled ) return;\n\n  this._getPosition();\n  this.measureContainment();\n  // position _when_ drag began\n  this.startPosition.x = this.position.x;\n  this.startPosition.y = this.position.y;\n  // reset left/top style\n  this.setLeftTop();\n\n  this.dragPoint.x = 0;\n  this.dragPoint.y = 0;\n\n  this.element.classList.add('is-dragging');\n  // start animation\n  this.animate();\n};\n\nproto.measureContainment = function() {\n  let container = this.getContainer();\n  if ( !container ) return;\n\n  let elemSize = getSize( this.element );\n  let containerSize = getSize( container );\n  let {\n    borderLeftWidth,\n    borderRightWidth,\n    borderTopWidth,\n    borderBottomWidth,\n  } = containerSize;\n  let elemRect = this.element.getBoundingClientRect();\n  let containerRect = container.getBoundingClientRect();\n\n  let borderSizeX = borderLeftWidth + borderRightWidth;\n  let borderSizeY = borderTopWidth + borderBottomWidth;\n\n  let position = this.relativeStartPosition = {\n    x: elemRect.left - ( containerRect.left + borderLeftWidth ),\n    y: elemRect.top - ( containerRect.top + borderTopWidth ),\n  };\n\n  this.containSize = {\n    width: ( containerSize.width - borderSizeX ) - position.x - elemSize.width,\n    height: ( containerSize.height - borderSizeY ) - position.y - elemSize.height,\n  };\n};\n\nproto.getContainer = function() {\n  let containment = this.options.containment;\n  if ( !containment ) return;\n\n  let isElement = containment instanceof HTMLElement;\n  // use as element\n  if ( isElement ) return containment;\n\n  // querySelector if string\n  if ( typeof containment == 'string' ) {\n    return document.querySelector( containment );\n  }\n  // fallback to parent element\n  return this.element.parentNode;\n};\n\n// ----- move event ----- //\n\n/**\n * drag move\n * @param {Event} event\n * @param {Event | Touch} pointer\n * @param {Object} moveVector - x and y coordinates\n */\nproto.handleDragMove = function( event, pointer, moveVector ) {\n  if ( !this.isEnabled ) return;\n\n  let dragX = moveVector.x;\n  let dragY = moveVector.y;\n\n  let grid = this.options.grid;\n  let gridX = grid && grid[0];\n  let gridY = grid && grid[1];\n\n  dragX = applyGrid( dragX, gridX );\n  dragY = applyGrid( dragY, gridY );\n\n  dragX = this.containDrag( 'x', dragX, gridX );\n  dragY = this.containDrag( 'y', dragY, gridY );\n\n  // constrain to axis\n  dragX = this.options.axis == 'y' ? 0 : dragX;\n  dragY = this.options.axis == 'x' ? 0 : dragY;\n\n  this.position.x = this.startPosition.x + dragX;\n  this.position.y = this.startPosition.y + dragY;\n  // set dragPoint properties\n  this.dragPoint.x = dragX;\n  this.dragPoint.y = dragY;\n};\n\nfunction applyGrid( value, grid, method ) {\n  if ( !grid ) return value;\n\n  method = method || 'round';\n  return Math[ method ]( value/grid ) * grid;\n}\n\nproto.containDrag = function( axis, drag, grid ) {\n  if ( !this.options.containment ) return drag;\n\n  let measure = axis == 'x' ? 'width' : 'height';\n\n  let rel = this.relativeStartPosition[ axis ];\n  let min = applyGrid( -rel, grid, 'ceil' );\n  let max = this.containSize[ measure ];\n  max = applyGrid( max, grid, 'floor' );\n  return Math.max( min, Math.min( max, drag ) );\n};\n\n// ----- end event ----- //\n\nproto.handlePointerUp = function() {\n  this.element.classList.remove('is-pointer-down');\n};\n\nproto.handleDragEnd = function() {\n  if ( !this.isEnabled ) return;\n\n  // use top left position when complete\n  this.element.style.transform = '';\n  this.setLeftTop();\n  this.element.classList.remove('is-dragging');\n};\n\n// -------------------------- animation -------------------------- //\n\nproto.animate = function() {\n  // only render and animate if dragging\n  if ( !this.isDragging ) return;\n\n  this.positionDrag();\n  requestAnimationFrame( () => this.animate() );\n};\n\n// left/top positioning\nproto.setLeftTop = function() {\n  let { x, y } = this.position;\n  this.element.style.left = `${x}px`;\n  this.element.style.top = `${y}px`;\n};\n\nproto.positionDrag = function() {\n  let { x, y } = this.dragPoint;\n  this.element.style.transform = `translate3d(${x}px, ${y}px, 0)`;\n};\n\n// ----- methods ----- //\n\n/**\n * @param {Number} x\n * @param {Number} y\n */\nproto.setPosition = function( x, y ) {\n  this.position.x = x;\n  this.position.y = y;\n  this.setLeftTop();\n};\n\nproto.enable = function() {\n  if ( this.isEnabled ) return;\n  this.isEnabled = true;\n  this.bindHandles();\n};\n\nproto.disable = function() {\n  if ( !this.isEnabled ) return;\n  this.isEnabled = false;\n  if ( this.isDragging ) this.dragEnd();\n  this.unbindHandles();\n};\n\nconst resetCssProperties = [ 'transform', 'left', 'top', 'position' ];\n\nproto.destroy = function() {\n  this.disable();\n  // reset styles\n  resetCssProperties.forEach( ( prop ) => {\n    this.element.style[ prop ] = '';\n  } );\n  // unbind handles\n  this.unbindHandles();\n  // remove jQuery data\n  if ( this.$element ) this.$element.removeData('draggabilly');\n};\n\n// ----- jQuery bridget ----- //\n\n// required for jQuery bridget\nproto._init = noop;\n\nif ( jQuery && jQuery.bridget ) {\n  jQuery.bridget( 'draggabilly', Draggabilly );\n}\n\n// -----  ----- //\n\nreturn Draggabilly;\n\n} ) );\n\n\n//# sourceURL=webpack:///./node_modules/draggabilly/draggabilly.js?");

/***/ }),

/***/ "./node_modules/ev-emitter/ev-emitter.js":
/*!***********************************************!*\
  !*** ./node_modules/ev-emitter/ev-emitter.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/**\n * EvEmitter v2.1.1\n * Lil' event emitter\n * MIT License\n */\n\n( function( global, factory ) {\n  // universal module definition\n  if (  true && module.exports ) {\n    // CommonJS - Browserify, Webpack\n    module.exports = factory();\n  } else {\n    // Browser globals\n    global.EvEmitter = factory();\n  }\n\n}( typeof window != 'undefined' ? window : this, function() {\n\nfunction EvEmitter() {}\n\nlet proto = EvEmitter.prototype;\n\nproto.on = function( eventName, listener ) {\n  if ( !eventName || !listener ) return this;\n\n  // set events hash\n  let events = this._events = this._events || {};\n  // set listeners array\n  let listeners = events[ eventName ] = events[ eventName ] || [];\n  // only add once\n  if ( !listeners.includes( listener ) ) {\n    listeners.push( listener );\n  }\n\n  return this;\n};\n\nproto.once = function( eventName, listener ) {\n  if ( !eventName || !listener ) return this;\n\n  // add event\n  this.on( eventName, listener );\n  // set once flag\n  // set onceEvents hash\n  let onceEvents = this._onceEvents = this._onceEvents || {};\n  // set onceListeners object\n  let onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};\n  // set flag\n  onceListeners[ listener ] = true;\n\n  return this;\n};\n\nproto.off = function( eventName, listener ) {\n  let listeners = this._events && this._events[ eventName ];\n  if ( !listeners || !listeners.length ) return this;\n\n  let index = listeners.indexOf( listener );\n  if ( index != -1 ) {\n    listeners.splice( index, 1 );\n  }\n\n  return this;\n};\n\nproto.emitEvent = function( eventName, args ) {\n  let listeners = this._events && this._events[ eventName ];\n  if ( !listeners || !listeners.length ) return this;\n\n  // copy over to avoid interference if .off() in listener\n  listeners = listeners.slice( 0 );\n  args = args || [];\n  // once stuff\n  let onceListeners = this._onceEvents && this._onceEvents[ eventName ];\n\n  for ( let listener of listeners ) {\n    let isOnce = onceListeners && onceListeners[ listener ];\n    if ( isOnce ) {\n      // remove listener\n      // remove before trigger to prevent recursion\n      this.off( eventName, listener );\n      // unset once flag\n      delete onceListeners[ listener ];\n    }\n    // trigger listener\n    listener.apply( this, args );\n  }\n\n  return this;\n};\n\nproto.allOff = function() {\n  delete this._events;\n  delete this._onceEvents;\n  return this;\n};\n\nreturn EvEmitter;\n\n} ) );\n\n\n//# sourceURL=webpack:///./node_modules/ev-emitter/ev-emitter.js?");

/***/ }),

/***/ "./node_modules/get-size/get-size.js":
/*!*******************************************!*\
  !*** ./node_modules/get-size/get-size.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*!\n * Infinite Scroll v2.0.4\n * measure size of elements\n * MIT license\n */\n\n( function( window, factory ) {\n  if (  true && module.exports ) {\n    // CommonJS\n    module.exports = factory();\n  } else {\n    // browser global\n    window.getSize = factory();\n  }\n\n} )( window, function factory() {\n\n// -------------------------- helpers -------------------------- //\n\n// get a number from a string, not a percentage\nfunction getStyleSize( value ) {\n  let num = parseFloat( value );\n  // not a percent like '100%', and a number\n  let isValid = value.indexOf('%') == -1 && !isNaN( num );\n  return isValid && num;\n}\n\n// -------------------------- measurements -------------------------- //\n\nlet measurements = [\n  'paddingLeft',\n  'paddingRight',\n  'paddingTop',\n  'paddingBottom',\n  'marginLeft',\n  'marginRight',\n  'marginTop',\n  'marginBottom',\n  'borderLeftWidth',\n  'borderRightWidth',\n  'borderTopWidth',\n  'borderBottomWidth',\n];\n\nlet measurementsLength = measurements.length;\n\nfunction getZeroSize() {\n  let size = {\n    width: 0,\n    height: 0,\n    innerWidth: 0,\n    innerHeight: 0,\n    outerWidth: 0,\n    outerHeight: 0,\n  };\n  measurements.forEach( ( measurement ) => {\n    size[ measurement ] = 0;\n  } );\n  return size;\n}\n\n// -------------------------- getSize -------------------------- //\n\nfunction getSize( elem ) {\n  // use querySeletor if elem is string\n  if ( typeof elem == 'string' ) elem = document.querySelector( elem );\n\n  // do not proceed on non-objects\n  let isElement = elem && typeof elem == 'object' && elem.nodeType;\n  if ( !isElement ) return;\n\n  let style = getComputedStyle( elem );\n\n  // if hidden, everything is 0\n  if ( style.display == 'none' ) return getZeroSize();\n\n  let size = {};\n  size.width = elem.offsetWidth;\n  size.height = elem.offsetHeight;\n\n  let isBorderBox = size.isBorderBox = style.boxSizing == 'border-box';\n\n  // get all measurements\n  measurements.forEach( ( measurement ) => {\n    let value = style[ measurement ];\n    let num = parseFloat( value );\n    // any 'auto', 'medium' value will be 0\n    size[ measurement ] = !isNaN( num ) ? num : 0;\n  } );\n\n  let paddingWidth = size.paddingLeft + size.paddingRight;\n  let paddingHeight = size.paddingTop + size.paddingBottom;\n  let marginWidth = size.marginLeft + size.marginRight;\n  let marginHeight = size.marginTop + size.marginBottom;\n  let borderWidth = size.borderLeftWidth + size.borderRightWidth;\n  let borderHeight = size.borderTopWidth + size.borderBottomWidth;\n\n  // overwrite width and height if we can get it from style\n  let styleWidth = getStyleSize( style.width );\n  if ( styleWidth !== false ) {\n    size.width = styleWidth +\n      // add padding and border unless it's already including it\n      ( isBorderBox ? 0 : paddingWidth + borderWidth );\n  }\n\n  let styleHeight = getStyleSize( style.height );\n  if ( styleHeight !== false ) {\n    size.height = styleHeight +\n      // add padding and border unless it's already including it\n      ( isBorderBox ? 0 : paddingHeight + borderHeight );\n  }\n\n  size.innerWidth = size.width - ( paddingWidth + borderWidth );\n  size.innerHeight = size.height - ( paddingHeight + borderHeight );\n\n  size.outerWidth = size.width + marginWidth;\n  size.outerHeight = size.height + marginHeight;\n\n  return size;\n}\n\nreturn getSize;\n\n} );\n\n\n//# sourceURL=webpack:///./node_modules/get-size/get-size.js?");

/***/ }),

/***/ "./node_modules/unidragger/unidragger.js":
/*!***********************************************!*\
  !*** ./node_modules/unidragger/unidragger.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*!\n * Unidragger v3.0.1\n * Draggable base class\n * MIT license\n */\n\n( function( window, factory ) {\n  // universal module definition\n  if (  true && module.exports ) {\n    // CommonJS\n    module.exports = factory(\n        window,\n        __webpack_require__(/*! ev-emitter */ \"./node_modules/ev-emitter/ev-emitter.js\"),\n    );\n  } else {\n    // browser global\n    window.Unidragger = factory(\n        window,\n        window.EvEmitter,\n    );\n  }\n\n}( typeof window != 'undefined' ? window : this, function factory( window, EvEmitter ) {\n\nfunction Unidragger() {}\n\n// inherit EvEmitter\nlet proto = Unidragger.prototype = Object.create( EvEmitter.prototype );\n\n// ----- bind start ----- //\n\n// trigger handler methods for events\nproto.handleEvent = function( event ) {\n  let method = 'on' + event.type;\n  if ( this[ method ] ) {\n    this[ method ]( event );\n  }\n};\n\nlet startEvent, activeEvents;\nif ( 'ontouchstart' in window ) {\n  // HACK prefer Touch Events as you can preventDefault on touchstart to\n  // disable scroll in iOS & mobile Chrome metafizzy/flickity#1177\n  startEvent = 'touchstart';\n  activeEvents = [ 'touchmove', 'touchend', 'touchcancel' ];\n} else if ( window.PointerEvent ) {\n  // Pointer Events\n  startEvent = 'pointerdown';\n  activeEvents = [ 'pointermove', 'pointerup', 'pointercancel' ];\n} else {\n  // mouse events\n  startEvent = 'mousedown';\n  activeEvents = [ 'mousemove', 'mouseup' ];\n}\n\n// prototype so it can be overwriteable by Flickity\nproto.touchActionValue = 'none';\n\nproto.bindHandles = function() {\n  this._bindHandles( 'addEventListener', this.touchActionValue );\n};\n\nproto.unbindHandles = function() {\n  this._bindHandles( 'removeEventListener', '' );\n};\n\n/**\n * Add or remove start event\n * @param {String} bindMethod - addEventListener or removeEventListener\n * @param {String} touchAction - value for touch-action CSS property\n */\nproto._bindHandles = function( bindMethod, touchAction ) {\n  this.handles.forEach( ( handle ) => {\n    handle[ bindMethod ]( startEvent, this );\n    handle[ bindMethod ]( 'click', this );\n    // touch-action: none to override browser touch gestures. metafizzy/flickity#540\n    if ( window.PointerEvent ) handle.style.touchAction = touchAction;\n  } );\n};\n\nproto.bindActivePointerEvents = function() {\n  activeEvents.forEach( ( eventName ) => {\n    window.addEventListener( eventName, this );\n  } );\n};\n\nproto.unbindActivePointerEvents = function() {\n  activeEvents.forEach( ( eventName ) => {\n    window.removeEventListener( eventName, this );\n  } );\n};\n\n// ----- event handler helpers ----- //\n\n// trigger method with matching pointer\nproto.withPointer = function( methodName, event ) {\n  if ( event.pointerId === this.pointerIdentifier ) {\n    this[ methodName ]( event, event );\n  }\n};\n\n// trigger method with matching touch\nproto.withTouch = function( methodName, event ) {\n  let touch;\n  for ( let changedTouch of event.changedTouches ) {\n    if ( changedTouch.identifier === this.pointerIdentifier ) {\n      touch = changedTouch;\n    }\n  }\n  if ( touch ) this[ methodName ]( event, touch );\n};\n\n// ----- start event ----- //\n\nproto.onmousedown = function( event ) {\n  this.pointerDown( event, event );\n};\n\nproto.ontouchstart = function( event ) {\n  this.pointerDown( event, event.changedTouches[0] );\n};\n\nproto.onpointerdown = function( event ) {\n  this.pointerDown( event, event );\n};\n\n// nodes that have text fields\nconst cursorNodes = [ 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION' ];\n// input types that do not have text fields\nconst clickTypes = [ 'radio', 'checkbox', 'button', 'submit', 'image', 'file' ];\n\n/**\n * any time you set `event, pointer` it refers to:\n * @param {Event} event\n * @param {Event | Touch} pointer\n */\nproto.pointerDown = function( event, pointer ) {\n  // dismiss multi-touch taps, right clicks, and clicks on text fields\n  let isCursorNode = cursorNodes.includes( event.target.nodeName );\n  let isClickType = clickTypes.includes( event.target.type );\n  let isOkayElement = !isCursorNode || isClickType;\n  let isOkay = !this.isPointerDown && !event.button && isOkayElement;\n  if ( !isOkay ) return;\n\n  this.isPointerDown = true;\n  // save pointer identifier to match up touch events\n  this.pointerIdentifier = pointer.pointerId !== undefined ?\n    // pointerId for pointer events, touch.indentifier for touch events\n    pointer.pointerId : pointer.identifier;\n  // track position for move\n  this.pointerDownPointer = {\n    pageX: pointer.pageX,\n    pageY: pointer.pageY,\n  };\n\n  this.bindActivePointerEvents();\n  this.emitEvent( 'pointerDown', [ event, pointer ] );\n};\n\n// ----- move ----- //\n\nproto.onmousemove = function( event ) {\n  this.pointerMove( event, event );\n};\n\nproto.onpointermove = function( event ) {\n  this.withPointer( 'pointerMove', event );\n};\n\nproto.ontouchmove = function( event ) {\n  this.withTouch( 'pointerMove', event );\n};\n\nproto.pointerMove = function( event, pointer ) {\n  let moveVector = {\n    x: pointer.pageX - this.pointerDownPointer.pageX,\n    y: pointer.pageY - this.pointerDownPointer.pageY,\n  };\n  this.emitEvent( 'pointerMove', [ event, pointer, moveVector ] );\n  // start drag if pointer has moved far enough to start drag\n  let isDragStarting = !this.isDragging && this.hasDragStarted( moveVector );\n  if ( isDragStarting ) this.dragStart( event, pointer );\n  if ( this.isDragging ) this.dragMove( event, pointer, moveVector );\n};\n\n// condition if pointer has moved far enough to start drag\nproto.hasDragStarted = function( moveVector ) {\n  return Math.abs( moveVector.x ) > 3 || Math.abs( moveVector.y ) > 3;\n};\n\n// ----- drag ----- //\n\nproto.dragStart = function( event, pointer ) {\n  this.isDragging = true;\n  this.isPreventingClicks = true; // set flag to prevent clicks\n  this.emitEvent( 'dragStart', [ event, pointer ] );\n};\n\nproto.dragMove = function( event, pointer, moveVector ) {\n  this.emitEvent( 'dragMove', [ event, pointer, moveVector ] );\n};\n\n// ----- end ----- //\n\nproto.onmouseup = function( event ) {\n  this.pointerUp( event, event );\n};\n\nproto.onpointerup = function( event ) {\n  this.withPointer( 'pointerUp', event );\n};\n\nproto.ontouchend = function( event ) {\n  this.withTouch( 'pointerUp', event );\n};\n\nproto.pointerUp = function( event, pointer ) {\n  this.pointerDone();\n  this.emitEvent( 'pointerUp', [ event, pointer ] );\n\n  if ( this.isDragging ) {\n    this.dragEnd( event, pointer );\n  } else {\n    // pointer didn't move enough for drag to start\n    this.staticClick( event, pointer );\n  }\n};\n\nproto.dragEnd = function( event, pointer ) {\n  this.isDragging = false; // reset flag\n  // re-enable clicking async\n  setTimeout( () => delete this.isPreventingClicks );\n\n  this.emitEvent( 'dragEnd', [ event, pointer ] );\n};\n\n// triggered on pointer up & pointer cancel\nproto.pointerDone = function() {\n  this.isPointerDown = false;\n  delete this.pointerIdentifier;\n  this.unbindActivePointerEvents();\n  this.emitEvent('pointerDone');\n};\n\n// ----- cancel ----- //\n\nproto.onpointercancel = function( event ) {\n  this.withPointer( 'pointerCancel', event );\n};\n\nproto.ontouchcancel = function( event ) {\n  this.withTouch( 'pointerCancel', event );\n};\n\nproto.pointerCancel = function( event, pointer ) {\n  this.pointerDone();\n  this.emitEvent( 'pointerCancel', [ event, pointer ] );\n};\n\n// ----- click ----- //\n\n// handle all clicks and prevent clicks when dragging\nproto.onclick = function( event ) {\n  if ( this.isPreventingClicks ) event.preventDefault();\n};\n\n// triggered after pointer down & up with no/tiny movement\nproto.staticClick = function( event, pointer ) {\n  // ignore emulated mouse up clicks\n  let isMouseup = event.type === 'mouseup';\n  if ( isMouseup && this.isIgnoringMouseUp ) return;\n\n  this.emitEvent( 'staticClick', [ event, pointer ] );\n\n  // set flag for emulated clicks 300ms after touchend\n  if ( isMouseup ) {\n    this.isIgnoringMouseUp = true;\n    // reset flag after 400ms\n    setTimeout( () => {\n      delete this.isIgnoringMouseUp;\n    }, 400 );\n  }\n};\n\n// -----  ----- //\n\nreturn Unidragger;\n\n} ) );\n\n\n//# sourceURL=webpack:///./node_modules/unidragger/unidragger.js?");

/***/ })

}]);