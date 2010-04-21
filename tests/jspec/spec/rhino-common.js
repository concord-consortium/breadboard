load('spec/support/env.rhino.js');

load('../../lib/jquery/jquery-1.3.2.js');
load('../../lib/jquery/jquery.url.packed.js');
load('../../lib/json2.js');

load('spec/lib/jspec.js');
load('spec/lib/jspec.timers.js');
load('spec/lib/jspec.jquery.js');
load('spec/lib/jspec.xhr.js');
load('spec/lib/jspec.shell.js');
load('spec/support/junit.xml.js');

load('../../activities/measuring-resistance/javascript/assessment/feedback.js');
load('../../activities/measuring-resistance/javascript/assessment/grader.js');
load('../../activities/measuring-resistance/javascript/assessment/log_parser.js');
load('../../common/javascript/util/util.js');
load('../../common/javascript/sparks-init.js');
load('../../common/javascript/flash_comm.js');
load('../../common/javascript/circuit/r-values.js');
load('../../common/javascript/circuit/resistor.js');
load('../../common/javascript/circuit/resistor-4band.js');
load('../../common/javascript/circuit/resistor-5band.js');
load('../../common/javascript/circuit/multimeter.js');
load('../../common/javascript/util/mymath.js');
load('../../common/javascript/util/unit.js');
load('lib/common.js');

specResults = JSpec
.exec('spec/spec.common/spec.util.js')
.exec('spec/spec.common/spec.circuit.js')
.exec('spec/spec.activities/spec.resistor_colors.js');
