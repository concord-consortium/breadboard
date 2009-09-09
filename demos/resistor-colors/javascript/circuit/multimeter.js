function Multimeter()
{
	this.redLeadConnection = null;
	this.blackLeadConnection = null;
	
	this.update = function() {
		console.log('ENTER update');
		var resistor = getActivity().resistor;
		console.log('Resistance=' + resistor.realValue);
		if (this.redLeadConnection != null && this.blackLeadConnection != null &&
				this.redLeadConnection != this.blackLeadConnection) {
			sendCommand('set_multimeter_display', resistor.realValue);
		}
		else {
			sendCommand('set_multimeter_display', 0);
		}
	}
}
