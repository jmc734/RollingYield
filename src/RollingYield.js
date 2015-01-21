/**
 * @module RollingYield
 */
define(function(){
    
    /**
     * @constructor
     * @alias               module:RollingYield
     * @param   {function}  callback
     */
    function RollingYield(callback){

        var self = this;
        this.callback = callback ? callback : function(){};
        
        /**
         * @param   {function|string}   innerCallback
         * @param   {string}            expectedParameter
         */
        this.instance = function(innerCallback, expectedParameter){
        
            // If the first argument is a function,
            // everything after should be a string name of an expected callback parameter.
            // Otherwise, the first argument is the first string name.
            if(typeof innerCallback === 'function'){
                var expect = new Array(arguments.length - 1);
                var j = 0;
            } else {
                var expect = new Array(arguments.length);
                var j = 1;
                expect[0] = innerCallback;
                innerCallback = function(){}
            }
            
            // Store the names of all of the expected callback arguments
            for(var i = 1; i < arguments.length; i++, j++){
                expect[j] = arguments[i];
            }
            
            // Increment the callback counter
            self.count++;
            
            return function(arg){
            
                // Store the argument for the each expected parameter
                for(var i = 0; i < expect.length; i++){
                    self.instance[expect[i]] = arguments[i];
                }
                
                // Call the inner callback, if there is one
                innerCallback.apply(this, arguments);
                
                // Pull our increment off of the callback counter
                self.count--;
                
                // If all of the callbacks have been called, we can move on
                if(self.count === 0){
                    self.run();
                }
            
            };
            
        };

    };

    RollingYield.prototype.iterator = function*(){};
    RollingYield.prototype.count = 0;
    RollingYield.prototype.log = false;
    RollingYield.prototype.yielded = [];

    /**
     * @param   {Generator} iterator
     * @param   {...*}      arg
     */
    RollingYield.prototype.init = function(iterator, arg){

        // Create the array of arguments used to initialize the iterator
        // The first argument is this.instance
        var iteratorArgs = new Array(arguments.length);
        iteratorArgs[0] = this.instance;
        for(var i = 1; i < arguments.length; i++){
            iteratorArgs[i] = arguments[i];
        }
        
        // Initialize the iterator
        this.iterator = iterator.apply(this, iteratorArgs);

    };

    /**
     *
     */
    RollingYield.prototype.run = function(){

        // If we need to init first
        if(arguments.length){
            this.init.apply(this, arguments);
        }

        // Iterate
        var yielded = this.iterator.next();
        
        // If logging is enabled, log what was yielded
        if(this.log){
            this.yielded.push(yielded);
        }
        
        // If the iterator said it was done or there were no callbacks created,
        // we are done and can call the outer callback
        if(yielded.done || this.count === 0){
        
            this.callback(this);
        
        }

    };
    
    return RollingYield;
    
});