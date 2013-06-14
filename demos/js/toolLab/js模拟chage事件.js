function fireChangEvent(elem){
   if(document.createEvent){
		ev = document.createEvent('HTMLEvents'); 
		ev.initEvent('change', false, true);    
		elem.dispatchEvent(ev);
   }else if(document.createEventObject){
		ev = document.createEventObject();
		elem.fireEvent("onchange",ev);
   }
}