(function () {
    
    var mr = sparks.activities.mr;
    var str = sparks.string;
    
    mr.ActivityDomHelper =  {
        ratedResistanceFormId: '#rated_resistance',
        ratedResistanceValueId: '#rated_resistance_value_input',
        ratedResistanceUnitId: '#rated_resitance_unit_select',
        
        getAnswer: function (questionNum) {
            var value, unit;
            
            switch (questionNum) {
            case 1:
                value = $(this.ratedResistanceValueId).val();
                unit = $(this.ratedResistanceUnitId).val();
                return [value, unit];
            case 2:
            case 3:
            case 4:
            default:
                alert('ERROR: ActivityDomHelper.getAnswer: invalid question number ' + questionNum);
                return null;
            }
        },
        
        validateNumberString: function (s) {
            var s2 = str.strip(s);
            return s2 !== '' && !isNaN(Number(s2));
        },
        
        selected: function(selectElem) {
            return selectElem.children('option:selected').val();
        }
    };
    
})();
