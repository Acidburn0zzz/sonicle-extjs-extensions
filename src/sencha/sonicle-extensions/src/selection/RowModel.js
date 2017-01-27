/*
 * Sonicle ExtJs UX
 * Copyright (C) 2015 Sonicle S.r.l.
 * sonicle@sonicle.com
 * http://www.sonicle.com
 */
Ext.define('Sonicle.selection.RowModel', {
	extend: 'Ext.selection.RowModel',
	alias: 'selection.sorowmodel',
	
	/**
	 * Remove passed selection or current selection from store,
	 * then automatically set the new selection near the first
	 * record of the old selection
	 * @param {Ext.data.Model[]} [selection] The selection to be removed. Defaults to current selection.
	 */
	removeSelection: function(selection) {
		var me=this,
			s=selection||me.getSelection(),
			st=me.store,
			ix=me.store.indexOf(s[0]);
		
		if (st.remove) {
			st.remove(s);
			me._reselect(ix);
		}
		else {
			st.reload({
				callback: function() {
					me._reselect(ix);
				}
			});
		}
	},
	
	/**
	 * Remove passed IDs from store,
	 * then automatically set the new selection near the first
	 * record of the first removed ID
	 * @param {String[]} [ids] The ids to be removed.
	 */
	removeIds: function(ids) {
		var me=this,
			st=me.store,
			stlen=st.getCount(),
			id0=null,
			idprop=st.getModel().idProperty||'id';
		
		if (st.remove) {
			var recs=[];
			Ext.each(ids,function(id) {
				var r=st.getById(id);
				if (r) recs[recs.length]=r;
			});
			st.remove(recs);
		}
		else {
			var id0=null;
			if (ids.length>1) {
				//obtiain ordered list of selection indexes
				var ix0,newix,ixs=new Array(ids.length);
				for(var i=0;i<ids.length;++i) ixs[i]=st.findExact(idprop,ids[i]);
				ixs.sort(function(a,b) { return a-b; });
				
				ix0=ixs[0];
				//scan sorted selection
				for(var i=1;i<ixs.length;++i) {
					var ix1=ixs[i];
					//if non contiguous, get next to this ix0
					if (ix1-ix0>1) {
						break;
					}
					ix0=ix1;
				}
				//if contiguous, get next to last ix0
				newix=ix0+1;
				if (newix<stlen) id0=st.getAt(newix).get(idprop);
			} else {
				var ix=st.findExact(idprop,ids[0])+1;
				if (ix<stlen) id0=st.getAt(ix).get(idprop);
			}
			st.reload({
				callback: function() {
					if (id0) {
						var newix=st.findExact(idprop,id0);
						if (newix>=0) me._reselect(newix);
					}
				}
			});
		}
		
	},
	
	_reselect: function(ix) {
		var me=this,
			views   = me.views || [me.view],
			viewsLn = views.length;
	
		if (ix>=me.store.getCount()) --ix;
		if (ix>=0) {
			me.view.bufferedRenderer.scrollTo(ix, true);
			me.select(ix);
			for (i = 0; i < viewsLn; i++) {
				views[i].navigationModel.setPosition(ix);
			}
		}
	}
	
	
});
