# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Base Settings (WSL)

If node.js, npm, npx is not installed, do the following :

### Node.js install
```bash
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### npm, npx install
```bash
sudo apt-get install -y build-essential
sudo npm install npx -g
```

</br>

## Docker Compose

### clone this repository
```bash
git clone https://github.com/jis-team/mixing-valve.git
```

### frontend npm install
```bash
cd frontend
npm install
cd ..
```

### backend npm install
```bash
cd backend
npm install
cd ..
```

### docker-compose
```bash
docker-compose up -d
```