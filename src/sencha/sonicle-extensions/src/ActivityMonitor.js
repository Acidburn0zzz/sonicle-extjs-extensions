/*
 * Sonicle ExtJs UX
 * Copyright (C) 2015 Sonicle S.r.l.
 * sonicle@sonicle.com
 * http://www.sonicle.com
 */
Ext.define('Sonicle.ActivityMonitor', {
	singleton: true,
	mixins: [
		'Ext.mixin.Observable'
	],
	
	config: {
		/**
		 * @cfg {Number} timeout
		 * The amount of time (ms) before the user is considered idle
		 */
		timeout: 30000
	},
	
	/**
	 * @readonly
	 * @property {Boolean} enabled
	 * Indicates if the idle timer is enabled
	 */
	enabled: false,
	
	/**
	 * @readonly
	 * @property {Date} toggleDate
	 * The last time state changed
	 */
	toggleDate: null,
	
	/**
	 * @readonly
	 * @property {Date} lastActive
	 * The last time timer was active
	 */
	lastActive: null,
	
	/**
	 * @readonly
	 * @property {Boolean} enabled
	 * Indicates if the user is idle
	 */
	idle: false,
	
	/**
	 * @private
	 * @property {Number} tId
	 */
	tId: -1,
	
	/**
	 * @event change
	 * Fires when activity status changed
	 * @param {Sonicle.ActivityMonitor} this The activity monitor
	 * @param {Boolean} idle True, if the user is idle, false otherwise
	 */
	
	constructor: function(cfg) {
		var me = this;
		me.initConfig(cfg);
		me.mixins.observable.constructor.call(me, cfg);
		me.callParent([cfg]);
	},
	
	destroy: function() {
		this.stop();
	},
	
	start: function(timeout) {
		var me = this,
				body = Ext.getBody();
		
		if(!me.enabled) {
			if (Ext.isNumber(timeout)) me.setTimeout(timeout);
			me.toggleDate = +new Date();
			me.lastActive = me.toggleDate;
			body.on({
				mousemove: me.onUserActivity,
				mousedown: me.onUserActivity,
				keypress: me.onUserActivity,
				DOMMouseScroll: me.onUserActivity,
				mousewheel: me.onUserActivity,
				touchmove: me.onUserActivity,
				MSPointerMove: me.onUserActivity,
				scope: me
			});
			me.enabled = true;
			me.tId = Ext.Function.defer(me.toggleIdleState, me.getTimeout(), me);
		}
	},
	
	stop: function() {
		var me = this,
				body = Ext.getBody();
		
		if(me.enabled) {
			clearTimeout(me.tId);
			body.un({
				keydown : me.onUserActivity,
				mousemove: me.onUserActivity,
				mousedown: me.onUserActivity,
				wheel: me.onUserActivity,
				mousewheel: me.onUserActivity,
				DOMMouseScroll: me.onUserActivity,
				touchmove: me.onUserActivity,
				scope: me
			});
			me.enabled = false;
		}
	},
	
	isIdle: function() {
		return this.idle;
	},
	
	getRemainingTime: function() {
		var me = this, remain;
		if (!me.enabled && me.idle) return 0;
		remain = me.getTimeout() - ((+new Date()) - me.lastActive);
		return (remain < 0) ? 0 : remain;
	},
	
	getElapsedTime: function() {
		return this.enabled ? (+new Date()) - this.toggleDate : 0;
	},
	
	getLastActiveTime: function() {
		return this.lastActive;
	},
	
	privates: {
		
		onUserActivity: function(e) {
			var me = this;
			
			if (e.type === 'mousemove') {
				// If coord are same, it didn't move
				if (e.pageX === me.oldPageX && e.pageY === me.oldPageY) return;
				// If coord don't exist how could it move
				if (typeof e.pageX === undefined && typeof e.pageY === undefined) return;
				// Under 200 ms is hard to do, and you would have to stop, as continuous activity will bypass this
				if (((+new Date()) - me.toggleDate) < 200) return;
			}
			
			clearTimeout(me.tId);
			if (me.idle) me.toggleIdleState();
			
			me.lastActive = +new Date();
			me.oldPageX = e.pageX;
			me.oldPageY = e.pageY;
			
			me.tId = Ext.Function.defer(me.toggleIdleState, me.getTimeout(), me);
			
			/*
			clearTimeout(me.tId);
			if (me.enabled) {
				if (me.idle) {
					if ((e.type === 'mousemove' || e.type === 'touchmove') && (me.activeSwitchCounter < 5)) {
						me.activeSwitchCounter++;
						return;
					}
					me.activeSwitchCounter = 0;
					me.toggleIdleState();
				}
				me.lastActivity = new Date();
				me.tId = Ext.Function.defer(me.toggleIdleState, me.getTimeout(), me);
			}
			*/
		},
		
		toggleIdleState: function() {
			var me = this;
			me.idle = !me.idle;
			me.toggleDate = +new Date();
			me.fireEvent('change', me, me.idle);
		}
	}
});
