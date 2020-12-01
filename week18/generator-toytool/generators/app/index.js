var Generator = require("yeoman-generator");

module.exports = class extends Generator {
  // The name `constructor` is important here
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);
  }

  async ask() {
    const answers = await this.prompt([
      {
        type: "input",
        name: "name",
        message: "Your project name",
        default: this.appname // Default to current folder name
      }
    ]);
    answers.name = answers.name.replace(/\s+/g, '-');
    this.config.set('answers',answers);

    this.log(this.config.getAll());
  }

  initPackageJson() {
    const pkgJson = {
      "name": this.config.get('answers').name,
      "version": "1.0.0",
      "description": "",
      "main": "main.js",
      "scripts": {
        "test": "cross-env NODE_ENV=test mocha --require @babel/register",
        "build": "cross-env NODE_ENV=production webpack",
        "coverage": "cross-env NODE_ENV=test nyc mocha --require @babel/register",
        "start:dev": "cross-env NODE_ENV=dev webpack serve",
      },
      "author": "",
      "license": "ISC",
    };

    // Extend or create package.json file in destination path
    this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
    this.npmInstall(['vue@2']);
    this.npmInstall([
      "cross-env",
      "webpack", 
      "webpack-cli",
      "webpack-dev-server",
      "vue-loader", 
      "vue-style-loader", 
      "css-loader",
      "vue-template-compiler",
      "copy-webpack-plugin",
      "babel-loader",
      "@babel/core",
      "@babel/preset-env",
      "@babel/register",
      "@istanbuljs/nyc-config-babel",
      "babel-plugin-istanbul",
      "mocha",
      "nyc",
    ], { "save-dev": true});

  }

  copyFiles() {
		this.fs.copyTpl(
			this.templatePath('src/HelloWorld.vue'),
			this.destinationPath('src/HelloWorld.vue')
		);
		this.fs.copyTpl(
			this.templatePath('src/main.js'),
			this.destinationPath('src/main.js')
    );
    this.fs.copyTpl(
      this.templatePath('src/index.html'),
      this.destinationPath('src/index.html'),
      { title: this.config.get('answers').name }
    );
    this.fs.copyTpl(
			this.templatePath('webpack.config.js'),
			this.destinationPath('webpack.config.js')
		);
    this.fs.copyTpl(
      this.templatePath('babel.config.json'),
      this.destinationPath('babel.config.json'),
    );
    this.fs.copyTpl(
      this.templatePath('nyc.config.js'),
      this.destinationPath('nyc.config.js'),
    );
    this.fs.copyTpl(
      this.templatePath('test/test.sample.js'),
      this.destinationPath('test/test.sample.js'),
    );
    
	}
};
