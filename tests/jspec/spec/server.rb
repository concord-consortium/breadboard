get '/lib/*' do |path|
  send_file File.dirname(__FILE__) + '/../lib/' + path
end

get '/js-libs/*' do |path|
  send_file File.dirname(__FILE__) + '/../../../js-libs/' + path
end

get '/resistor-colors/*' do |path|
  send_file File.dirname(__FILE__) + '/../../../demos/resistor-colors/' + path
end

