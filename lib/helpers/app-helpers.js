// solution is based on the article of Alex Bazhenov
//
// see https://medium.com/@Abazhenov/using-async-await-in-express-with-node-8-b8af872c0016 for details
export const capture = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)
