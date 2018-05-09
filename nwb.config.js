module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'reactDOMlessMedia',
      externals: {
        react: 'React'
      }
    }
  }
}
