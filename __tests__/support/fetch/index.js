const fetch = async (url, _options) => {
  if (url === 'http://error.com?name=foo') {
    throw new Error('Something went wrong.');
  }
  return { status: 200, statusText: 'OK', url };
};

export default fetch;
