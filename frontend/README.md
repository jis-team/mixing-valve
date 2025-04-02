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

## Docke container run

### clone this repository
```bash
git clone https://github.com/jis-team/mixing-valve.git
```

### cd project directory
```bash
cd frontend
```

### npm install
```bash
npm install
```

### image build
- check port number in Dockerfile
```bash
docker build -t mixing-valve-frontend-image .
```

### container run
- check port number in Dockerfile
```bash
docker run -dit --name mixing-valve -p 3001:3000 -v ${PWD}:/usr/src/app/frontend -e .env mixing-valve-frontend-image
```