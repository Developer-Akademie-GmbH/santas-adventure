#Update und Node.js installieren
sudo apt update && sudo apt upgrade -y
## installs nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

## download and install Node.js (you may need to restart the terminal)
nvm install 22

## verifies the right Node.js version is in the environment
node -v # should print `v22.12.0`

## verifies the right npm version is in the environment
npm -v # should print `10.9.0`



#git einrichten
sudo apt install git -y
ssh-keygen
cat .ssh/id_ed25519.pub 
git clone git@github.com:Developer-Akademie-GmbH/santas-adventure.git
cd santas-adventure/

# Autostart einrichten
npm install -g pm2
pm2 start index.js --name "santas-adventure"
pm2 startup
pm2 save

# Einrichten eines Reverse-Proxy mit Nginx
sudo apt install nginx -y
nano /etc/nginx/sites-available/santas-adventure

# Bitte folgendes einfügen und mit Ctrl + X speichern
server {
    listen 80;
    server_name hier-deine-url.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

ln -s /etc/nginx/sites-available/santas-adventure /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
