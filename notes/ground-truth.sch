<Qucs Schematic 0.0.16>
<Properties>
  <View=0,0,1030,800,1,0,0>
  <Grid=10,10,1>
  <DataSet=ground-truth.dat>
  <DataDisplay=ground-truth.dpl>
  <OpenDisplay=1>
  <Script=ground-truth.m>
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
  <C C1 1 250 170 17 -26 0 1 "0.0000001592 F" 1 "" 0 "neutral" 0>
  <Vac V1 1 100 200 18 -26 0 1 "10 V" 1 "1 GHz" 0 "0" 0 "0" 0>
  <GND * 1 100 310 0 0 0 0>
  <.AC AC1 1 460 160 0 37 0 0 "const" 1 "1 GHz" 0 "10 GHz" 0 "[1000 Hz]" 1 "no" 0>
  <R R1 1 250 230 15 -26 0 1 "1000 Ohm" 1 "26.85" 0 "0.0" 0 "0.0" 0 "26.85" 0 "US" 0>
</Components>
<Wires>
  <100 230 100 270 "" 0 0 0 "">
  <100 140 100 170 "" 0 0 0 "">
  <100 140 250 140 "V1" 250 110 111 "">
  <250 260 250 270 "" 0 0 0 "">
  <100 270 100 310 "" 0 0 0 "">
  <100 270 250 270 "" 0 0 0 "">
  <250 200 250 200 "V2" 210 190 0 "">
</Wires>
<Diagrams>
  <Tab 680 270 300 200 3 #c0c0c0 1 00 1 0 1 1 1 0 1 1 1 0 1 1 315 0 225 "" "" "">
	<"V1.v" #0000ff 0 3 1 0 0>
	<"V2.v" #0000ff 0 3 1 0 0>
  </Tab>
</Diagrams>
<Paintings>
</Paintings>
