module.exports = {
  publicPath: '/',
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
    },
    client: {
      entry: 'src/client.js',
      template: 'public/client.html',
    }
  }
}
