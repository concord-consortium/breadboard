package {

    //import fl.ik.*;

    import flash.events.Event;
    import flash.events.MouseEvent;
    import flash.display.MovieClip;

    import org.concord.sparks.JavaScript;

    public class Breadboard extends MovieClip {
        
        //var powerWireRedArmatureNumber:Number = 40;
        //var powerWireRedikBoneName:Number = 311;
        //var powerWireBlackArmatureNumber:Number = 38;
        //var powerWireBlackikBoneName:Number = 290;

        var currentHolePowerOne:MovieClip = null;
        var currentHolePowerTwo:MovieClip = null;

        //variables for hole size and distance between
        public var holeSize:Number = 15.4;
        var yOffset:Number = 34.5; 
        var xOffset:Number = 29.65;
        //this is the extra space between groups of 5 on pos and neg rows
        var xIntervalOffset:Number = 60.45;
        //this is the space between the two positive OR two negative rows (top and bottom)
        var yPositiveNegativeOffset:Number = 504.25;

        var rows:Array = new Array(); 
        var posRows:Array = new Array();
        var negRows:Array = new Array();

        var powerWireRed_tipX:Number;
        var powerWireRed_tipY:Number;
        var powerWireBlack_tipX:Number;
        var powerWireBlack_tipY:Number;

        var currentPosHoleOne:MovieClip = null;
        var currentPosHoleTwo:MovieClip = null;
        var currentNegHoleOne:MovieClip = null;
        var currentNegHoleTwo:MovieClip = null;

        var powerWireRedLocation:String;
        var powerWireBlackLocation: String;

        var redPowerOnPositive:Boolean = false;
        var redPowerOnNegative:Boolean = false;
        var blackPowerOnPositive:Boolean = false;
        var blackPowerOnNegative:Boolean = false;
        var powerON:Boolean = false;

        public function Breadboard() {
            trace('ENTER Breadboard#Breadboard');

            drawBreadboard();
            drawPosRows();
            drawNegRows();

            //resistor1.x = loc_a23.x;
            //resistor1.y = loc_a23.y;
            // 
            //resistor2.x = loc_b17.x;
            //resistor2.y = loc_b17.y;
            // 
            //resistor3.x = loc_c11.x;
            //resistor3.y = loc_c11.y;

            //wire1.x = loc_b16.x;
            //wire1.y = loc_b16.y;

            //initialComponentValues();

            //IGNORE  temporary script for power on holes  HardCoded Power Holes
            //posHole_on.width = posHole_on.height = holeSize + 2;
            //posHole_on.y = -146.85;
            //posHole_on.x = -176.95;
            //posHole_on.gotoAndStop(2);
            //
            //negHole_on.width = negHole_on.height = holeSize + 2;
            //negHole_on.y = -112.40;
            //negHole_on.x = -148.50;
            //negHole_on.gotoAndStop(2);

            //temporary script for power on holes  HardCoded
            posHole_on.width = posHole_on.height = holeSize + 2;
            posHole_on.y = -146.85;
            posHole_on.x = -176.95;
            posHole_on.gotoAndStop(2);

            negHole_on.width = negHole_on.height = holeSize + 2;
            negHole_on.y = -112.40;
            negHole_on.x = -148.50;
            negHole_on.gotoAndStop(2);

            stage.addEventListener(MouseEvent.MOUSE_UP, mouseUpHandler);
        }
    
        function mouseUpHandler(mevt:MouseEvent):void {
            //trace('Breadboard#mouseUpHandler x=' + mevt.stageX + ' y=' + mevt.stageY);
            powerWires(mevt);
            probeQuery_handler(mevt);
        }

        function wireOnPositive():void
        {
            //var powerWireRed_armature:IKArmature = IKManager.getArmatureByName('Armature_' + powerWireRedArmatureNumber);
            //var powerWireRed_bone:IKBone = powerWireRed_armature.getBoneByName('ikBoneName' + powerWireRedikBoneName);
            //var powerWireRed_boneTip:Point = powerWireRed_bone.tailJoint.position;
            powerWireRed_tipX = powerWireRed.x;
            powerWireRed_tipY = powerWireRed.y;

            //var powerWireBlack_armature:IKArmature = IKManager.getArmatureByName('Armature_' + powerWireBlackArmatureNumber);
            //var powerWireBlack_bone:IKBone = powerWireBlack_armature.getBoneByName('ikBoneName' + powerWireBlackikBoneName);
            //var powerWireBlack_boneTip:Point = powerWireBlack_bone.tailJoint.position;
            powerWireBlack_tipX = powerWireBlack.x;
            powerWireBlack_tipY = powerWireBlack.y;

            if (currentPosHoleOne != null )
            {
                currentPosHoleOne.gotoAndStop(1);
                currentPosHoleOne = null;
            }

            if (currentPosHoleTwo != null )
            {
                currentPosHoleTwo.gotoAndStop(1);
                currentPosHoleTwo = null;
            }

            //for every row ...
            for(var rowNum:int = 1; rowNum<=2; rowNum++)
            {
                //start at left of grid
                //accessin the list of row by index
                var posRow:Array = posRows[rowNum]; 

                //for every hole in the row...
                for (var holeNum:int = 1; holeNum <=25; holeNum++)
                {
                    var ph:MovieClip = posRow[holeNum];
                    //trace("h.x = " + h.x + " " + "h.y = " + h.y);


                    if (  (powerWireRed_tipX > ph.x) &&  (powerWireRed_tipX < ph.x + 12)  &&  (powerWireRed_tipY > ph.y) &&  (powerWireRed_tipY < ph.y + 12) )
                    {
                        currentPosHoleOne = ph;
                        ph.gotoAndStop(2);
                        powerWireRedLocation = posRow+holeNum;
                        redPowerOnPositive = true;
                        //trace ( "Red Power Wire On Positive = " + redPowerOnPositive );
                        //trace(this.name + " Row = " + boardRow + " Column = " + holeNum + " Left Side On");
                    }

                   if (  (powerWireBlack_tipX > ph.x) &&  (powerWireBlack_tipX < ph.x + 12)  &&  (powerWireBlack_tipY > ph.y) &&  (powerWireBlack_tipY < ph.y + 12) )
                    {
                        currentPosHoleTwo = ph;
                        ph.gotoAndStop(2);
                        powerWireBlackLocation = posRow+holeNum;
                        blackPowerOnPositive = true;
                        //trace ("Black Power On Positive = " + blackPowerOnPositive );//trace(this.name + " Row = " + boardRow + " Column = " + holeNum + " Left Side On");
                    }

                    if (currentPosHoleOne == null)
                    {
                        redPowerOnPositive = false;
                    }

                    if (currentPosHoleTwo == null)
                    {
                        blackPowerOnPositive = false;
                    }
                }
            }
        }

        function wireOnNegative():void
        {
        //  var powerWireRed_armature:IKArmature = IKManager.getArmatureByName('Armature_' + powerWireRedArmatureNumber);
        //  var powerWireRed_bone:IKBone = powerWireRed_armature.getBoneByName('ikBoneName' + powerWireRedikBoneName);
        //  var powerWireRed_boneTip:Point = powerWireRed_bone.tailJoint.position;
            powerWireRed_tipX = powerWireRed.x;
            powerWireRed_tipY = powerWireRed.y;

        //  var powerWireBlack_armature:IKArmature = IKManager.getArmatureByName('Armature_' + powerWireBlackArmatureNumber);
        //  var powerWireBlack_bone:IKBone = powerWireBlack_armature.getBoneByName('ikBoneName' + powerWireBlackikBoneName);
        //  var powerWireBlack_boneTip:Point = powerWireBlack_bone.tailJoint.position;
            powerWireBlack_tipX = powerWireBlack.x;
            powerWireBlack_tipY = powerWireBlack.y;

            if (currentNegHoleOne != null )
            {
                currentNegHoleOne.gotoAndStop(1);
                currentNegHoleOne = null;
            }

            if (currentNegHoleTwo != null )
            {
                currentNegHoleTwo.gotoAndStop(1);
                currentNegHoleTwo = null;
            }

            //for every row ...
            for(var rowNum:int = 1; rowNum<=2; rowNum++)
            {
                //start at left of grid
                //accessin the list of row by index
                var negRow:Array = negRows[rowNum]; 

                //for every hole in the row...
                for (var holeNum:int = 1; holeNum <=25; holeNum++)
                {
                    var nh:MovieClip = negRow[holeNum];
                    //trace("h.x = " + h.x + " " + "h.y = " + h.y);


                    if (  (powerWireRed_tipX > nh.x) &&  (powerWireRed_tipX < nh.x + 12)  &&  (powerWireRed_tipY > nh.y) &&  (powerWireRed_tipY < nh.y + 12) )
                    {
                        currentNegHoleOne = nh;
                        nh.gotoAndStop(2);
                        powerWireRedLocation = negRow+holeNum;
                        redPowerOnNegative = true;
                        //trace(this.name + " Row = " + boardRow + " Column = " + holeNum + " Left Side On");
                    }

                   if (  (powerWireBlack_tipX > nh.x) &&  (powerWireBlack_tipX < nh.x + 12)  &&  (powerWireBlack_tipY > nh.y) &&  (powerWireBlack_tipY < nh.y + 12) )
                    {
                        currentNegHoleTwo = nh;
                        nh.gotoAndStop(2);
                        powerWireBlackLocation = negRow+holeNum;
                        blackPowerOnNegative = true;
                        //trace ("Black Power On Negative = " + blackPowerOnNegative );//trace(this.name + " Row = " + boardRow + " Column = " + holeNum + " Left Side On");
                    }

                    if (currentNegHoleOne == null)
                    {
                        redPowerOnNegative = false;
                    }

                    if (currentNegHoleTwo == null)
                    {
                        blackPowerOnNegative = false;
                    }
                }
            }
        }


        function powerWires(event:MouseEvent):void
        {
        //  var powerWireRed_armature:IKArmature = IKManager.getArmatureByName('Armature_' + powerWireRedArmatureNumber);
        //  var powerWireRed_bone:IKBone = powerWireRed_armature.getBoneByName('ikBoneName' + powerWireRedikBoneName);
        //  var powerWireRed_boneTip:Point = powerWireRed_bone.tailJoint.position;
            var tempPowerWireRed_tipX = powerWireRed.x;
            var tempPowerWireRed_tipY = powerWireRed.y;

        //  var powerWireBlack_armature:IKArmature = IKManager.getArmatureByName('Armature_' + powerWireBlackArmatureNumber);
        //  var powerWireBlack_bone:IKBone = powerWireBlack_armature.getBoneByName('ikBoneName' + powerWireBlackikBoneName);
        //  var powerWireBlack_boneTip:Point = powerWireBlack_bone.tailJoint.position;
            var tempPowerWireBlack_tipX = powerWireBlack.x;
            var tempPowerWireBlack_tipY = powerWireBlack.y;

            if ( (tempPowerWireBlack_tipX != powerWireBlack_tipX) || (tempPowerWireBlack_tipY != powerWireBlack_tipY )  ||  (tempPowerWireRed_tipX != powerWireRed_tipX) || (tempPowerWireRed_tipY != powerWireRed_tipY ) )
            {
                wireOnPositive();
                wireOnNegative();
                powerWireBlack_tipX = tempPowerWireBlack_tipX;
                powerWireBlack_tipY = tempPowerWireBlack_tipY;
                powerWireRed_tipX = tempPowerWireRed_tipX;
                powerWireRed_tipY = tempPowerWireRed_tipY;

                if (redPowerOnPositive == true && blackPowerOnNegative == true)
                {
                    powerON = true; 
                    trace("Power On = " + powerON);
                }

                else
                {
                    powerON = false;
                }
            }

        //  trace("blackPowerOnNegative" + blackPowerOnNegative);
        //  trace("redPowerOnPositive" + redPowerOnPositive);

        }



        /*displayList();

        function displayList():void
        {
        var len:int = this.numChildren;  
        for (var i:int = 0; i < len; i++) {  
            var display:DisplayObject = this.getChildAt(i);  
            trace(display.name);  
        } 
        }*/

        function drawBreadboard():void

        {
        //Draw a1
            var yPos:Number = -45;
            var yMidPointOffset = 23.9;

            //for every row ... 
            for(var rowNum:int = 1; rowNum<=10; rowNum++)
            {
                //start at left of grid
                var xPos:Number = -282;
                //create a list of holes
                var row:Array = new Array(); 
                rows[rowNum] = row;

                //for every hole in the row...
                for (var holeNum:int = 30; holeNum >=1; holeNum--)
                {
                    var h = new hole;
                    h.x=xPos;
                    h.y=yPos;
                    h.width = h.height = holeSize;
                    this.addChildAt(h, 1);
                    row[holeNum] = h;
                    xPos += xOffset;
                }
                yPos += yOffset;
                if (rowNum==5)
                {
                     (yPos += yMidPointOffset);
                }
            }   
        }

        function drawPosRows():void
        {

            var yPositivePos:Number = -146.85;

                //for every row ... 
            for(var posRowNum:int = 1; posRowNum<=2; posRowNum++)
            {
                var xPositiveNegativePos:Number = -265.45;
                //start at left of grid
                //create a list of holes
                var posRow:Array = new Array(); 
                posRows[posRowNum] = posRow;

                //for every hole in the row...
                for (var posHoleNum:int = 1; posHoleNum <=25; posHoleNum++)
                {
                    var ph = new hole;
                    ph.x=xPositiveNegativePos;
                    ph.y=yPositivePos;
                    ph.width = ph.height = holeSize;
                    this.addChildAt(ph, 1);
                    posRow[posHoleNum] = ph;
                    if ( posHoleNum%5 == 0)
                    {
                     (xPositiveNegativePos += xIntervalOffset);
                    }
                    else
                    {
                    xPositiveNegativePos += xOffset;
                    }
                }
                yPositivePos += yPositiveNegativeOffset;
            }       
        }

        function drawNegRows():void
        {

            var yNegativePos:Number = -112.40;

                //for every row ... 
            for(var negRowNum:int = 1; negRowNum<=2; negRowNum++)
            {
                var xPositiveNegativePos:Number = -265.45;
                //start at left of grid
                //create a list of holes
                var negRow:Array = new Array(); 
                negRows[negRowNum] = negRow;

                //for every hole in the row...
                for (var negHoleNum:int = 1; negHoleNum <=25; negHoleNum++)
                {
                    var nh = new hole;
                    nh.x=xPositiveNegativePos;
                    nh.y=yNegativePos;
                    nh.width = nh.height = holeSize;
                    this.addChildAt(nh, 1);
                    negRow[negHoleNum] = nh;
                    if ( negHoleNum%5 == 0)
                    {
                     (xPositiveNegativePos += xIntervalOffset);
                    }
                    else
                    {
                    xPositiveNegativePos += xOffset;
                    }
                }
                yNegativePos += yPositiveNegativeOffset;
            }           
        }

        function probeQuery_handler(event:MouseEvent):void
        {
            var blackProbeEngaged:Boolean = false;
            var redProbeEngaged:Boolean = false;

            if (resistor1.blackProbeOnLeft == true || resistor1.blackProbeOnRight == true ) 
            {
                blackProbeEngaged = true;
            }

            if (resistor1.redProbeOnLeft == true || resistor1.redProbeOnRight == true)
            {
                redProbeEngaged = true;
            }

            if (resistor2.blackProbeOnLeft == true || resistor2.blackProbeOnRight == true ) 
            {
                blackProbeEngaged = true;
            }

            if (resistor2.redProbeOnLeft == true || resistor2.redProbeOnRight == true)
            {
                redProbeEngaged = true;
            }

            if (resistor3.blackProbeOnLeft == true || resistor3.blackProbeOnRight == true ) 
            {
                blackProbeEngaged = true;
            }

            if (resistor3.redProbeOnLeft == true || resistor3.redProbeOnRight == true)
            {
                redProbeEngaged = true;
            }

            if (blackProbeEngaged == true && redProbeEngaged == true )
            {
                trace ("blackProbeEngaged" + blackProbeEngaged);
                trace ("redProbeEngaged" + redProbeEngaged);
                trace("black probe on " + Globe.probeBlackLocation);
                trace("red probe on " + Globe.probeRedLocation);
                //Globe.resistance = ExternalInterface.call('breadModel', 'query', 'voltage', Globe.probeBlackLocation + ',' + Globe.probeRedLocation, '200k');
                JavaScript.instance().sendEvent('probe', Globe.probeBlackLocation, Globe.probeRedLocation);

            }
        }

    }
}