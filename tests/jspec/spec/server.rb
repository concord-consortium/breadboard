get '/lib/*' do |path|
  send_file File.dirname(__FILE__) + '/../lib/' + path
end

get '/sparks/*' do |path|
  send_file File.dirname(__FILE__) + '/../../../' + path
end

get '/resistor-colors/*' do |path|
  send_file File.dirname(__FILE__) + '/../../../demos/resistor-colors/' + path
end

