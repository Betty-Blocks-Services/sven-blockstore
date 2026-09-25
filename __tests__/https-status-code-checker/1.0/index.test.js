import httpsStatusCodeChecker from '../../../functions/https-status-code-checker/1.0';

const headers = [
  { key: 'Content-Type', value: 'application/json; charset=UTF-8' },
];

describe('HTTPS Status Code Checker', () => {
  afterEach(() => jest.restoreAllMocks());

  test('It returns only the response code.', async () => {
    const result = await httpsStatusCodeChecker({
      url: 'example.com',
      method: 'get',
      body: '',
      headers,
      protocol: 'http',
      queryParameters: [{ key: 'name', value: 'foo' }],
    });

    expect(result).toEqual({ responseCode: 200 });
  });

  test('It trims the protocol off and parses url parameters', async () => {
    const spy = jest.spyOn(global, 'fetch');

    await httpsStatusCodeChecker({
      url: 'https://test.test/{{id}}',
      method: 'get',
      body: '',
      headers,
      protocol: 'https',
      urlParameters: [{ key: 'id', value: '101' }],
    });

    expect(spy).toHaveBeenCalledWith('https://test.test/101', {
      method: 'get',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  });

  test('It parses the body parameters and sends the body', async () => {
    const spy = jest.spyOn(global, 'fetch');

    await httpsStatusCodeChecker({
      url: 'test.test/body',
      method: 'post',
      body: 'Hello {{name}}',
      headers,
      protocol: 'https',
      bodyParameters: [{ key: 'name', value: 'foo' }],
    });

    expect(spy.mock.calls[0][1].body).toBe('Hello foo');
  });

  test('It returns non-2xx status codes instead of throwing', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ status: 404 });

    const result = await httpsStatusCodeChecker({
      url: 'example.com/missing',
      method: 'get',
      protocol: 'https',
    });

    expect(result).toEqual({ responseCode: 404 });
  });

  test('It will crash when fetch throws errors.', async () => {
    await expect(
      httpsStatusCodeChecker({
        url: 'error.com',
        method: 'get',
        body: '',
        headers,
        protocol: 'http',
        queryParameters: [{ key: 'name', value: 'foo' }],
      }),
    ).rejects.toThrow('Something went wrong.');
  });
});
