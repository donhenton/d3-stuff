/**
 * 
 * http://answers.oreilly.com/topic/2190-two-examples-of-the-observer-pattern-in-javascript/
 * 
 * This is simple message pump system. Clients register a function for a particular 
 * event by calling:
 * 
 * subscribe(functionVar,eventType)
 * subscribe(refreshListener,"ON_REFRESH");
 * 
 * the signature of the refreshListener should be : refreshListener(payload)
 * The payload is what will be sent for the event.
 * 
 * MESSAGE_PUMP.subscribe(XTREE_LISTENERS.xml_block_refresh,
						XTREE_LISTENERS.ON_REFRESH_EVENT);
   MESSAGE_PUMP.subscribe(XTREE_LISTENERS.selected_list_refresh,
						XTREE_LISTENERS.ON_REFRESH_EVENT);
   MESSAGE_PUMP.raiseEvent(payload,XTREE_LISTENERS.selected_list_refresh);                                             
 */
 
	var MESSAGE_PUMP = {
		subscribers : {
			any : []
		 
		},
		
		/**
		 * Prepare a property on MESSAGE_PUMP that is a holder for functions
		 * belonging to subscribers to this event Type 
		 * These functions will be called when this event occurs
		 * 
		 * @param fn the function to call when the event occurs
		 * @param eventType the event to associate
		 */
		subscribe : function(fn, eventType) {
			eventType = eventType || 'any';
			if (typeof this.subscribers[eventType] === "undefined") {
				// this notation is an alterative way of reaching properties 
				// in  JSON array blah[xx] instead of blah.xx
				this.subscribers[eventType] = [];
			}
			this.subscribers[eventType].push(fn);
		},
		/**
		 * 
		 * @param fn the function to call when the event occurs
		 * @param eventType the event to associate
		 * 
		 */
		unsubscribe : function(fn, eventType) {
			this.visitSubscribers('unsubscribe', fn, eventType);
		},
		
		/**
		 * Raise an event. this will call all the functions
		 * that are associated with that event. This can be called
		 * by external code that wishes to raise an event
		 * 
		 * @param messagePayload JSON/whatever passed to the registered function
		 * @param eventType the event to associate
		 * 
		 */
		raiseEvent : function(messagePayload, eventType) {
			this.visitSubscribers('raiseEvent', messagePayload, eventType);
		},
		visitSubscribers : function(action, arg, type) {
			var pubtype = type || 'any'; 
			var  subscribers = this.subscribers[pubtype];
			var i;
			if (typeof subscribers === "undefined")
				return; 
			max = subscribers.length;

			for (i = 0; i < max; i += 1) {
				if (action === 'raiseEvent') {
					subscribers[i](arg);
				} else {
					// this is the unsubscribe block
					if (subscribers[i] === arg) {
						subscribers.splice(i, 1);
					}
				}
			}
		}
	};

 