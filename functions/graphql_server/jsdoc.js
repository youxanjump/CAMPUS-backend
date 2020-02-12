// config: https://jsdoc.app/about-configuring-jsdoc.html
// template: https://github.com/SoftwareBrothers/better-docs
module.exports = {
  source: {
    include: ['./src/'],
  },
  opts: {
    template: './node_modules/better-docs/',
    destination: './docs/',
    recurse: true,
  },
};
