<Qucs Schematic 0.0.16>
<Properties>
  <View=-142,-230,1209,574,1,29,0>
  <Grid=10,10,1>
  <DataSet=LCR-4.dat>
  <DataDisplay=LCR-4.dpl>
  <OpenDisplay=1>
  <Script=LCR-4.m>
  <RunScript=0>
  <showFrame=0>
  <FrameText0=Title>
  <FrameText1=Drawn By:>
  <FrameText2=Date:>
  <FrameText3=Revision:>
</Properties>
<Symbol>
</Symbol>
<Components>
  <.AC AC1 1 -30 -170 0 37 0 0 "lin" 1 "15.92" 1 "3184" 1 "200" 1 "no" 0>
  <IProbe Iinductor 1 380 0 16 -26 1 3>
  <IProbe Icap 1 290 0 -42 -26 0 3>
  <GND * 1 340 120 0 0 0 0>
  <C C1 1 290 -50 -70 -26 0 3 "10 uF" 1 "" 0 "neutral" 0>
  <L L1 1 380 -50 10 -26 0 1 "1mH" 1 "" 0>
  <R R1 1 340 90 15 -26 0 1 "100 Ohm" 1 "26.85" 0 "0.0" 0 "0.0" 0 "26.85" 0 "US" 0>
  <Vac V1 1 340 -120 18 -26 0 1 "1 V" 1 "1 GHz" 0 "0" 0 "0" 0>
  <GND * 1 300 -150 0 0 0 0>
</Components>
<Wires>
  <380 30 380 40 "" 0 0 0 "">
  <290 30 290 40 "" 0 0 0 "">
  <290 -30 290 -20 "" 0 0 0 "">
  <380 -30 380 -20 "" 0 0 0 "">
  <290 40 340 40 "" 0 0 0 "">
  <340 40 380 40 "" 0 0 0 "">
  <340 40 340 60 "Vout" 240 70 10 "">
  <290 -80 340 -80 "" 0 0 0 "">
  <340 -80 380 -80 "" 0 0 0 "">
  <340 -90 340 -80 "" 0 0 0 "">
  <300 -150 340 -150 "" 0 0 0 "">
</Wires>
<Diagrams>
  <Rect -60 140 240 160 3 #c0c0c0 1 00 1 0 0.2 1 1 -0.1 0.5 1.1 1 -0.1 0.5 1.1 315 0 225 "" "" "">
	<"Vout.v" #0000ff 0 3 0 0 0>
  </Rect>
  <Tab 510 215 286 405 3 #c0c0c0 1 00 1 0 1 1 1 0 1 1 1 0 1 200 315 0 225 "" "" "">
	<"Vout.v" #0000ff 0 3 1 0 0>
  </Tab>
</Diagrams>
<Paintings>
  <Text -100 200 12 #000000 0 "min of V_{out} is at \x03C9 = 10^4 (f = 10^4 / 2\x03C0 = 1592 Hz)">
</Paintings>
