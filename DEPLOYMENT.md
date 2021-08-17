## setup - production

prerequisites:
- fresh ubuntu (20.04 or later) server  
  this document was written using a fresh install of ubuntu 20.04 on a VPS.
  using older or newer versions might require tweaks.
  some service providers modify the system, and that might also require tweaks to work around.
- domain name with `A` DNS record set to IP of the server  
  it might take up to an hour for the DNS record changes to propagate.
  run `systemd-resolve --flush-caches; ping yourdomain.com -c 1` to confirm that it resolves correctly.
- ability to interact with the server via SSH

### ssh

first thing you need to do is enable the firewall without locking yourself out

    ufw allow OpenSSH
    ufw enable

confirm that you did not lock yourself out by connecting with another terminal, then proceed.  
if the other terminal fails to connect, run `ufw disable` in the first and figure out the problem.

### nginx

    apt update
    apt install -y nginx
    ufw allow "Nginx Full"

at this point, can go to your site in the browser (with `http://` protocol explicitly set in the url) to verify it's working. you should get `Welcome to nginx!` page.
if it does, then proceed

    snap install core
    snap install --classic certbot
    /snap/bin/certbot certonly --nginx

    rm /etc/nginx/sites-enabled/default
    nano /etc/nginx/sites-enabled/example.conf

paste the following into the editor (replace `example.com` with your domain) and save it (Ctrl+X, Y, Enter):

    upstream node {
        server localhost:8080;
        server localhost:8081;
        server localhost:8082;
        server localhost:8083;
    }
     
    server {
        server_name example.com;
        listen 80;
        listen [::]:80;
        return 301 https://example.com$request_uri;
    }
     
    server {
        server_name example.com;
        listen [::]:443 ssl;
        listen 443 ssl;
        ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
        include /etc/letsencrypt/options-ssl-nginx.conf;
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
        location / {
            proxy_pass http://node;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }

check nginx status (Ctrl+C to exit)

    systemctl restart nginx
    systemctl status nginx

this is an extremely barebone setup, just enough to get the app online.
it will require tweaks and enhancement that are beyond the scope of this document, for example:  
- if your app is a website rather than an API, you'll likely need to modify the config to serve files (don't do that with node)
- if you want to host multiple applications on the same server, you'll need to rewrite the config to accomodate Server Name Indication (SNI)
etc

### systemd

    useradd foo
    mkdir /var/example
    chown -R foo /var/example
    mkdir /var/log/example
    nano /etc/systemd/system/example.service

paste the following:

    [Unit]
    Description=example.com
    
    [Service]
    ExecStart=/var/example/index.js
    WorkingDirectory=/var/example
    Restart=always
    User=foo
    Environment="PROD=1"
    StandardOutput=file:/var/log/example/stdout.log
    StandardError=file:/var/log/example/stderr.log
    
    [Install]
    WantedBy=multi-user.target

### node

check node version on your development machine with `node -v`, and set the version in the url accordingly.  
for example, if `node -v` returns `v16.4.0`, the url for install is `https://deb.nodesource.com/setup_16.x`

    curl https://deb.nodesource.com/setup_16.x -o /tmp/node.sh
    chmod +x /tmp/node.sh
    /tmp/node.sh
    apt install -y nodejs

### app

use platform specific tools or git/npm to put the your app to `/var/example` directory on the server, then run:

    chmod +x /var/example/index.js
    systemctl enable example
    systemctl start example

the setup is complete and the app should be online.

check the status:

    systemctl status example

view stdout/stderr logs:

    nano /var/log/example/stdout.log
    nano /var/log/example/stderr.log