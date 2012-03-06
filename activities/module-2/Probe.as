package {
    
    import flash.display.MovieClip;
    import flash.events.MouseEvent;
    import flash.geom.Point;
    
    import org.concord.sparks.JavaScript;
    import org.concord.sparks.util.Display;
	
	import Globe;

    public class Probe extends MovieClip {

        private var circuit:Circuit;
        private var connection:Object = null;
        private var id:String;

        public var _dragging:Boolean = false;
        private var _down:Boolean = false;
    
        public function Probe() {
            //trace('ENTER Probe#Probe');
            super();
            id = this.name;
            trace('Probe id=' + id);
            
            this.addEventListener(MouseEvent.MOUSE_DOWN, onMouseDown);
            this.addEventListener(MouseEvent.MOUSE_UP, onMouseUp);
            this.addEventListener(MouseEvent.MOUSE_MOVE, onMouseMove);
			stage.addEventListener(MouseEvent.MOUSE_OUT, onMouseUp);
			
			set_dragability();
        }
        
        public function getId() {
            return id;
        }
        
        public function getConnection():Object {
            return connection;
        }
        
        public function setConnection(connection:Object):void {
            this.connection = connection;
        }

        public function setCircuit(circuit:Circuit) {
            //trace('ENTER Probe#setCircuit');
            this.circuit = circuit;
        }
		public function getCircuit():Circuit {
			return this.circuit;
		}
		public function getIfDown():Boolean { // for debbuging!  can erase
			return this._down;
		}

        public function getTipPos():Point {
            return Display.localToStage(this.parent, new Point(this.x, this.y));
        }
		
		public function removeEventListeners()  {
			this.buttonMode=false;
			this.removeEventListener(MouseEvent.MOUSE_DOWN, onMouseDown);
			this.removeEventListener(MouseEvent.MOUSE_MOVE, onMouseMove);
			this.removeEventListener(MouseEvent.MOUSE_UP, onMouseUp);
			this.removeEventListener(MouseEvent.MOUSE_OUT, onMouseUp);
		}
		
		public function addEventListeners()  {
			this.buttonMode = true;
			this.addEventListener(MouseEvent.MOUSE_DOWN, onMouseDown);
			this.addEventListener(MouseEvent.MOUSE_MOVE, onMouseMove);
			this.addEventListener(MouseEvent.MOUSE_UP, onMouseUp);
			this.addEventListener(MouseEvent.MOUSE_OUT, onMouseUp);
		}
        
		public function set_dragability()  {
			
			if (this.name == 'probe_yellow' && Globe.dragYellowProbe == false) {
				removeEventListeners();
			}
			if (this.name == 'probe_yellow' && Globe.dragYellowProbe == true) {
				addEventListeners();
			}
			if (this.name == 'probe_pink' && Globe.dragPinkProbe == false) {
				removeEventListeners();
			}
			if (this.name == 'probe_pink' && Globe.dragPinkProbe == true) {
				addEventListeners();
			}
			if (this.name == 'probe_red' && Globe.dragRedProbe == false) {
				removeEventListeners();
			}
			if (this.name == 'probe_red' && Globe.dragRedProbe == true) {
				addEventListeners();
			}
			if (this.name == 'probe_black' && Globe.dragBlackProbe == false) {
				removeEventListeners();
			}
			if (this.name == 'probe_black' && Globe.dragBlackProbe == true) {
				addEventListeners();
			}
		}
		
        public function onMouseDown(event:MouseEvent):void {
            _down = true;
			circuit.putProbeOnTop(this);
        }
        
        public function onMouseUp(event:MouseEvent):void {
            //trace('ENTER Probe#onMouseUp');
            this.stopDrag();
            _down = false;
            if (_dragging) {    
                circuit.setProbeConnection(this, true);
            }
			_dragging = false;
        }
		
        public function onMouseMove(event:MouseEvent):void {
            //trace('ENTER Probe#onMouseMove');
		
			buttonMode = true;
			if (! _down) {
				return;
			}
			if (_dragging) {
				circuit.setComponentEndColors(this);
			}
			else {
				_dragging = true;
				this.startDrag();
				if (connection) {
					disConnect();
				}
			}
        }
        
        public function disConnect():void {
            JavaScript.instance().sendEvent('disconnect', 'probe', getId(), connection.getLocation());
            connection = null;
        }
    }
}
