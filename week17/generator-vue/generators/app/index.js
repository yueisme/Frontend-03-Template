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
        "build": "webpack",
        "dev-server": "webpack serve"
      },
      "author": "",
      "license": "ISC",
    };

    // Extend or create package.json file in destination path
    this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
    this.npmInstall(['vue@2']);
    this.npmInstall([
      "webpack", 
      "webpack-cli",
      "vue-loader", 
      "vue-style-loader", 
      "css-loader",
      "vue-template-compiler",
      "copy-webpack-plugin",
      "babel-loader",
      "@babel/core",
      "@babel/preset-env",
    ], { "save-dev": true});

  }

  copyFiles() {
		this.fs.copyTpl(
			this.templatePath('HelloWorld.vue'),
			this.destinationPath('src/HelloWorld.vue')
		);
		this.fs.copyTpl(
			this.templatePath('webpack.config.js'),
			this.destinationPath('webpack.config.js')
		);
		this.fs.copyTpl(
			this.templatePath('main.js'),
			this.destinationPath('src/main.js')
    );
    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('src/index.html'),
      { title: this.config.get('answers').name }
    );
    this.fs.copyTpl(
      this.templatePath('babel.config.json'),
      this.destinationPath('src/babel.config.json'),
    );
	}
};
