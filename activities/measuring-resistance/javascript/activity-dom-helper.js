//= require <string>
//= require "setup-common"

/* FILE activity-dom-helper.js */

(function () {
    
    var mr = sparks.activities.mr;
    var str = sparks.string;
    
    mr.ActivityDomHelper =  {
        rated_r_value_id: '#rated_resistance_value_input',
        rated_r_unit_id: '#rated_resistance_unit_select',
        rated_t_id: '#rated_tolerance_select',
        measured_r_value_id: '#measured_r_value_input',
        measured_r_unit_id: '#measured_r_unit_select',
        t_range_min_value_id: '#t_range_min_value_input',
        t_range_max_value_id: '#t_range_max_value_input',
        t_range_min_unit_id: '#t_range_min_unit_select',
        t_range_max_unit_id: '#t_range_max_unit_select',
        within_t_radio_name: 'within_t_radio',
        
        getAnswer: function (questionNum) {
            var value, unit, value2, unit2;
            
            switch (questionNum) {
            case 1:
                value = $(this.rated_r_value_id).val();
                unit = this.selected($(this.rated_r_unit_id));
                return [value, unit];
            case 2:
                return this.selected($(this.rated_t_id));
            case 3:
                value = $(this.measured_r_value_id).val();
                unit = this.selected($(this.measured_r_unit_id));
                return [value, unit];
            case 4:
                value = $(this.t_range_min_value_id).val();
                unit = this.selected($(this.t_range_min_unit_id));
                value2 = $(this.t_range_max_value_id).val();
                unit2 = this.selected($(this.t_range_max_unit_id));
                return [value, unit, value2, unit2];
            case 5:
                return $("input[@name='" + this.within_t_radio_name + "']:checked").val();
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
