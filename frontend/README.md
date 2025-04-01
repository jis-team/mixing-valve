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

### create-react-app
```bash
npx create-react-app frontend
```

</br>

## Docke container run

### cd project directory
```bash
cd frontend
```

### image build
```bash
docker build -t mixing-valve-frontend-image .
```

### container run
```bash
docker run -dit --name mixing-valve -p 3000:3000 -v ${PWD}:/usr/src/app/frontend mixing-valve-frontend-image
```