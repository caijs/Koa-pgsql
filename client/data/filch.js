import fetch from 'unfetch';

export default (...args) => {
  let uri = args[0];
  if(process.env.NODE_ENV === "development") {
    uri = "http://localhost:3000" + uri;
  }
  args[0] = uri
  return fetch(...args);
}
