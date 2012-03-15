describe 'Using oscope with mock Flash connection'
    before
      oldOScopeView = sparks.OscilloscopeView;
      sparks.OscilloscopeView = function () {};
      sparks.OscilloscopeView.prototype = {
        getView:      function () { return $('<div>'); },
        renderSignal: function () {},
        removeTrace:  function () {},
        setModel:     function () {},
        horizontalScaleChanged: function () {},
        verticalScaleChanged:   function () {}
      };

      sparks.activityController.reset();
      stub(sparks.util, 'readCookie').and_return(null);
      mock_request().and_return(sparks.jsonSectionOScopeActivity, 'application/javascript', 200)
      sparks.config.qucsate_server_url = "http://localhost:1234/sparks/qucsator/solve";
      onDocumentReady();
      unmock_request();
    end

    after
      sparks.OscilloscopeView = oldOScopeView;
    end

    before_each
      breadModel('clear');
      receiveEvent('disconnect', 'probe|probe_black', 0);
      receiveEvent('disconnect', 'probe|probe_red', 0);
      receiveEvent('disconnect', 'probe|probe_pink', 0);
      receiveEvent('disconnect', 'probe|probe_yellow', 0);
    end

    it "should call update when an pink probe is added or removed"

      // we add a 100 ohm resistor
        breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});

        var updateCalled = false;

        var oldUpdate = sparks.circuit.Oscilloscope.prototype.update;
        sparks.circuit.Oscilloscope.prototype.update = function() {
          updateCalled = true;
        }

        receiveEvent('connect', 'probe|probe_pink|a2', 0);

        updateCalled.should.be true

        updateCalled = false;

        receiveEvent('disconnect', 'probe|probe_pink', 0);

        updateCalled.should.be true

        sparks.circuit.Oscilloscope.prototype.update = oldUpdate;

    end

    it "should not call update when a black or red probe is added or removed"

      // we add a 100 ohm resistor
          breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});

          var updateCalled = false;

          updateCalled.should.be false

          var oldUpdate = sparks.circuit.Oscilloscope.prototype.update;
          sparks.circuit.Oscilloscope.prototype.update = function() {
            updateCalled = true;
          }

          updateCalled.should.be false

          receiveEvent('connect', 'probe|probe_black|a2', 0);

          updateCalled.should.be false

          receiveEvent('connect', 'probe|probe_red|a1', 0);

          updateCalled.should.be false

          receiveEvent('disconnect', 'probe|probe_black', 0);

          updateCalled.should.be false

          sparks.circuit.Oscilloscope.prototype.update = oldUpdate;

    end

end