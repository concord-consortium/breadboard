source "http://rubygems.org"

gem "rake"

gem "sprockets",      "~> 2.9"

gem "rack"
gem "rack-reverse-proxy", :require => "rack/reverse_proxy"

# All the following are Guard related ...

gem "guard",           "~> 1.7.0"
gem "guard-shell",     "~> 0.5.1"

# FS Notification libraries for Guard (non-polling)

def darwin_only(require_as)
  RbConfig::CONFIG['host_os'] =~ /darwin/ && require_as
end

def linux_only(require_as)
  RbConfig::CONFIG['host_os'] =~ /linux/ && require_as
end

def windows_only(require_as)
  RbConfig::CONFIG['host_os'] =~ /mingw|mswin/i && require_as
end

gem 'rb-fsevent', "~> 0.9.3", :require => darwin_only('rb-fsevent')
gem 'rb-inotify', "~> 0.8.8", :require => linux_only('rb-inotify')
gem 'wdm',        "~> 0.1.0", :require => windows_only('wdm')
