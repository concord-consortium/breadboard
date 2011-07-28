/* FILE resistor.js */
/*globals console sparks */

(function () {

    sparks.circuit.Component = function (props, breadBoard) {
      
      for (var i in props) {
        this[i]=props[i];
      }
      
      this.breadBoard = breadBoard;
      this.breadBoard.components[props.UID] = this;
      
      if (!this.label){
        this.label = !!this.UID.split("/")[1] ? this.UID.split("/")[1] : null;
      }
      
      if (typeof(this.connections) === "string"){
        this.connections = this.connections.split(",");
      }
      
      for (i in this.connections) {
        this.connections[i] = this.breadBoard.getHole(this.connections[i]);
        
        if (!!this.breadBoard.holes[this.connections[i]]) {
          this.breadBoard.holes[this.connections[i]].connections[this.breadBoard.holes[this.connections[i]].connections.length] = this;
        }
      }
      this._ensureInt("resistance");
      this._ensureInt("nominalResistance");
      this._ensureInt("voltage");
    };

    sparks.circuit.Component.prototype =
    {
    	move: function (connections) {
        var i;
        for (i in this.connections) {
          for (var j in this.connections[i].connections) {
            if (this.connections[i].connections[j] === this) {
              this.connections[i].connections = [];
            }
          }
          this.connections[i] = [];
        }
        this.connections = [];
        for (i in connections){
          this.connections[i] = this.breadBoard.holes[connections[i]];
          this.breadBoard.holes[connections[i]].connections[this.breadBoard.holes[connections[i]].connections.length] = this;
        }
      },
      
      destroy: function (){
        for(var i in this.connections){
          for( var j in this.connections[i].connections ){
            if( this.connections[i].connections[j] === this ){
              this.connections[i].connections = [];
            }
          }
          this.connections[i] = [];
        }
        this.connections = [];
        delete this.breadBoard.components[this.name];
      },
      
      _ensureInt: function (val) {
        if (!!this[val] && typeof(this[val]) === "string"){
          this[val] = parseInt(this[val], 10);
        }
      }
    };

})();